import { v4 as uuidv4 } from "uuid";
import { SPATIAL_THRESHOLD, LOST_TIMEOUT_MS } from "./constants";
import type { FaceDetection, TrackedFace } from "./types";
import { TrackingState } from "./types";

export class SpatialTracker {
  private faces: Map<string, TrackedFace> = new Map();

  update(detections: FaceDetection[], now: number): TrackedFace[] {
    const matched = new Set<string>();
    const newFaces: TrackedFace[] = [];

    // For each detection, find nearest existing tracked face
    for (const det of detections) {
      const cx = det.boundingBox.x + det.boundingBox.width / 2;
      const cy = det.boundingBox.y + det.boundingBox.height / 2;

      let bestId: string | null = null;
      let bestDist = Infinity;

      for (const [id, face] of this.faces) {
        if (matched.has(id)) continue;
        const dx = Math.abs(cx - face.centerX);
        const dy = Math.abs(cy - face.centerY);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dx <= SPATIAL_THRESHOLD && dy <= SPATIAL_THRESHOLD && dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      }

      if (bestId) {
        // Update existing track
        matched.add(bestId);
        const existing = this.faces.get(bestId)!;
        existing.boundingBox = det.boundingBox;
        existing.landmarks = det.landmarks;
        existing.centerX = cx;
        existing.centerY = cy;
        existing.lastSeenAt = now;
        existing.state = TrackingState.Active;
      } else {
        // New face
        const id = uuidv4();
        const tracked: TrackedFace = {
          temporaryId: id,
          boundingBox: det.boundingBox,
          landmarks: det.landmarks,
          centerX: cx,
          centerY: cy,
          firstSeenAt: now,
          lastSeenAt: now,
          state: TrackingState.Active,
          featureVector: null,
          reIdCooldownUntil: 0,
          seatId: null,
        };
        this.faces.set(id, tracked);
        newFaces.push(tracked);
      }
    }

    // Mark unmatched faces as lost, remove stale
    for (const [id, face] of this.faces) {
      if (!matched.has(id) && face.state === TrackingState.Active) {
        if (now - face.lastSeenAt > LOST_TIMEOUT_MS) {
          face.state = TrackingState.Lost;
        }
      }
    }

    return newFaces;
  }

  getActiveFaces(): TrackedFace[] {
    return Array.from(this.faces.values()).filter(
      (f) => f.state === TrackingState.Active
    );
  }

  getAllFaces(): TrackedFace[] {
    return Array.from(this.faces.values());
  }

  getFace(temporaryId: string): TrackedFace | undefined {
    return this.faces.get(temporaryId);
  }

  removeFace(temporaryId: string): void {
    this.faces.delete(temporaryId);
  }

  getLostFaces(now: number, timeoutMs: number): TrackedFace[] {
    return Array.from(this.faces.values()).filter(
      (f) => f.state === TrackingState.Lost && now - f.lastSeenAt > timeoutMs
    );
  }

  clear(): void {
    this.faces.clear();
  }
}
