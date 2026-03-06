import * as tf from "@tensorflow/tfjs";
import { FEATURE_VECTOR_DIM } from "./constants";
import type { BoundingBox } from "./types";

let model: tf.GraphModel | null = null;
let isLoading = false;

export async function initFeatureExtractor(): Promise<void> {
  if (model || isLoading) return;
  isLoading = true;

  try {
    await tf.ready();
    model = await tf.loadGraphModel(
      "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1",
      { fromTFHub: true }
    );
  } finally {
    isLoading = false;
  }
}

export function extractFeatureVector(
  video: HTMLVideoElement,
  bbox: BoundingBox
): Float32Array | null {
  if (!model) return null;

  let result: Float32Array | null = null;

  tf.tidy(() => {
    const frame = tf.browser.fromPixels(video);
    const [h, w] = frame.shape;

    const x1 = Math.max(0, Math.floor(bbox.x * w));
    const y1 = Math.max(0, Math.floor(bbox.y * h));
    const cropW = Math.min(Math.floor(bbox.width * w), w - x1);
    const cropH = Math.min(Math.floor(bbox.height * h), h - y1);

    if (cropW <= 0 || cropH <= 0) return;

    const cropped = tf.slice(frame, [y1, x1, 0], [cropH, cropW, 3]);
    const resized = tf.image.resizeBilinear(cropped as tf.Tensor3D, [224, 224]);
    const normalized = resized.div(255.0);
    const batched = normalized.expandDims(0);

    const output = model!.predict(batched) as tf.Tensor;
    const fullVector = output.dataSync() as Float32Array;

    const vector = new Float32Array(FEATURE_VECTOR_DIM);
    for (let i = 0; i < FEATURE_VECTOR_DIM; i++) {
      vector[i] = fullVector[i] || 0;
    }

    // L2 normalize
    let norm = 0;
    for (let i = 0; i < FEATURE_VECTOR_DIM; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < FEATURE_VECTOR_DIM; i++) {
        vector[i] /= norm;
      }
    }

    result = vector;
  });

  return result;
}

export function isFeatureExtractorReady(): boolean {
  return model !== null;
}
