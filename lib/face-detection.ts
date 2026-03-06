import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { FaceDetection, NormalizedLandmark } from "./types";

let faceLandmarker: FaceLandmarker | null = null;

export async function initFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 10,
    minFaceDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFacialTransformationMatrixes: false,
    outputFaceBlendshapes: false,
  });

  return faceLandmarker;
}

export function detectFaces(
  video: HTMLVideoElement,
  timestampMs: number
): FaceDetection[] {
  if (!faceLandmarker) return [];

  const results = faceLandmarker.detectForVideo(video, timestampMs);
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) return [];

  return results.faceLandmarks.map((landmarks) => {
    const normalizedLandmarks: NormalizedLandmark[] = landmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
    }));

    // Compute bounding box from landmarks
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const lm of normalizedLandmarks) {
      if (lm.x < minX) minX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y > maxY) maxY = lm.y;
    }

    // Add padding
    const padX = (maxX - minX) * 0.1;
    const padY = (maxY - minY) * 0.1;
    minX = Math.max(0, minX - padX);
    minY = Math.max(0, minY - padY);
    maxX = Math.min(1, maxX + padX);
    maxY = Math.min(1, maxY + padY);

    return {
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      landmarks: normalizedLandmarks,
      score: 1.0, // MediaPipe doesn't expose per-face score in landmarks mode
    };
  });
}
