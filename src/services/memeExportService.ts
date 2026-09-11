import { NativeModules } from 'react-native';
import * as Sharing from 'expo-sharing';
import { VideoMemeProject } from '../types';

type NativePetVideoExporter = {
  exportMemeVideo?: (projectJson: string) => Promise<string>;
};

export interface MemeExportResult {
  outputUri: string;
  usedNativeExporter: boolean;
}

const nativeExporter = NativeModules.PetVideoExporter as NativePetVideoExporter | undefined;

export async function exportMemeProject(project: VideoMemeProject): Promise<MemeExportResult> {
  if (nativeExporter?.exportMemeVideo) {
    const outputUri = await nativeExporter.exportMemeVideo(JSON.stringify(project));
    return { outputUri, usedNativeExporter: true };
  }

  return { outputUri: project.sourceUri, usedNativeExporter: false };
}

export async function shareMemeProject(project: VideoMemeProject): Promise<MemeExportResult> {
  const result = await exportMemeProject(project);
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(result.outputUri, {
      dialogTitle: 'Поделиться мемом с питомцем',
      mimeType: 'video/mp4',
    });
  }
  return result;
}
