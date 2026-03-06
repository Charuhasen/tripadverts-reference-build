import {
  NOSE_TIP,
  LEFT_EYE_OUTER,
  RIGHT_EYE_OUTER,
  CHIN,
  LEFT_IRIS_CENTER,
  RIGHT_IRIS_CENTER,
  LEFT_EYE_INNER_CORNER,
  LEFT_EYE_OUTER_CORNER,
  RIGHT_EYE_INNER_CORNER,
  RIGHT_EYE_OUTER_CORNER,
  HEAD_ONLY_YAW_THRESHOLD_DEG,
  HEAD_ONLY_PITCH_THRESHOLD_DEG,
  IRIS_CENTER_TOLERANCE,
} from "./constants";
import type { NormalizedLandmark, EulerAngles, IrisGaze, GazeEstimate } from "./types";

export function estimateHeadPose(landmarks: NormalizedLandmark[]): EulerAngles | null {
  if (landmarks.length < 264) return null;

  const nose = landmarks[NOSE_TIP];
  const leftEye = landmarks[LEFT_EYE_OUTER];
  const rightEye = landmarks[RIGHT_EYE_OUTER];
  const chin = landmarks[CHIN];

  // Eye midpoint
  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeMidY = (leftEye.y + rightEye.y) / 2;

  // Face dimensions for normalization
  const interEyeDist = Math.abs(rightEye.x - leftEye.x);
  const eyeToChinDist = Math.abs(chin.y - eyeMidY);

  if (interEyeDist < 0.001 || eyeToChinDist < 0.001) return null;

  // Yaw: horizontal offset of nose tip from eye midpoint, normalized by inter-eye distance.
  // When looking straight at the screen, nose.x ≈ eyeMidX → yaw ≈ 0°.
  // Turning left/right shifts the nose tip horizontally.
  const yawNormalized = (nose.x - eyeMidX) / interEyeDist;
  const yaw = Math.atan2(yawNormalized, 1) * (180 / Math.PI);

  // Pitch: vertical offset of nose tip from its expected resting position.
  // When looking straight, the nose sits roughly 40% of the way from the eye midpoint to the chin.
  // Looking up moves the nose closer to the eyes; looking down moves it closer to the chin.
  const expectedNoseY = eyeMidY + eyeToChinDist * 0.4;
  const pitchNormalized = (nose.y - expectedNoseY) / eyeToChinDist;
  const pitch = Math.atan2(pitchNormalized, 1) * (180 / Math.PI);

  // Roll: tilt of the eye line relative to horizontal
  const rollRad = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
  const roll = rollRad * (180 / Math.PI);

  return { yaw, pitch, roll };
}

/**
 * Estimate where the irises are positioned within the eye openings.
 * Requires 478 landmarks (MediaPipe Face Landmarker with iris support).
 *
 * For each eye, computes a ratio of where the iris center sits between
 * the inner and outer eye corners:
 *   0.0 = iris is at the outer corner (looking away from nose)
 *   0.5 = iris is centered in the eye opening
 *   1.0 = iris is at the inner corner (looking toward nose)
 *
 * avgHorizontal and avgVertical combine both eyes into a single value
 * where 0.5 means "looking straight ahead."
 */
export function estimateIrisGaze(landmarks: NormalizedLandmark[]): IrisGaze | null {
  // Need at least 478 landmarks (468-477 are iris landmarks)
  if (landmarks.length < 478) return null;

  const leftIris = landmarks[LEFT_IRIS_CENTER];
  const rightIris = landmarks[RIGHT_IRIS_CENTER];

  const leftOuterCorner = landmarks[LEFT_EYE_OUTER_CORNER];
  const leftInnerCorner = landmarks[LEFT_EYE_INNER_CORNER];
  const rightInnerCorner = landmarks[RIGHT_EYE_INNER_CORNER];
  const rightOuterCorner = landmarks[RIGHT_EYE_OUTER_CORNER];

  // Left eye: compute where iris sits between outer corner and inner corner (horizontally)
  const leftEyeWidth = leftInnerCorner.x - leftOuterCorner.x;
  const leftIrisRatioX = leftEyeWidth !== 0
    ? (leftIris.x - leftOuterCorner.x) / leftEyeWidth
    : 0.5;

  // Right eye: compute where iris sits between inner corner and outer corner (horizontally)
  const rightEyeWidth = rightOuterCorner.x - rightInnerCorner.x;
  const rightIrisRatioX = rightEyeWidth !== 0
    ? (rightIris.x - rightInnerCorner.x) / rightEyeWidth
    : 0.5;

  // Vertical iris position: use upper and lower eyelid landmarks
  // Upper eyelid: left eye #159, right eye #386
  // Lower eyelid: left eye #145, right eye #374
  const leftUpperLid = landmarks[159];
  const leftLowerLid = landmarks[145];
  const rightUpperLid = landmarks[386];
  const rightLowerLid = landmarks[374];

  const leftEyeHeight = leftLowerLid.y - leftUpperLid.y;
  const leftIrisRatioY = leftEyeHeight > 0.001
    ? (leftIris.y - leftUpperLid.y) / leftEyeHeight
    : 0.5;

  const rightEyeHeight = rightLowerLid.y - rightUpperLid.y;
  const rightIrisRatioY = rightEyeHeight > 0.001
    ? (rightIris.y - rightUpperLid.y) / rightEyeHeight
    : 0.5;

  // Average both eyes for a combined gaze signal
  // Both ratios are normalized so that 0.5 = looking straight ahead
  const avgHorizontal = (leftIrisRatioX + rightIrisRatioX) / 2;
  const avgVertical = (leftIrisRatioY + rightIrisRatioY) / 2;

  // Check each iris individually — if either eye is focused in the
  // general direction of the screen, the person is looking at it.
  // One eye may be occluded or turned away while the other is still on-screen.
  const leftHDev = Math.abs(leftIrisRatioX - 0.5);
  const leftVDev = Math.abs(leftIrisRatioY - 0.5);
  const leftLooking = leftHDev <= IRIS_CENTER_TOLERANCE && leftVDev <= IRIS_CENTER_TOLERANCE;

  const rightHDev = Math.abs(rightIrisRatioX - 0.5);
  const rightVDev = Math.abs(rightIrisRatioY - 0.5);
  const rightLooking = rightHDev <= IRIS_CENTER_TOLERANCE && rightVDev <= IRIS_CENTER_TOLERANCE;

  const isLookingCenter = leftLooking || rightLooking;

  return {
    leftIrisRatioX: clamp(leftIrisRatioX, 0, 1),
    leftIrisRatioY: clamp(leftIrisRatioY, 0, 1),
    rightIrisRatioX: clamp(rightIrisRatioX, 0, 1),
    rightIrisRatioY: clamp(rightIrisRatioY, 0, 1),
    avgHorizontal: clamp(avgHorizontal, 0, 1),
    avgVertical: clamp(avgVertical, 0, 1),
    isLookingCenter,
  };
}

/**
 * Combined gaze estimation: fuses head pose and iris gaze to determine attention.
 *
 * Both conditions must be met for "attentive":
 * 1. Face is positioned toward the screen (head pose within thresholds: yaw ≤20°, pitch ≤15°)
 * 2. At least one iris is visibly looking at the screen (iris centered within tolerance)
 *
 * If either condition fails, the impression is not counted.
 * This ensures fair billing — only genuine, verifiable attention qualifies.
 */
export function estimateGaze(landmarks: NormalizedLandmark[]): GazeEstimate | null {
  const headPose = estimateHeadPose(landmarks);
  if (!headPose) return null;

  const irisGaze = estimateIrisGaze(landmarks);

  const headFacingScreen =
    Math.abs(headPose.yaw) <= HEAD_ONLY_YAW_THRESHOLD_DEG &&
    Math.abs(headPose.pitch) <= HEAD_ONLY_PITCH_THRESHOLD_DEG;

  // Both head facing screen AND iris confirmed looking at screen required
  const isAttentive = headFacingScreen && (irisGaze?.isLookingCenter ?? false);

  return {
    headPose,
    irisGaze,
    isAttentive,
    attentionSource: "head+iris" as const,
  };
}

export function isLookingAtScreen(angles: EulerAngles, yawThreshold: number, pitchThreshold: number): boolean {
  return Math.abs(angles.yaw) <= yawThreshold && Math.abs(angles.pitch) <= pitchThreshold;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
