import { loadTensorflowModel, useTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';
import type { PetVisionLabel, PetVisionObservation } from '../types';

export const PET_OBJECT_DETECTOR_MODEL = require('../assets/models/object_detection_mobile_object_localizer_v1_1_default_1.tflite');

export const MODEL_INPUT_WIDTH = 192;
export const MODEL_INPUT_HEIGHT = 192;
export const MODEL_INPUT_CHANNELS = 3;
export const MODEL_INPUT_BYTES = MODEL_INPUT_WIDTH * MODEL_INPUT_HEIGHT * MODEL_INPUT_CHANNELS;

export const COCO_LABELS = [
  'person',
  'bicycle',
  'car',
  'motorcycle',
  'airplane',
  'bus',
  'train',
  'truck',
  'boat',
  'traffic light',
  'fire hydrant',
  'stop sign',
  'parking meter',
  'bench',
  'bird',
  'cat',
  'dog',
  'horse',
  'sheep',
  'cow',
  'elephant',
  'bear',
  'zebra',
  'giraffe',
  'backpack',
  'umbrella',
  'handbag',
  'tie',
  'suitcase',
  'frisbee',
  'skis',
  'snowboard',
  'sports ball',
  'kite',
  'baseball bat',
  'baseball glove',
  'skateboard',
  'surfboard',
  'tennis racket',
  'bottle',
  'wine glass',
  'cup',
  'fork',
  'knife',
  'spoon',
  'bowl',
  'banana',
  'apple',
  'sandwich',
  'orange',
  'broccoli',
  'carrot',
  'hot dog',
  'pizza',
  'donut',
  'cake',
  'chair',
  'couch',
  'potted plant',
  'bed',
  'dining table',
  'toilet',
  'tv',
  'laptop',
  'mouse',
  'remote',
  'keyboard',
  'cell phone',
  'microwave',
  'oven',
  'toaster',
  'sink',
  'refrigerator',
  'book',
  'clock',
  'vase',
  'scissors',
  'teddy bear',
  'hair drier',
  'toothbrush',
] as const;

export interface ObjectDetectionCandidate extends PetVisionObservation {
  classId: number;
  rawLabel: string;
}

function labelForClassId(classId: number): string {
  'worklet';
  const rounded = Math.round(classId);
  const zeroBased = COCO_LABELS[rounded];
  const oneBased = COCO_LABELS[rounded - 1];

  if (oneBased === 'cat' || oneBased === 'dog') return oneBased;
  if (zeroBased === 'cat' || zeroBased === 'dog') return zeroBased;

  return zeroBased || oneBased || `class_${rounded}`;
}

function petLabelFromCoco(label: string): PetVisionLabel {
  'worklet';
  if (label === 'cat') return 'cat';
  if (label === 'dog') return 'dog';
  return 'unknown';
}

export function decodeObjectDetectionOutputs(outputs: ArrayBuffer[], timestamp?: number): PetVisionObservation | null {
  'worklet';
  if (outputs.length < 3 || outputs[0] == null || outputs[1] == null || outputs[2] == null) {
    return null;
  }

  const boxes = new Float32Array(outputs[0]);
  const classes = new Float32Array(outputs[1]);
  const scores = new Float32Array(outputs[2]);
  const count = outputs[3] != null ? Math.min(scores.length, Math.floor(new Float32Array(outputs[3])[0] || scores.length)) : scores.length;

  let best: ObjectDetectionCandidate | null = null;
  const max = Math.min(count, scores.length, classes.length, Math.floor(boxes.length / 4));

  for (let i = 0; i < max; i += 1) {
    const score = scores[i] || 0;
    if (score < 0.25) continue;

    const rawLabel = labelForClassId(classes[i] || 0);
    const label = petLabelFromCoco(rawLabel);
    if (label === 'unknown') continue;

    const boxOffset = i * 4;
    const top = Math.max(0, Math.min(1, boxes[boxOffset] || 0));
    const left = Math.max(0, Math.min(1, boxes[boxOffset + 1] || 0));
    const bottom = Math.max(0, Math.min(1, boxes[boxOffset + 2] || 0));
    const right = Math.max(0, Math.min(1, boxes[boxOffset + 3] || 0));
    const candidate: ObjectDetectionCandidate = {
      label,
      rawLabel,
      classId: classes[i] || 0,
      confidence: score,
      bbox: { top, left, bottom, right },
      center: {
        x: (left + right) / 2,
        y: (top + bottom) / 2,
      },
      frameTimestamp: timestamp,
      source: 'live-camera',
    };

    if (best == null || candidate.confidence > best.confidence) {
      best = candidate;
    }
  }

  return best;
}

export function frameBufferToModelInput(
  frameBuffer: ArrayBuffer,
  sourceWidth: number = MODEL_INPUT_WIDTH,
  sourceHeight: number = MODEL_INPUT_HEIGHT,
  bytesPerRow?: number
): ArrayBuffer {
  'worklet';
  const safeWidth = Math.max(1, Math.floor(sourceWidth));
  const safeHeight = Math.max(1, Math.floor(sourceHeight));
  const rowBytes = Math.max(bytesPerRow || 0, Math.floor(frameBuffer.byteLength / safeHeight));

  if (safeWidth === MODEL_INPUT_WIDTH && safeHeight === MODEL_INPUT_HEIGHT && frameBuffer.byteLength === MODEL_INPUT_BYTES) {
    return frameBuffer.slice(0);
  }

  const source = new Uint8Array(frameBuffer);
  const input = new Uint8Array(MODEL_INPUT_BYTES);
  const bytesPerPixel = rowBytes >= safeWidth * 4 ? 4 : 3;
  const cropSize = Math.min(safeWidth, safeHeight);
  const cropLeft = Math.floor((safeWidth - cropSize) / 2);
  const cropTop = Math.floor((safeHeight - cropSize) / 2);

  for (let y = 0; y < MODEL_INPUT_HEIGHT; y += 1) {
    const sourceY = cropTop + Math.min(cropSize - 1, Math.floor((y * cropSize) / MODEL_INPUT_HEIGHT));
    for (let x = 0; x < MODEL_INPUT_WIDTH; x += 1) {
      const sourceX = cropLeft + Math.min(cropSize - 1, Math.floor((x * cropSize) / MODEL_INPUT_WIDTH));
      const sourceOffset = sourceY * rowBytes + sourceX * bytesPerPixel;
      const targetOffset = (y * MODEL_INPUT_WIDTH + x) * MODEL_INPUT_CHANNELS;

      if (bytesPerPixel >= 4) {
        input[targetOffset] = source[sourceOffset + 2] || 0;
        input[targetOffset + 1] = source[sourceOffset + 1] || 0;
        input[targetOffset + 2] = source[sourceOffset] || 0;
      } else {
        input[targetOffset] = source[sourceOffset] || 0;
        input[targetOffset + 1] = source[sourceOffset + 1] || 0;
        input[targetOffset + 2] = source[sourceOffset + 2] || 0;
      }
    }
  }

  return input.buffer;
}

export function usePetObjectDetector() {
  return useTensorflowModel(PET_OBJECT_DETECTOR_MODEL, []);
}

export async function loadPetObjectDetector(): Promise<TensorflowModel> {
  return loadTensorflowModel(PET_OBJECT_DETECTOR_MODEL, []);
}
