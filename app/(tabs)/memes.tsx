import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, useCameraDevice, useCameraPermission, useFrameOutput } from 'react-native-vision-camera';
import { scheduleOnRN } from 'react-native-worklets';
import { useAppStore } from '../../src/store/appStore';
import { COLORS, FONTS, RADIUS } from '../../src/constants/theme';
import TexturedBackground from '../../src/components/ui/TexturedBackground';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { ARFilterId, PetVisionObservation, VideoCaptionCue, VideoMemeProject } from '../../src/types';
import { shareMemeProject } from '../../src/services/memeExportService';
import {
  decodeObjectDetectionOutputs,
  frameBufferToModelInput,
  MODEL_INPUT_HEIGHT,
  MODEL_INPUT_WIDTH,
  usePetObjectDetector,
} from '../../src/services/petVisionModel';
import { estimateHeadAnchor, HeadAnchor, PetDetectionBox, smoothAnchor } from '../../src/engine/arTrackingEngine';

const ANCHOR_LOOP_INTERVAL_MS = 400;

const TEMPLATE_COLORS: Record<string, readonly [string, string]> = {
  food: COLORS.gradientSun,
  fridge: COLORS.gradientSky,
  director: ['#FF2D55', '#D4004A'] as const,
  walk: COLORS.gradientDuo,
};

const FILTER_EMOJIS: Record<string, string> = {
  none: '🐾',
  glasses: '😎',
  crown: '👑',
  pirate: '🏴‍☠️',
  detective: '🕵️',
  billionaire: '💰',
  cowboy: '🤠',
  astronaut: '🧑‍🚀',
  gigachad: '💪',
  clown: '🤡',
};

function makeCaptions(text: string, fallback: string, secondLine: string): VideoCaptionCue[] {
  const clean = text.trim() || fallback;
  return [
    { id: 'caption-1', startMs: 700, endMs: 3200, text: clean },
    { id: 'caption-2', startMs: 3600, endMs: 6200, text: secondLine },
  ];
}

export default function MemesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const MEME_TEMPLATES = useMemo(
    () => t.memes.templates.map((tpl) => ({ ...tpl, colors: TEMPLATE_COLORS[tpl.id] || COLORS.gradientDuo })),
    [t]
  );
  const FILTERS: Array<{ id: ARFilterId; label: string; emoji: string }> = useMemo(
    () => t.memes.filters.map((f) => ({ id: f.id as ARFilterId, label: f.label, emoji: FILTER_EMOJIS[f.id] || '🐾' })),
    [t]
  );
  const pets = useAppStore((s) => s.pets);
  const memeProjects = useAppStore((s) => s.memeProjects);
  const addMemeProject = useAppStore((s) => s.addMemeProject);
  const markMemeProjectExported = useAppStore((s) => s.markMemeProjectExported);
  const incrementMemeCount = useAppStore((s) => s.incrementMemeCount);

  const [selectedPetId, setSelectedPetId] = useState<string | undefined>(pets[0]?.id);
  const [videoUri, setVideoUri] = useState<string>('');
  const [templateId, setTemplateId] = useState(MEME_TEMPLATES[0].id);
  const [filterId, setFilterId] = useState<ARFilterId>('crown');
  const [captionText, setCaptionText] = useState(MEME_TEMPLATES[0].caption);
  const [isExporting, setIsExporting] = useState(false);

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showTrackingTools, setShowTrackingTools] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [trackedObservations, setTrackedObservations] = useState<PetVisionObservation[]>([]);
  const [anchorIndex, setAnchorIndex] = useState(0);
  const observationsRef = useRef<PetVisionObservation[]>([]);
  const frameSizeRef = useRef({ width: 0, height: 0 });

  const cameraDevice = useCameraDevice('back');
  const cameraPermission = useCameraPermission();
  const detector = usePetObjectDetector();
  const detectorModel = detector.state === 'loaded' ? detector.model : undefined;

  const handleTrackedObservation = useCallback((observation: PetVisionObservation) => {
    observationsRef.current = [...observationsRef.current, observation].slice(-40);
    setCaptureCount(observationsRef.current.length);
  }, []);

  const frameOutputResolution = useMemo(() => ({ width: MODEL_INPUT_WIDTH, height: MODEL_INPUT_HEIGHT }), []);

  const frameOutput = useFrameOutput({
    targetResolution: frameOutputResolution,
    pixelFormat: 'rgb',
    dropFramesWhileBusy: true,
    enablePreviewSizedOutputBuffers: true,
    enablePhysicalBufferRotation: true,
    onFrame(frame) {
      'worklet';
      try {
        if (detectorModel == null || !isCalibrating || !frame.hasPixelBuffer) return;
        const input = frameBufferToModelInput(frame.getPixelBuffer(), frame.width, frame.height, frame.bytesPerRow);
        const outputs = detectorModel.runSync([input]);
        const observation = decodeObjectDetectionOutputs(outputs, frame.timestamp);
        if (observation != null) scheduleOnRN(handleTrackedObservation, observation);
      } finally {
        frame.dispose();
      }
    },
  });

  const cameraOutputs = useMemo(() => [frameOutput], [frameOutput]);
  const cameraConstraints = useMemo(() => [{ fps: 3 }], []);

  const startCalibration = async () => {
    if (detector.state === 'error') {
      Alert.alert(t.memes.modelUnavailable, detector.error?.message ?? t.memes.modelUnavailable);
      return;
    }
    const granted = cameraPermission.hasPermission || (await cameraPermission.requestPermission());
    if (!granted) {
      Alert.alert(t.memes.needCamera, t.memes.needCameraText);
      return;
    }
    observationsRef.current = [];
    setCaptureCount(0);
    setIsCalibrating(true);
  };

  const stopCalibration = () => {
    setIsCalibrating(false);
    setTrackedObservations(observationsRef.current.slice());
  };

  useEffect(() => {
    return () => setIsCalibrating(false);
  }, []);

  const trackedAnchors = useMemo(() => {
    const { width, height } = frameSizeRef.current;
    if (trackedObservations.length === 0 || width === 0 || height === 0) return [] as HeadAnchor[];

    let previous: HeadAnchor | null = null;
    return trackedObservations.map((observation) => {
      const bbox = observation.bbox || { top: 0.2, left: 0.3, bottom: 0.6, right: 0.7 };
      const box: PetDetectionBox = {
        x: bbox.left * width,
        y: bbox.top * height,
        width: Math.max(20, (bbox.right - bbox.left) * width),
        height: Math.max(20, (bbox.bottom - bbox.top) * height),
        confidence: observation.confidence,
        label: observation.label,
      };
      const anchor = smoothAnchor(previous, estimateHeadAnchor(box));
      previous = anchor;
      return anchor;
    });
  }, [trackedObservations]);

  useEffect(() => {
    if (trackedAnchors.length === 0) return;
    setAnchorIndex(0);
    const id = setInterval(() => {
      setAnchorIndex((i) => (i + 1) % trackedAnchors.length);
    }, ANCHOR_LOOP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [trackedAnchors.length]);

  const activeAnchor = trackedAnchors[anchorIndex] || null;

  const selectedTemplate = useMemo(
    () => MEME_TEMPLATES.find((template) => template.id === templateId) || MEME_TEMPLATES[0],
    [templateId]
  );
  const selectedFilter = FILTERS.find((filter) => filter.id === filterId) || FILTERS[0];
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || pets[0];

  const player = useVideoPlayer(videoUri || null, (instance) => {
    instance.loop = true;
    if (videoUri) instance.play();
  });

  const pickVideo = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(t.memes.needMedia, fromCamera ? t.memes.needMediaCamera : t.memes.needMediaLibrary);
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.8 });

    if (!result.canceled) {
      setVideoUri(result.assets[0]?.uri || '');
    }
  };

  const applyTemplate = (template: typeof MEME_TEMPLATES[number]) => {
    setTemplateId(template.id);
    setCaptionText(template.caption);
  };

  const buildProject = (): VideoMemeProject | null => {
    if (!videoUri) {
      Alert.alert(t.memes.needVideoFirst, t.memes.needVideoFirstText);
      return null;
    }
    return {
      id: Date.now().toString(),
      petId: selectedPet?.id,
      sourceUri: videoUri,
      templateId,
      filterId,
      captions: makeCaptions(captionText, selectedTemplate.caption, t.memes.reelsHint),
      modelObservations: trackedObservations.length > 0 ? trackedObservations : undefined,
      createdAt: Date.now(),
    };
  };

  const handleCreateMeme = async () => {
    const project = buildProject();
    if (!project) return;
    addMemeProject(project);
    incrementMemeCount();
    Alert.alert(t.memes.memeCreated, t.memes.memeCreatedText);
  };

  const handleShare = async () => {
    const project = buildProject();
    if (!project || isExporting) return;
    setIsExporting(true);
    try {
      addMemeProject(project);
      const result = await shareMemeProject(project);
      markMemeProjectExported(project.id, result.outputUri);
      incrementMemeCount();
      Alert.alert(
        result.usedNativeExporter ? t.memes.mp4ReadyTitle : t.memes.exportedFallbackTitle,
        result.usedNativeExporter ? t.memes.mp4ReadyText : t.memes.exportedFallbackText
      );
    } catch (error) {
      Alert.alert(t.memes.exportError, t.memes.exportErrorText);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={12}
      >
        <TexturedBackground variant="paws" style={styles.bg}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.header}>
              <Text style={styles.kicker}>{t.memes.kicker}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{t.memes.title}</Text>
              <Text style={[styles.subtitle, { color: colors.textSub }]}>
                {t.memes.subtitle}
              </Text>
            </View>

            <View style={[styles.previewShell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View
                style={styles.videoFrame}
                onLayout={(e) => {
                  frameSizeRef.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
                }}
              >
                {videoUri ? (
                  <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
                ) : (
                  <LinearGradient colors={selectedTemplate.colors} style={styles.emptyPreview}>
                    <Text style={styles.emptyPreviewEmoji}>🎬</Text>
                    <Text style={styles.emptyPreviewText}>{t.memes.emptyPreviewText}</Text>
                  </LinearGradient>
                )}
                <View
                  style={[
                    styles.filterOverlay,
                    activeAnchor
                      ? {
                          top: 0,
                          left: 0,
                          alignSelf: 'flex-start',
                          transform: [
                            { translateX: activeAnchor.x - 52 },
                            { translateY: activeAnchor.y - 36 },
                            { scale: activeAnchor.scale },
                            { rotate: `${activeAnchor.rotation}deg` },
                          ],
                        }
                      : null,
                  ]}
                >
                  <Text style={styles.filterEmoji}>{selectedFilter.emoji}</Text>
                </View>
                <View style={styles.captionOverlay}>
                  <Text style={styles.captionTop}>{selectedTemplate.top}</Text>
                  <Text style={styles.captionBottom}>{captionText}</Text>
                </View>
              </View>
            </View>

            <View style={styles.mediaActions}>
              <TouchableOpacity onPress={() => pickVideo(false)} style={styles.mediaButton}>
                <LinearGradient colors={COLORS.gradientSky} style={styles.mediaButtonGrad}>
                  <Text style={styles.mediaButtonText}>{t.memes.pickVideo}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickVideo(true)} style={styles.mediaButton}>
                <LinearGradient colors={COLORS.gradientDuo} style={styles.mediaButtonGrad}>
                  <Text style={styles.mediaButtonText}>{t.memes.recordVideo}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {pets.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t.memes.petCardTitle}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {pets.map((pet) => {
                    const active = (selectedPet?.id || selectedPetId) === pet.id;
                    return (
                      <TouchableOpacity
                        key={pet.id}
                        onPress={() => setSelectedPetId(pet.id)}
                        style={[styles.petChip, { backgroundColor: colors.surfaceAlt }, active && styles.petChipActive]}
                      >
                        <Text style={styles.petChipEmoji}>{pet.type === 'cat' ? '🐱' : '🐶'}</Text>
                        <Text style={[styles.petChipText, { color: colors.text }]}>{pet.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t.memes.templatesTitle}</Text>
              <View style={styles.templateGrid}>
                {MEME_TEMPLATES.map((template) => {
                  const active = template.id === templateId;
                  return (
                    <TouchableOpacity
                      key={template.id}
                      onPress={() => applyTemplate(template)}
                      style={[styles.templateCard, active && styles.templateCardActive]}
                    >
                      <LinearGradient colors={template.colors} style={styles.templateGrad}>
                        <Text style={styles.templateTitle}>{template.title}</Text>
                        <Text style={styles.templateText}>{template.top}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t.memes.filterTitle}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {FILTERS.map((filter) => {
                  const active = filter.id === filterId;
                  return (
                    <TouchableOpacity
                      key={filter.id}
                      onPress={() => setFilterId(filter.id)}
                      style={[styles.filterChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }, active && styles.filterChipActive]}
                    >
                      <Text style={styles.filterChipEmoji}>{filter.emoji}</Text>
                      <Text style={[styles.filterChipText, { color: colors.text }]}>{filter.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  if (showTrackingTools && isCalibrating) stopCalibration();
                  setShowTrackingTools((shown) => !shown);
                }}
                activeOpacity={0.84}
                style={styles.optionalHeader}
                accessibilityRole="button"
                accessibilityState={{ expanded: showTrackingTools }}
              >
                <View style={styles.optionalIcon}>
                  <Text style={styles.optionalEmoji}>✨</Text>
                </View>
                <View style={styles.optionalCopy}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{t.memes.trackingOptionalTitle}</Text>
                  <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t.memes.trackingOptionalSub}</Text>
                </View>
                <Text style={styles.optionalChevron}>{showTrackingTools ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showTrackingTools && (
                <View style={[styles.trackingBody, { borderTopColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{t.memes.trackingTitle}</Text>
                  <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                    {t.memes.trackingSub}
                  </Text>
                  {isCalibrating ? (
                    <>
                      {cameraDevice ? (
                        <Camera
                          style={styles.calibrationCamera}
                          device={cameraDevice}
                          isActive={isCalibrating}
                          outputs={cameraOutputs}
                          constraints={cameraConstraints}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.calibrationCameraPlaceholder}>
                          <Text style={styles.calibrationPlaceholderText}>{t.memes.cameraUnavailable}</Text>
                        </View>
                      )}
                      <Text style={[styles.calibrationHint, { color: colors.textMuted }]}>
                        {detector.state === 'loaded'
                          ? t.memes.capturedPoints(captureCount)
                          : detector.state === 'loading'
                            ? t.memes.loadingModel
                            : t.memes.modelUnavailable}
                      </Text>
                      <TouchableOpacity onPress={stopCalibration} style={styles.calibrationStopBtn}>
                        <Text style={styles.calibrationStopText}>{t.memes.calibrateFinish}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity onPress={startCalibration} style={[styles.calibrationStartBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <Text style={[styles.calibrationStartText, { color: colors.text }]}>
                        {trackedObservations.length > 0
                          ? t.memes.calibrateDone(trackedObservations.length)
                          : t.memes.calibrateStart}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t.memes.captionTitle}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
                value={captionText}
                onChangeText={setCaptionText}
                placeholder={t.memes.captionPlaceholder}
                placeholderTextColor={colors.textMuted}
                selectionColor={COLORS.duoGreen}
                cursorColor={COLORS.duoGreen}
                maxLength={120}
                multiline
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={handleCreateMeme} style={[styles.secondaryAction, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.secondaryActionText, { color: colors.text }]}>{t.memes.createMeme}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.primaryAction} disabled={isExporting}>
                <LinearGradient colors={COLORS.gradientDuo} style={styles.primaryActionGrad}>
                  <Text style={styles.primaryActionText}>{isExporting ? t.memes.exporting : t.memes.exportShare}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {memeProjects.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t.memes.recentProjects}</Text>
                {memeProjects.slice(0, 3).map((project) => (
                  <Text key={project.id} style={[styles.projectText, { color: colors.textSub }]}>
                    {project.exportedAt ? '✅' : '🎞️'} {project.templateId} • {project.filterId}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>
        </TexturedBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.appleBg },
  keyboard: { flex: 1 },
  bg: { backgroundColor: COLORS.appleBg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 16, paddingBottom: 108, gap: 16 },
  header: { gap: 6, paddingTop: 8 },
  kicker: {
    color: COLORS.duoBlueDark,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.black,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: COLORS.appleInk,
    fontFamily: FONTS.family.display,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: FONTS.weights.black,
  },
  subtitle: { color: COLORS.appleInkSoft, fontSize: FONTS.sizes.sm, lineHeight: 20 },
  previewShell: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.appleLine,
  },
  videoFrame: {
    aspectRatio: 9 / 16,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#101010',
    position: 'relative',
  },
  video: { width: '100%', height: '100%' },
  emptyPreview: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  emptyPreviewEmoji: { fontSize: 56 },
  emptyPreviewText: { color: '#FFFFFF', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, textAlign: 'center' },
  filterOverlay: {
    position: 'absolute',
    top: '16%',
    alignSelf: 'center',
    width: 104,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterEmoji: { fontSize: 58, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8 },
  captionOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 24,
    gap: 8,
    alignItems: 'center',
  },
  captionTop: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowRadius: 7,
  },
  captionBottom: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: FONTS.weights.black,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowRadius: 7,
  },
  mediaActions: { flexDirection: 'row', gap: 12 },
  mediaButton: { flex: 1, borderRadius: 22, overflow: 'hidden' },
  mediaButtonGrad: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  mediaButtonText: { color: '#FFFFFF', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  card: {
    backgroundColor: COLORS.appleSurface,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.appleLine,
  },
  cardTitle: {
    color: COLORS.appleInk,
    fontFamily: FONTS.family.display,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
  },
  cardSub: { color: COLORS.appleMuted, fontSize: FONTS.sizes.sm, lineHeight: 19 },
  optionalHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionalIcon: {
    width: 52,
    height: 52,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2ECFF',
  },
  optionalEmoji: {
    fontSize: 27,
  },
  optionalCopy: {
    flex: 1,
    gap: 2,
  },
  optionalChevron: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: FONTS.weights.black,
  },
  trackingBody: {
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  calibrationCamera: { width: '100%', aspectRatio: 4 / 3, borderRadius: 18, overflow: 'hidden', backgroundColor: '#111827' },
  calibrationCameraPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  calibrationPlaceholderText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  calibrationHint: { fontSize: FONTS.sizes.sm, textAlign: 'center' },
  calibrationStopBtn: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  calibrationStopText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  calibrationStartBtn: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  calibrationStartText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, textAlign: 'center' },
  chipRow: { gap: 10, paddingRight: 6 },
  petChip: {
    minWidth: 90,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    gap: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petChipActive: { borderColor: COLORS.duoGreen, backgroundColor: '#E7F8D8' },
  petChipEmoji: { fontSize: 28 },
  petChipText: { color: COLORS.appleInk, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  templateCard: { width: '48%', borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  templateCardActive: { borderColor: COLORS.duoGreen },
  templateGrad: { minHeight: 104, padding: 13, justifyContent: 'space-between', borderRadius: 18 },
  templateTitle: { color: '#FFFFFF', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  templateText: { color: 'rgba(255,255,255,0.9)', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, lineHeight: 18 },
  filterChip: {
    minWidth: 92,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.appleLine,
  },
  filterChipActive: { borderColor: COLORS.duoBlue, backgroundColor: '#E7F5FF' },
  filterChipEmoji: { fontSize: 30 },
  filterChipText: { color: COLORS.appleInk, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, textAlign: 'center' },
  input: {
    minHeight: 80,
    backgroundColor: '#F8FAFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.appleInk,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    borderWidth: 2,
    borderColor: COLORS.appleLine,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: 12 },
  secondaryAction: {
    flex: 1,
    minHeight: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.appleLine,
  },
  secondaryActionText: { color: COLORS.appleInk, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  primaryAction: { flex: 1, minHeight: 58, borderRadius: 22, overflow: 'hidden' },
  primaryActionGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  primaryActionText: { color: '#FFFFFF', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  projectText: { color: COLORS.appleInkSoft, fontSize: FONTS.sizes.sm, lineHeight: 20 },
});
