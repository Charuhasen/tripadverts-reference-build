import { estimateGaze } from "./head-pose";
import type { NormalizedLandmark, AttentionRecord, GazeEstimate } from "./types";

export class AttentionTimer {
  private records: Map<string, AttentionRecord> = new Map();
  private lastGazeEstimates: Map<string, GazeEstimate> = new Map();

  update(temporaryId: string, landmarks: NormalizedLandmark[], now: number): AttentionRecord {
    let record = this.records.get(temporaryId);
    if (!record) {
      record = {
        temporaryId,
        totalAttentionMs: 0,
        isAttentive: false,
        lastUpdateAt: now,
      };
      this.records.set(temporaryId, record);
    }

    const gazeEstimate = estimateGaze(landmarks);
    const attentive = gazeEstimate?.isAttentive ?? false;

    if (gazeEstimate) {
      this.lastGazeEstimates.set(temporaryId, gazeEstimate);
    }

    if (attentive && record.isAttentive) {
      // Accumulate time since last update
      const delta = now - record.lastUpdateAt;
      record.totalAttentionMs += delta;
    }

    record.isAttentive = attentive;
    record.lastUpdateAt = now;
    return record;
  }

  getRecord(temporaryId: string): AttentionRecord | undefined {
    return this.records.get(temporaryId);
  }

  getGazeEstimate(temporaryId: string): GazeEstimate | undefined {
    return this.lastGazeEstimates.get(temporaryId);
  }

  getAllGazeEstimates(): Map<string, GazeEstimate> {
    return new Map(this.lastGazeEstimates);
  }

  getAllRecords(): Map<string, AttentionRecord> {
    return new Map(this.records);
  }

  removeRecord(temporaryId: string): void {
    this.records.delete(temporaryId);
    this.lastGazeEstimates.delete(temporaryId);
  }

  clear(): void {
    this.records.clear();
    this.lastGazeEstimates.clear();
  }
}
