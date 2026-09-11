export interface PetDetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: 'cat' | 'dog' | 'pet' | string;
}

export interface HeadAnchor {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  visible: boolean;
  confidence: number;
  label: string;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function estimateHeadAnchor(box: PetDetectionBox): HeadAnchor {
  const visible = box.confidence >= 0.45 && box.width > 20 && box.height > 20;
  const speciesOffset = box.label === 'dog' ? 0.24 : 0.2;
  const x = box.x + box.width / 2;
  const y = box.y + box.height * speciesOffset;
  const scale = clamp(Math.max(box.width, box.height) / 155, 0.55, 3.2);
  const rotation = clamp((box.width - box.height * 0.62) / Math.max(1, box.height) * 18, -18, 18);

  return {
    x: round(x),
    y: round(y),
    scale: round(scale),
    rotation: round(rotation),
    visible,
    confidence: round(box.confidence),
    label: box.label,
  };
}

export function smoothAnchor(previous: HeadAnchor | null, next: HeadAnchor, factor = 0.35): HeadAnchor {
  if (!previous || !previous.visible || !next.visible) return next;
  const safeFactor = clamp(factor, 0.05, 1);
  const mix = (a: number, b: number) => round(a + (b - a) * safeFactor);
  return {
    ...next,
    x: mix(previous.x, next.x),
    y: mix(previous.y, next.y),
    scale: mix(previous.scale, next.scale),
    rotation: mix(previous.rotation, next.rotation),
    confidence: Math.max(previous.confidence, next.confidence),
  };
}

export function createFallbackDetection(width: number, height: number, label: 'cat' | 'dog' | 'pet' = 'pet'): PetDetectionBox {
  const boxWidth = width * 0.58;
  const boxHeight = height * 0.5;
  return {
    x: (width - boxWidth) / 2,
    y: height * 0.18,
    width: boxWidth,
    height: boxHeight,
    confidence: 0.52,
    label,
  };
}
