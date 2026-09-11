import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Animated, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  type AudioStreamBuffer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioStream,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { Camera, useCameraDevice, useCameraPermission, useFrameOutput } from 'react-native-vision-camera';
import { scheduleOnRN } from 'react-native-worklets';
import { useAppStore } from '../../src/store/appStore';
import { translatePet, analyzePhoto, analyzeVideo } from '../../src/engine/petEngine';
import {
  analyzeMeteringSamples,
  buildWaveformLevels,
  meteringToVolume,
  MeteringSample,
} from '../../src/engine/audioFeatureEngine';
import {
  mergePcmChunks,
  pcmBufferToMonoFloat32,
  pcmToMeteringDb,
  YAMNET_INPUT_SAMPLES,
} from '../../src/engine/petSoundRecognitionEngine';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/constants/theme';
import { WaveformVisualizer } from '../../src/components/translator/WaveformVisualizer';
import { PetPatternLayer } from '../../src/components/ui/TexturedBackground';
import {
  Pet,
  PetSoundRecognition,
  PetType,
  PetVisionObservation,
  TranslationMode,
  VideoMemeProject,
} from '../../src/types';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { trackEvent } from '../../src/services/analyticsService';
import { recognizePetSound, usePetSoundClassifier } from '../../src/services/petSoundModel';
import {
  decodeObjectDetectionOutputs,
  frameBufferToModelInput,
  MODEL_INPUT_HEIGHT,
  MODEL_INPUT_WIDTH,
  usePetObjectDetector,
} from '../../src/services/petVisionModel';

const LIVE_WAVEFORM_HISTORY = 64;
const WAVEFORM_BAR_COUNT = 32;
const ANALYSIS_WAVEFORM_POINTS = 96;
const LIVE_INFERENCE_INTERVAL_MS = 350;
const MAX_CAPTURE_SECONDS = 30;
const TRANSLATION_MODES: TranslationMode[] = ['sound', 'photo', 'video'];

function firstParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isTranslationMode(value?: string): value is TranslationMode {
  return TRANSLATION_MODES.includes(value as TranslationMode);
}

function createQuickPet(type: PetType, catName: string, dogName: string): Pet {
  return {
    id: `quick-${type}`,
    name: type === 'cat' ? catName : dogName,
    type,
    gender: 'male',
    personality: {
      arrogance: 50,
      curiosity: 60,
      laziness: 45,
      friendliness: 65,
      intelligence: 60,
      drama: 55,
      gluttony: 55,
      energy: 55,
    },
    createdAt: Date.now(),
  };
}

function getWaveformWindow(levels: number[], windowSize: number, progress: number): number[] {
  if (levels.length <= windowSize) return levels;
  const safeProgress = Math.max(0, Math.min(1, progress));
  const maxStart = levels.length - windowSize;
  const start = Math.round(maxStart * safeProgress);
  return levels.slice(start, start + windowSize);
}

export default function TranslateScreen() {
  const { petId: petIdParam, mode: initialMode, quickType: quickTypeParam } = useLocalSearchParams<{
    petId: string | string[];
    mode?: string | string[];
    quickType?: string | string[];
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useTranslation();

  const pets = useAppStore((s) => s.pets);
  const addTranslation = useAppStore((s) => s.addTranslation);
  const selectedCharacter = useAppStore((s) => s.selectedCharacter);
  const getPetMemory = useAppStore((s) => s.getPetMemory);
  const addMemeProject = useAppStore((s) => s.addMemeProject);
  const awardXP = useAppStore((s) => s.awardXP);

  const petId = firstParam(petIdParam);
  const requestedMode = firstParam(initialMode);
  const mode = isTranslationMode(requestedMode) ? requestedMode : 'sound';
  const quickType = firstParam(quickTypeParam) === 'dog' ? 'dog' : 'cat';
  const isQuickMode = petId === 'quick';
  const quickPet = useMemo(
    () => createQuickPet(quickType, t.translate.quickCatName, t.translate.quickDogName),
    [quickType, t]
  );
  const pet = pets.find((p) => p.id === petId) || (isQuickMode ? quickPet : undefined);

  const [phase, setPhase] = useState<'idle' | 'recording' | 'analyzing' | 'done'>('idle');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([]);
  const [isLiveAnalyzing, setIsLiveAnalyzing] = useState(false);
  const [liveObservation, setLiveObservation] = useState<PetVisionObservation | null>(null);
  const meteringSamplesRef = useRef<MeteringSample[]>([]);
  const modelObservationsRef = useRef<PetVisionObservation[]>([]);
  const lastInferenceAtRef = useRef(0);
  const waveformLevelsRef = useRef<number[]>([]);
  const analysisWaveformRef = useRef<number[]>([]);
  const analysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingActiveRef = useRef(false);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const pcmSampleCountRef = useRef(0);
  const pcmSampleRateRef = useRef(16000);
  const recognitionRef = useRef<PetSoundRecognition | undefined>(undefined);
  const recognitionRequestRef = useRef(0);

  const handleAudioBuffer = useCallback((buffer: AudioStreamBuffer) => {
    if (!recordingActiveRef.current) return;

    const samples = pcmBufferToMonoFloat32(buffer.data, buffer.channels);
    if (samples.length === 0) return;

    pcmSampleRateRef.current = buffer.sampleRate;
    pcmChunksRef.current.push(samples);
    pcmSampleCountRef.current += samples.length;

    const maxSamples = Math.max(1, buffer.sampleRate * MAX_CAPTURE_SECONDS);
    while (pcmSampleCountRef.current > maxSamples && pcmChunksRef.current.length > 1) {
      const removed = pcmChunksRef.current.shift();
      pcmSampleCountRef.current -= removed?.length || 0;
    }

    const metering = pcmToMeteringDb(samples);
    const timeMs = Math.max(0, buffer.timestamp * 1000);
    meteringSamplesRef.current.push({ timeMs, metering });

    const nextLevels = [...waveformLevelsRef.current, meteringToVolume(metering)].slice(-LIVE_WAVEFORM_HISTORY);
    waveformLevelsRef.current = nextLevels;
    setWaveformLevels(nextLevels);
  }, []);

  const audioStream = useAudioStream({
    sampleRate: 16000,
    channels: 1,
    encoding: 'float32',
    onBuffer: handleAudioBuffer,
  });
  const audioStreamRef = useRef(audioStream.stream);
  audioStreamRef.current = audioStream.stream;
  const soundClassifier = usePetSoundClassifier();
  const cameraDevice = useCameraDevice('back');
  const cameraPermission = useCameraPermission();
  const detector = usePetObjectDetector();
  const detectorModel = detector.state === 'loaded' ? detector.model : undefined;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const ANALYSIS_STEPS = t.translate.analysisSteps;

  useEffect(() => {
    if (!pet) { Alert.alert(t.translate.petNotFound); router.back(); }
  }, [pet, router, t]);

  useEffect(() => {
    return () => {
      recognitionRequestRef.current += 1;
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
      if (recordingActiveRef.current) {
        recordingActiveRef.current = false;
        try {
          audioStreamRef.current.stop();
        } catch {}
      }
      void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (phase === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [phase]);

  const handleLiveObservation = useCallback((observation: PetVisionObservation) => {
    modelObservationsRef.current = [observation, ...modelObservationsRef.current].slice(0, 12);
    lastInferenceAtRef.current = Date.now();
    setLiveObservation(observation);
  }, []);

  const frameOutputResolution = useMemo(
    () => ({ width: MODEL_INPUT_WIDTH, height: MODEL_INPUT_HEIGHT }),
    []
  );

  const frameOutput = useFrameOutput({
    targetResolution: frameOutputResolution,
    pixelFormat: 'rgb',
    dropFramesWhileBusy: true,
    enablePreviewSizedOutputBuffers: true,
    enablePhysicalBufferRotation: true,
    onFrame(frame) {
      'worklet';
      try {
        if (detectorModel == null || !isLiveAnalyzing || !frame.hasPixelBuffer) {
          return;
        }

        const input = frameBufferToModelInput(
          frame.getPixelBuffer(),
          frame.width,
          frame.height,
          frame.bytesPerRow
        );
        const outputs = detectorModel.runSync([input]);
        const observation = decodeObjectDetectionOutputs(outputs, frame.timestamp);
        if (observation != null) {
          scheduleOnRN(handleLiveObservation, observation);
        }
      } finally {
        frame.dispose();
      }
    },
  });

  const cameraOutputs = useMemo(() => [frameOutput], [frameOutput]);
  const cameraConstraints = useMemo(() => [{ fps: 3 }], []);

  const runAnalysis = (
    uri?: string,
    asset?: ImagePicker.ImagePickerAsset,
    modelObservations: PetVisionObservation[] = modelObservationsRef.current.slice()
  ) => {
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);

    setPhase('analyzing');
    setAnalysisStep(0);
    progressAnim.setValue(0);
    setIsLiveAnalyzing(false);

    if (mode === 'sound') {
      const analysisLevels = buildWaveformLevels(meteringSamplesRef.current, ANALYSIS_WAVEFORM_POINTS);
      analysisWaveformRef.current = analysisLevels;
      const firstWindow = getWaveformWindow(analysisLevels, WAVEFORM_BAR_COUNT, 0);
      waveformLevelsRef.current = firstWindow;
      setWaveformLevels(firstWindow);
    }

    Animated.timing(progressAnim, { toValue: 1, duration: 2500, useNativeDriver: false }).start();

    let step = 0;
    analysisIntervalRef.current = setInterval(() => {
      step++;
      setAnalysisStep(step);
      if (mode === 'sound' && analysisWaveformRef.current.length > 0) {
        const nextWindow = getWaveformWindow(
          analysisWaveformRef.current,
          WAVEFORM_BAR_COUNT,
          step / (ANALYSIS_STEPS.length - 1)
        );
        waveformLevelsRef.current = nextWindow;
        setWaveformLevels(nextWindow);
      }
      if (step >= ANALYSIS_STEPS.length - 1) {
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        analysisTimeoutRef.current = setTimeout(() => finishTranslation(uri, asset, modelObservations), 600);
      }
    }, 500);
  };

  const finishTranslation = (
    uri?: string,
    asset?: ImagePicker.ImagePickerAsset,
    modelObservations: PetVisionObservation[] = modelObservationsRef.current.slice()
  ) => {
    if (!pet) return;
    const memory = getPetMemory(pet.id);
    let result;
    if (mode === 'photo') {
      result = analyzePhoto(pet, selectedCharacter, memory, {
        width: asset?.width,
        height: asset?.height,
        fileSize: asset?.fileSize,
      }, language);
    } else if (mode === 'video') {
      result = analyzeVideo(pet, selectedCharacter, memory, {
        sourceUri: uri || '',
        projectId: Date.now().toString(),
        width: asset?.width,
        height: asset?.height,
        fileSize: asset?.fileSize,
        durationMs: asset?.duration,
        modelObservations,
      }, language);
    } else {
      const signal = analyzeMeteringSamples(meteringSamplesRef.current);
      result = translatePet(
        pet,
        selectedCharacter,
        memory,
        signal,
        recognitionRef.current,
        language
      );
    }

    const { memeProject, ...rawStoredResult } = result as typeof result & { memeProject?: VideoMemeProject };
    if (memeProject?.sourceUri) addMemeProject(memeProject);
    const storedResult = memeProject?.sourceUri
      ? rawStoredResult
      : { ...rawStoredResult, memeProjectId: undefined };
    const full = { ...storedResult, id: Date.now().toString(), createdAt: Date.now(), mediaUri: uri };
    addTranslation(full);
    trackEvent('translation_completed', {
      mode,
      character: selectedCharacter,
      petType: pet.type,
      soundClass: recognitionRef.current?.top?.label,
    });
    awardXP(3);
    setPhase('done');
    router.replace(`/result/${full.id}`);
  };

  const startRecording = async () => {
    if (soundClassifier.state !== 'loaded' || !soundClassifier.model) {
      Alert.alert(
        soundClassifier.state === 'error' ? t.translate.soundModelFailed : t.translate.soundModelLoading,
        soundClassifier.state === 'error' ? t.translate.soundModelFailedText : t.translate.soundModelLoadingText
      );
      return;
    }

    const requestId = ++recognitionRequestRef.current;
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) { Alert.alert(t.translate.needMic); return; }
      if (requestId !== recognitionRequestRef.current) return;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      if (requestId !== recognitionRequestRef.current) {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
        return;
      }
      meteringSamplesRef.current = [];
      pcmChunksRef.current = [];
      pcmSampleCountRef.current = 0;
      pcmSampleRateRef.current = 16000;
      recognitionRef.current = undefined;
      waveformLevelsRef.current = [];
      analysisWaveformRef.current = [];
      setWaveformLevels([]);
      recordingActiveRef.current = true;
      await audioStream.stream.start();
      if (requestId !== recognitionRequestRef.current) {
        recordingActiveRef.current = false;
        audioStream.stream.stop();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
        return;
      }
      setPhase('recording');
    } catch (e) {
      recordingActiveRef.current = false;
      try {
        audioStream.stream.stop();
      } catch {}
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
      if (requestId !== recognitionRequestRef.current) return;
      Alert.alert(t.translate.recordError);
    }
  };

  const stopRecording = async () => {
    if (!recordingActiveRef.current) return;
    recordingActiveRef.current = false;
    const requestId = ++recognitionRequestRef.current;
    try {
      audioStream.stream.stop();
      setPhase('analyzing');
      setAnalysisStep(0);

      const signal = analyzeMeteringSamples(meteringSamplesRef.current);
      const pcm = mergePcmChunks(pcmChunksRef.current);
      const sampleRate = pcmSampleRateRef.current;
      const durationSamples = sampleRate > 0 ? pcm.length : 0;

      if (durationSamples < Math.ceil(YAMNET_INPUT_SAMPLES * sampleRate / 16000)) {
        setPhase('idle');
        Alert.alert(t.translate.soundTooShort, t.translate.soundTooShortText);
        return;
      }

      if (!soundClassifier.model) {
        setPhase('idle');
        Alert.alert(t.translate.soundModelFailed, t.translate.soundModelFailedText);
        return;
      }

      const recognition = await recognizePetSound(
        soundClassifier.model,
        pcm,
        sampleRate,
        pet?.type || quickType,
        signal.signalQuality
      );
      if (requestId !== recognitionRequestRef.current) return;

      if (recognition.status === 'wrong_species') {
        setPhase('idle');
        Alert.alert(
          t.translate.wrongSpeciesTitle,
          pet?.type === 'cat' ? t.translate.wrongSpeciesCat : t.translate.wrongSpeciesDog
        );
        return;
      }
      if (recognition.status === 'no_pet_sound') {
        setPhase('idle');
        Alert.alert(t.translate.noPetSoundTitle, t.translate.noPetSoundText);
        return;
      }
      if (recognition.status === 'low_confidence') {
        setPhase('idle');
        Alert.alert(t.translate.soundUncertainTitle, t.translate.soundUncertainText);
        return;
      }
      if (recognition.status === 'too_short') {
        setPhase('idle');
        Alert.alert(t.translate.soundTooShort, t.translate.soundTooShortText);
        return;
      }

      recognitionRef.current = recognition;
      const finalLevels = buildWaveformLevels(meteringSamplesRef.current, WAVEFORM_BAR_COUNT);
      if (finalLevels.length > 0) {
        waveformLevelsRef.current = finalLevels;
        setWaveformLevels(finalLevels);
      }
      runAnalysis();
    } catch (e) {
      if (requestId !== recognitionRequestRef.current) return;
      setPhase('idle');
      Alert.alert(t.translate.soundModelFailed, t.translate.soundModelFailedText);
    } finally {
      recordingActiveRef.current = false;
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    }
  };

  const handleBack = async () => {
    recognitionRequestRef.current += 1;
    if (recordingActiveRef.current) {
      recordingActiveRef.current = false;
      try {
        audioStream.stream.stop();
      } catch {}
    }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    router.back();
  };

  const handlePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t.translate.needPhotoAccess); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) runAnalysis(result.assets[0]?.uri, result.assets[0]);
  };

  const handleVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t.translate.needMediaAccess); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });
    if (!result.canceled) runAnalysis(result.assets[0]?.uri, result.assets[0]);
  };

  const startLiveAnalysis = async () => {
    if (detector.state === 'error') {
      Alert.alert(t.translate.modelFailed, t.translate.noPetInFrameText);
      return;
    }

    const granted = cameraPermission.hasPermission || await cameraPermission.requestPermission();
    if (!granted) {
      Alert.alert(t.translate.needCamera, t.translate.needCameraText);
      return;
    }

    modelObservationsRef.current = [];
    lastInferenceAtRef.current = 0;
    setLiveObservation(null);
    setIsLiveAnalyzing(true);
  };

  const stopLiveAnalysis = () => {
    setIsLiveAnalyzing(false);
  };

  const useLiveAnalysisResult = () => {
    if (modelObservationsRef.current.length === 0) {
      Alert.alert(t.translate.noPetInFrame, t.translate.noPetInFrameText);
      return;
    }
    runAnalysis(undefined, undefined, modelObservationsRef.current.slice());
  };

  if (!pet) return null;

  const modeConfig = {
    sound: { emoji: '🎙️', title: t.translate.soundTitle, color: COLORS.gradientDuo },
    photo: { emoji: '📸', title: t.translate.photoTitle, color: COLORS.gradientSun },
    video: { emoji: '🎬', title: t.translate.videoTitle, color: COLORS.gradientSky },
  };

  const cfg = modeConfig[mode];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={colors.gradientApple} style={styles.container}>
        <PetPatternLayer />
        <View style={styles.decorBubbleOne} />
        <View style={styles.decorBubbleTwo} />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{cfg.title}</Text>
          <View style={[styles.stepPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.stepPillText}>{phase === 'idle' ? '1' : '2'}/2</Text>
          </View>
        </View>

        <View style={[styles.petInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.petAvatar}>
            <Text style={styles.petEmoji}>{pet.type === 'cat' ? '🐱' : '🐶'}</Text>
          </View>
          <View style={styles.petCopy}>
            <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
            <Text style={[styles.petSub, { color: colors.textSub }]}>
              {pet.type === 'cat' ? t.addPet.cat : t.addPet.dog}
            </Text>
          </View>
          <View style={[styles.modeBadge, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={styles.modeBadgeEmoji}>{cfg.emoji}</Text>
          </View>
        </View>

        {mode === 'sound' && phase === 'idle' && (
          <View style={[styles.recordingTip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.recordingTipTitle, { color: colors.text }]}>{t.translate.recordingTipTitle}</Text>
            <Text style={[styles.recordingTipText, { color: colors.textSub }]}>
              {t.translate.recordingTipText}
            </Text>
            <View style={styles.soundModelStatus}>
              <View
                style={[
                  styles.soundModelDot,
                  {
                    backgroundColor: soundClassifier.state === 'loaded'
                      ? COLORS.primary
                      : soundClassifier.state === 'error'
                        ? COLORS.danger
                        : COLORS.warning,
                  },
                ]}
              />
              <Text style={[styles.soundModelStatusText, { color: colors.textSub }]}>
                {soundClassifier.state === 'loaded'
                  ? t.translate.soundModelReady
                  : soundClassifier.state === 'error'
                    ? t.translate.soundModelFailed
                    : t.translate.soundModelLoading}
              </Text>
            </View>
          </View>
        )}

        {phase === 'idle' && (
          <View style={styles.idleContainer}>
            <View style={[styles.instructionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.instructionStep}>01</Text>
              <Text style={[styles.instruction, { color: colors.text }]}>
                {mode === 'sound' ? t.translate.soundInstruction :
                 mode === 'photo' ? t.translate.photoInstruction :
                 t.translate.videoInstruction}
              </Text>
            </View>

            {mode === 'video' && (
              <View style={styles.livePanel}>
                {isLiveAnalyzing && cameraDevice ? (
                  <Camera
                    style={styles.liveCamera}
                    device={cameraDevice}
                    isActive={isLiveAnalyzing}
                    outputs={cameraOutputs}
                    constraints={cameraConstraints}
                    resizeMode="cover"
                    pointerEvents="auto"
                    onLayout={() => {}}
                    nativeID="live-camera"
                  />
                ) : (
                  <View style={styles.liveCameraPlaceholder}>
                    <Text style={styles.livePlaceholderText}>
                      {detector.state === 'loaded' ? t.translate.modelReady : detector.state === 'loading' ? t.translate.modelLoading : t.translate.modelFailed}
                    </Text>
                  </View>
                )}
                <Text style={styles.liveResultText}>
                  {liveObservation
                    ? liveObservation.label === 'cat'
                      ? t.translate.detectedCat
                      : t.translate.detectedDog
                    : t.translate.noDetectionYet}
                </Text>
                <View style={styles.liveActions}>
                  <TouchableOpacity onPress={isLiveAnalyzing ? stopLiveAnalysis : startLiveAnalysis} style={styles.liveAction}>
                    <Text style={styles.liveActionText}>{isLiveAnalyzing ? t.translate.stopLive : t.translate.liveAnalysis}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={useLiveAnalysisResult} style={styles.liveAction}>
                    <Text style={styles.liveActionText}>{t.translate.useLiveResult}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === 'sound' ? (
              <TouchableOpacity
                onPress={startRecording}
                disabled={soundClassifier.state !== 'loaded'}
                accessibilityRole="button"
                accessibilityLabel={t.translate.startRecording}
                activeOpacity={0.9}
                style={soundClassifier.state !== 'loaded' ? styles.disabledAction : undefined}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <LinearGradient colors={cfg.color} style={[styles.recordBtn, styles.recordBtnSound]}>
                    <View style={styles.recordIconDisc}>
                      <Text style={styles.recordBtnEmoji}>🎙️</Text>
                    </View>
                    <Text style={styles.recordBtnText}>{t.translate.startRecording}</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={mode === 'photo' ? handlePhoto : handleVideo}
                accessibilityRole="button"
                accessibilityLabel={mode === 'photo' ? t.translate.pickPhoto : t.translate.pickVideo}
                activeOpacity={0.9}
              >
                <LinearGradient colors={cfg.color} style={styles.recordBtn}>
                  <View style={styles.recordIconDisc}>
                    <Text style={styles.recordBtnEmoji}>{cfg.emoji}</Text>
                  </View>
                  <Text style={styles.recordBtnText}>
                    {mode === 'photo' ? t.translate.pickPhoto : t.translate.pickVideo}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {phase === 'recording' && (
          <View style={styles.recordingContainer}>
            <View style={styles.listeningEmojiWrap}>
              <Text style={styles.listeningEmoji}>👂</Text>
            </View>
            <Text style={styles.recordingLabel}>{t.translate.recording}</Text>
            <WaveformVisualizer
              isActive={true}
              levels={waveformLevels}
              color={COLORS.primary}
              barCount={WAVEFORM_BAR_COUNT}
            />
            <Text style={[styles.recordingHint, { color: colors.textSub }]}>{t.translate.stopHint}</Text>
            <TouchableOpacity
              onPress={stopRecording}
              accessibilityRole="button"
              accessibilityLabel={t.translate.stopRecording}
              activeOpacity={0.88}
            >
              <LinearGradient colors={COLORS.gradientBerry} style={styles.stopBtn}>
                <Text style={styles.stopBtnText}>{t.translate.stopRecording}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'analyzing' && (
          <View style={styles.analyzingContainer}>
            <View style={styles.analyzingMascot}>
              <Text style={styles.analyzingMascotEmoji}>🐾</Text>
            </View>
            <Text style={[styles.analyzingTitle, { color: colors.text }]}>{t.translate.analyzing}</Text>
            <Text style={styles.analyzingStep}>{ANALYSIS_STEPS[analysisStep] || ANALYSIS_STEPS[ANALYSIS_STEPS.length - 1]}</Text>
            {mode === 'sound' && (
              <WaveformVisualizer
                isActive={true}
                levels={waveformLevels}
                color={COLORS.primary}
                barCount={WAVEFORM_BAR_COUNT}
              />
            )}
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.analyzingDisclaimer, { color: colors.textMuted }]}>
              {t.translate.analyzingDisclaimer}
            </Text>
          </View>
        )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  screenScroll: { flex: 1 },
  screenScrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    minHeight: 640,
    overflow: 'hidden',
  },
  decorBubbleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -95,
    top: 90,
    backgroundColor: 'rgba(109,74,255,0.06)',
  },
  decorBubbleTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    left: -70,
    bottom: 70,
    backgroundColor: 'rgba(50,199,229,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: FONTS.weights.medium,
    marginTop: -3,
  },
  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  stepPill: {
    minWidth: 44,
    height: 44,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPillText: {
    color: COLORS.primary,
    fontFamily: FONTS.family.display,
    fontSize: 12,
    fontWeight: FONTS.weights.black,
  },
  petInfo: {
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 12,
    minHeight: 78,
    borderRadius: 25,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.sm,
  },
  petAvatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0D7',
  },
  petEmoji: {
    fontSize: 32,
  },
  petCopy: {
    flex: 1,
    gap: 2,
  },
  petName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
  petSub: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  modeBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadgeEmoji: {
    fontSize: 25,
  },
  recordingTip: {
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    gap: 4,
  },
  recordingTipTitle: {
    color: COLORS.primary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.black,
  },
  recordingTipText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
  soundModelStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 3,
  },
  soundModelDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  soundModelStatusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  disabledAction: {
    opacity: 0.55,
  },
  idleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 20,
  },
  instructionCard: {
    width: '100%',
    maxWidth: 420,
    minHeight: 86,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionStep: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: 14,
    lineHeight: 42,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
    overflow: 'hidden',
  },
  instruction: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    lineHeight: 22,
  },
  recordBtn: {
    width: 196,
    height: 196,
    borderRadius: 70,
    borderWidth: 7,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...SHADOWS.lg,
  },
  recordBtnSound: {
    transform: [{ rotate: '-2deg' }],
  },
  recordIconDisc: {
    width: 80,
    height: 80,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  recordBtnEmoji: {
    fontSize: 42,
  },
  recordBtnText: {
    maxWidth: 142,
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    lineHeight: 20,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  livePanel: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 12,
    gap: 10,
    backgroundColor: 'rgba(44,38,64,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  liveCamera: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, overflow: 'hidden', backgroundColor: '#111827' },
  liveCameraPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  livePlaceholderText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  liveResultText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, textAlign: 'center' },
  liveActions: { flexDirection: 'row', gap: 8 },
  liveAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  liveActionText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black },
  recordingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  listeningEmojiWrap: {
    width: 104,
    height: 104,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0D7',
    transform: [{ rotate: '-4deg' }],
  },
  listeningEmoji: {
    fontSize: 56,
  },
  recordingLabel: {
    color: COLORS.danger,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.black,
  },
  recordingHint: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  stopBtn: {
    minWidth: 230,
    minHeight: 58,
    borderRadius: 22,
    paddingHorizontal: 26,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...SHADOWS.md,
  },
  stopBtnText: {
    color: '#FFFFFF',
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 17,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  analyzingMascot: {
    width: 118,
    height: 118,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2ECFF',
    transform: [{ rotate: '4deg' }],
  },
  analyzingMascotEmoji: {
    fontSize: 62,
  },
  analyzingTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
  },
  analyzingStep: {
    color: COLORS.primary,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    maxWidth: 380,
    height: 12,
    backgroundColor: 'rgba(109,74,255,0.15)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  analyzingDisclaimer: {
    color: COLORS.textMuted,
    maxWidth: 360,
    fontSize: FONTS.sizes.xs,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
  },
});
