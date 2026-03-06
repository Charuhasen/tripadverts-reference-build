import { VECTOR_WIPE_TIMEOUT_MS } from "./constants";
import type { SpatialTracker } from "./spatial-tracker";
import type { LocalSeatGallery } from "./re-id";
import type { AttentionTimer } from "./attention-timer";

export function cleanupStaleData(
  tracker: SpatialTracker,
  gallery: LocalSeatGallery,
  attentionTimer: AttentionTimer,
  now: number
): string[] {
  const wiped: string[] = [];
  const lostFaces = tracker.getLostFaces(now, VECTOR_WIPE_TIMEOUT_MS);

  for (const face of lostFaces) {
    // Wipe feature vector
    if (face.seatId) {
      gallery.remove(face.seatId);
    }
    // Remove attention record
    attentionTimer.removeRecord(face.temporaryId);
    // Remove from tracker
    tracker.removeFace(face.temporaryId);
    wiped.push(face.temporaryId);
  }

  return wiped;
}
