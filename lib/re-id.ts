import { v4 as uuidv4 } from "uuid";
import { COSINE_SIMILARITY_THRESHOLD, FEATURE_VECTOR_DIM } from "./constants";
import type { SeatEntry } from "./types";

export class LocalSeatGallery {
  private gallery: Map<string, SeatEntry> = new Map();

  match(vector: Float32Array): { seatId: string; score: number } | null {
    let bestSeatId: string | null = null;
    let bestScore = -1;

    for (const [seatId, entry] of this.gallery) {
      const score = cosineSimilarity(vector, entry.featureVector);
      if (score > bestScore) {
        bestScore = score;
        bestSeatId = seatId;
      }
    }

    if (bestSeatId && bestScore >= COSINE_SIMILARITY_THRESHOLD) {
      const entry = this.gallery.get(bestSeatId)!;
      entry.lastMatchedAt = Date.now();
      return { seatId: bestSeatId, score: bestScore };
    }

    return null;
  }

  addOrUpdate(vector: Float32Array, existingSeatId?: string): string {
    const seatId = existingSeatId || uuidv4();
    this.gallery.set(seatId, {
      seatId,
      featureVector: new Float32Array(vector),
      createdAt: Date.now(),
      lastMatchedAt: Date.now(),
    });
    return seatId;
  }

  remove(seatId: string): void {
    this.gallery.delete(seatId);
  }

  size(): number {
    return this.gallery.size;
  }

  wipeVectors(): void {
    this.gallery.clear();
  }

  getAll(): SeatEntry[] {
    return Array.from(this.gallery.values());
  }
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
