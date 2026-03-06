// ── Detection ──
export const TARGET_FPS = 15;
export const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
export const UI_UPDATE_HZ = 2;
export const UI_UPDATE_INTERVAL_MS = 1000 / UI_UPDATE_HZ;

// ── Spatial Tracking ──
export const SPATIAL_THRESHOLD = 0.15; // ±15% of frame dimensions
export const LOST_TIMEOUT_MS = 2000;   // Mark lost after 2s without match

// ── Head Pose / Attention ──
export const YAW_THRESHOLD_DEG = 20;
export const PITCH_THRESHOLD_DEG = 15;

// ── Re-ID ──
export const COSINE_SIMILARITY_THRESHOLD = 0.80;
export const REID_COOLDOWN_MS = 5000;
export const FEATURE_VECTOR_DIM = 128;

// ── Billing ──
export const VIEWABLE_THRESHOLD_MS = 2000;  // ≥2s for Viewable
export const QUALIFIED_THRESHOLD_MS = 5000; // ≥5s for Qualified

// ── Privacy ──
export const VECTOR_WIPE_TIMEOUT_MS = 60_000; // 60s no-face → wipe vectors

// ── Sensor Fusion ──
export const DEFAULT_MULTIPLIER = 1.0;
export const GPS_ZONES = [
  { id: "zone-a", name: "High Traffic Hub", lat: 25.2048, lon: 55.2708, radiusMeters: 500, multiplier: 1.5 },
  { id: "zone-b", name: "Mall Entrance", lat: 25.1972, lon: 55.2744, radiusMeters: 200, multiplier: 1.3 },
  { id: "zone-c", name: "Transit Station", lat: 25.2285, lon: 55.2867, radiusMeters: 300, multiplier: 1.4 },
];

// ── Camera ──
export const CAMERA_WIDTH = 640;
export const CAMERA_HEIGHT = 480;

// ── MediaPipe Landmark Indices ──
export const NOSE_TIP = 1;
export const LEFT_EYE_OUTER = 33;
export const RIGHT_EYE_OUTER = 263;
export const CHIN = 152;

// Iris center landmarks (MediaPipe Face Landmarker outputs 478 landmarks total)
export const LEFT_IRIS_CENTER = 468;
export const RIGHT_IRIS_CENTER = 473;

// Eye corner landmarks for measuring iris position within the eye opening
export const LEFT_EYE_INNER_CORNER = 133;   // inner corner of left eye
export const LEFT_EYE_OUTER_CORNER = 33;    // outer corner of left eye
export const RIGHT_EYE_INNER_CORNER = 362;  // inner corner of right eye
export const RIGHT_EYE_OUTER_CORNER = 263;  // outer corner of right eye

// ── Gaze / Attention ──
// Both head pose AND iris gaze must pass for an impression to count.
// Head must be facing the screen within these thresholds:
export const HEAD_ONLY_YAW_THRESHOLD_DEG = 20;
export const HEAD_ONLY_PITCH_THRESHOLD_DEG = 15;

// Iris gaze ratio: 0.5 = centered in eye, 0.0 = looking fully left/up, 1.0 = looking fully right/down
// How close to center at least one iris must be to count as "looking at screen"
export const IRIS_CENTER_TOLERANCE = 0.15; // ±15% from center (0.5)

// ── Offline Queue ──
export const OFFLINE_DB_NAME = "dooh-impressions";
export const OFFLINE_STORE_NAME = "queue";
export const SYNC_ENDPOINT = "/api/impressions"; // placeholder
