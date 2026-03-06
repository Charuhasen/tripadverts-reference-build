// ── Enums ──

export enum BillingStatus {
  OTS = "OTS",           // Opportunity To See (detected)
  Viewable = "Viewable", // Looked ≥2s
  Qualified = "Qualified", // Met all criteria
}

export enum TrackingState {
  Active = "Active",
  Lost = "Lost",
}

export enum SystemMode {
  Standby = "Standby",
  Active = "Active",
}

// ── Core Interfaces ──

export interface BoundingBox {
  x: number;       // top-left x (normalized 0-1)
  y: number;       // top-left y (normalized 0-1)
  width: number;   // normalized width
  height: number;  // normalized height
}

export interface FaceDetection {
  boundingBox: BoundingBox;
  landmarks: NormalizedLandmark[];
  score: number;
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface TrackedFace {
  temporaryId: string;
  boundingBox: BoundingBox;
  landmarks: NormalizedLandmark[];
  centerX: number;
  centerY: number;
  firstSeenAt: number;
  lastSeenAt: number;
  state: TrackingState;
  featureVector: Float32Array | null;
  reIdCooldownUntil: number;
  seatId: string | null;
}

export interface EulerAngles {
  yaw: number;   // left-right rotation (degrees)
  pitch: number; // up-down rotation (degrees)
  roll: number;  // tilt rotation (degrees)
}

export interface IrisGaze {
  leftIrisRatioX: number;   // 0.0 = iris at outer corner, 1.0 = iris at inner corner
  leftIrisRatioY: number;   // 0.0 = iris at top, 1.0 = iris at bottom
  rightIrisRatioX: number;  // 0.0 = iris at inner corner, 1.0 = iris at outer corner
  rightIrisRatioY: number;  // 0.0 = iris at top, 1.0 = iris at bottom
  avgHorizontal: number;    // average horizontal gaze ratio (0.5 = centered)
  avgVertical: number;      // average vertical gaze ratio (0.5 = centered)
  isLookingCenter: boolean; // true if irises are near center of eye openings
}

export interface GazeEstimate {
  headPose: EulerAngles;
  irisGaze: IrisGaze | null;
  isAttentive: boolean;       // final combined decision: both head facing screen AND iris confirmed
  attentionSource: "head+iris"; // both signals required
}

export interface AttentionRecord {
  temporaryId: string;
  totalAttentionMs: number;
  isAttentive: boolean;
  lastUpdateAt: number;
}

export interface SeatEntry {
  seatId: string;
  featureVector: Float32Array;
  createdAt: number;
  lastMatchedAt: number;
}

export interface ImpressionRecord {
  id: string;
  deviceId: string;
  playbackId: string;
  seatId: string | null;
  temporaryId: string;
  billingStatus: BillingStatus;
  attentionDurationMs: number;
  dwellTimeMs: number;
  startedAt: number;
  endedAt: number | null;
  headPose: EulerAngles | null;
  gpsZone: string | null;
  multiplier: number;
}

export interface PlaybackSession {
  playbackId: string;
  adName: string;
  startedAt: number;
  endedAt: number | null;
  isActive: boolean;
}

export interface ProofOfPlay {
  playbackId: string;
  deviceId: string;
  adName: string;
  startedAt: number;
  endedAt: number;
  totalImpressions: number;
  viewableImpressions: number;
  qualifiedImpressions: number;
  impressions: ImpressionRecord[];
}

export interface GPSZone {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  multiplier: number;
}

export interface DeviceInfo {
  deviceId: string;
  isOnline: boolean;
  gpsZone: string | null;
  accelerometerMultiplier: number;
}

export interface EngineStats {
  faceCount: number;
  activeFaces: TrackedFace[];
  attentionRecords: Map<string, AttentionRecord>;
  gazeEstimates: Map<string, GazeEstimate>;
  impressions: ImpressionRecord[];
  currentSession: PlaybackSession | null;
  mode: SystemMode;
  deviceInfo: DeviceInfo;
  fps: number;
}
