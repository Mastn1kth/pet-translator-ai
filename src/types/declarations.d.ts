declare module 'expo-audio' {
  import type { PermissionResponse } from 'expo';

  export interface AudioMode {
    playsInSilentMode: boolean;
    shouldPlayInBackground: boolean;
    interruptionMode: 'mixWithOthers' | 'doNotMix' | 'duckOthers';
    allowsRecording: boolean;
  }

  export interface RecordingOptions {
    isMeteringEnabled?: boolean;
    keepAudioActiveHint?: boolean;
    extension?: string;
    sampleRate?: number;
    numberOfChannels?: number;
    bitRate?: number;
    bitRateStrategy?: string;
    linearPCMBitDepth?: number;
    linearPCMBigEndian?: boolean;
    linearPCMFloatEncoding?: boolean;
  }

  export interface RecordingStatus {
    durationMillis: number;
    metering: number;
    mediaServiceDidReset?: boolean;
    isRecording?: boolean;
  }

  export interface AudioRecorder {
    prepareToRecordAsync: () => Promise<void>;
    record: () => void;
    stop: () => Promise<string>;
    pause: () => Promise<void>;
    currentTime: number;
    uri: string | null;
    onRecordingStatusUpdate?: (status: RecordingStatus) => void;
  }

  export interface AudioStreamBuffer {
    data: ArrayBuffer;
    sampleRate: number;
    channels: number;
    timestamp: number;
  }

  export interface AudioStream {
    id: string;
    readonly sampleRate: number;
    readonly channels: number;
    readonly isStreaming: boolean;
    start: () => Promise<void>;
    stop: () => void;
  }

  export interface AudioStreamResult {
    stream: AudioStream;
    isStreaming: boolean;
  }

  export const RecordingPresets: {
    HIGH_QUALITY: RecordingOptions;
    LOW_QUALITY: RecordingOptions;
  };

  export function requestRecordingPermissionsAsync(): Promise<PermissionResponse>;
  export function getRecordingPermissionsAsync(): Promise<PermissionResponse>;
  export function setAudioModeAsync(mode: Partial<AudioMode>): Promise<void>;
  export function useAudioRecorder(options: RecordingOptions, statusListener?: (status: RecordingStatus) => void): AudioRecorder;
  export function useAudioRecorderState(recorder?: AudioRecorder, intervalMs?: number): RecordingStatus;
  export function useAudioStream(options?: {
    sampleRate?: number;
    channels?: number;
    encoding?: 'float32' | 'int16';
    onBuffer?: (buffer: AudioStreamBuffer) => void;
  }): AudioStreamResult;
}

declare module 'expo-video' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export type VideoSource = string | number | null | { uri: string } | { uri: string; overrideFileExtensionAndroid?: string };

  export interface VideoPlayer {
    playing: boolean;
    muted: boolean;
    loop: boolean;
    rate: number;
    volume: number;
    currentTime: number;
    duration: number;
    play: () => void;
    pause: () => void;
    replace: (source: VideoSource) => void;
    seekTo: (time: number) => void;
  }

  export interface VideoViewProps extends ViewProps {
    player: VideoPlayer;
    nativeResizeMode?: 'contain' | 'cover' | 'stretch';
    contentFit?: 'contain' | 'cover' | 'fill';
    nativeControls?: boolean;
    showsTimecodes?: boolean;
    allowsFullscreen?: boolean;
    allowsPictureInPicture?: boolean;
    startsPictureInPictureAutomatically?: boolean;
  }

  export const VideoView: React.FC<VideoViewProps>;

  export function useVideoPlayer(
    source: VideoSource,
    setup?: (player: VideoPlayer) => void
  ): VideoPlayer;

  export function useVideoPlayerStatus(player: VideoPlayer): {
    playing: boolean;
    currentTime: number;
    duration: number;
    bufferedPosition: number;
    playable: boolean;
    stale: boolean;
    error: string | null;
  };
}

declare module 'expo-file-system' {
  export interface FileInfo {
    exists: boolean;
    uri: string;
    size: number;
    modificationTime: number;
  }

  export namespace Paths {
    const cache: string;
    const document: string;
  }

  export class File {
    constructor(directory: string, path: string);
    uri: string;
    exists: boolean;
    create(options?: { intermediates?: boolean; overwrite?: boolean }): void;
    write(content: string): void;
    read(): string;
    delete(): void;
  }

  export function deleteAsync(uri: string, options?: { idempotent?: boolean }): Promise<void>;
  export function getInfoAsync(uri: string): Promise<FileInfo>;
  export function readAsStringAsync(uri: string): Promise<string>;
  export function writeAsStringAsync(uri: string, content: string): Promise<void>;
  export const documentDirectory: string;
  export const cacheDirectory: string;
}

declare module 'react-native-fast-tflite' {
  export type ModelLoadState = 'loading' | 'loaded' | 'error';

  export interface TensorflowModel {
    runSync: (inputs: ArrayBuffer[]) => ArrayBuffer[];
    run: (inputs: ArrayBuffer[]) => Promise<ArrayBuffer[]>;
    dispose: () => void;
    inputs?: Array<{ name?: string; dataType: string; shape: number[] }>;
    outputs?: Array<{ name?: string; dataType: string; shape: number[] }>;
  }

  export function loadTensorflowModel(model: number | string, options?: unknown[]): Promise<TensorflowModel>;
  export function useTensorflowModel(model: number | string, options?: unknown[]): {
    current?: TensorflowModel;
    state: ModelLoadState;
    model: TensorflowModel | null;
    error: Error | null;
  };
}

declare module 'expo-router' {
  import { TextProps, GestureResponderEvent } from 'react-native';

  interface LinkProps extends Omit<TextProps, 'href'> {
    href: string;
    target?: string;
    rel?: string;
    replace?: boolean;
    push?: boolean;
    as?: string;
    children?: React.ReactNode;
    onPress?: (event: GestureResponderEvent) => void;
  }

  export const Link: React.FC<LinkProps>;
  export const Stack: any;
  export const Tabs: any;
  export const router: any;
  export function useRouter(): any;
  export function useLocalSearchParams<T = Record<string, string | string[]>>(): T;
  export function useSegments(): string[];
}

declare module 'react-native-gesture-handler' {
  import { ViewProps } from 'react-native';

  interface GestureHandlerRootViewProps extends ViewProps {}
  export class GestureHandlerRootView extends React.Component<GestureHandlerRootViewProps> {}
}

declare module 'react-native-svg' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  type NumberProp = string | number;
  type ColorValue = string;

  interface SvgProps extends ViewProps {
    width?: NumberProp;
    height?: NumberProp;
    viewBox?: string;
    preserveAspectRatio?: string;
    color?: ColorValue;
    title?: string;
    children?: React.ReactNode;
  }

  interface RectProps {
    x?: NumberProp;
    y?: NumberProp;
    width?: NumberProp;
    height?: NumberProp;
    rx?: NumberProp;
    ry?: NumberProp;
    fill?: string;
    fillOpacity?: NumberProp;
    stroke?: string;
    strokeWidth?: NumberProp;
    transform?: string;
    opacity?: NumberProp;
  }

  interface CircleProps {
    cx?: NumberProp;
    cy?: NumberProp;
    r?: NumberProp;
    fill?: string;
    fillOpacity?: NumberProp;
    stroke?: string;
    strokeWidth?: NumberProp;
  }

  interface PathProps {
    d?: string;
    fill?: string;
    fillOpacity?: NumberProp;
    stroke?: string;
    strokeWidth?: NumberProp;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    transform?: string;
  }

  interface DefsProps {
    children?: React.ReactNode;
  }

  interface PatternProps {
    id?: string;
    x?: NumberProp;
    y?: NumberProp;
    width?: NumberProp;
    height?: NumberProp;
    patternUnits?: string;
    patternContentUnits?: string;
    children?: React.ReactNode;
  }

  interface UseProps {
    href?: string;
    x?: NumberProp;
    y?: NumberProp;
    width?: NumberProp;
    height?: NumberProp;
    fill?: string;
  }

  interface StopProps {
    offset?: string;
    stopColor?: string;
    stopOpacity?: NumberProp;
  }

  interface LinearGradientProps {
    x1?: NumberProp;
    x2?: NumberProp;
    y1?: NumberProp;
    y2?: NumberProp;
    gradientUnits?: string;
    children?: React.ReactNode;
  }

  export class Svg extends React.Component<SvgProps> {}
  export class Rect extends React.Component<RectProps> {}
  export class Circle extends React.Component<CircleProps> {}
  export class Path extends React.Component<PathProps> {}
  export class Defs extends React.Component<DefsProps> {}
  export class Pattern extends React.Component<PatternProps> {}
  export class Use extends React.Component<UseProps> {}
  export class Stop extends React.Component<StopProps> {}
  export class LinearGradient extends React.Component<LinearGradientProps> {}

  export default Svg;
}

declare module 'react-native-nitro-modules' {
  export interface HybridObject<T extends { ios: string; android: string }> {
    dispose(): void;
  }
}

declare module 'expo-linear-gradient' {
  import { ViewProps } from 'react-native';

  interface LinearGradientProps extends ViewProps {
    colors: string[] | readonly [string, string, ...string[]];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }

  export class LinearGradient extends React.Component<LinearGradientProps> {}
}

declare module 'react-native-safe-area-context' {
  import { ViewProps } from 'react-native';

  interface SafeAreaViewProps extends ViewProps {
    edges?: ReadonlyArray<'top' | 'bottom' | 'left' | 'right'>;
  }

  export class SafeAreaView extends React.Component<SafeAreaViewProps> {}
  export function useSafeAreaInsets(): { top: number; bottom: number; left: number; right: number };
  export function useSafeAreaFrame(): { x: number; y: number; width: number; height: number };
}
