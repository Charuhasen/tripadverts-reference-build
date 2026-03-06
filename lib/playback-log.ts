import type { PlaybackSession, ProofOfPlay, ImpressionRecord } from "./types";
import { BillingStatus } from "./types";
import { v4 as uuidv4 } from "uuid";

export function createPlaybackSession(adName: string): PlaybackSession {
  return {
    playbackId: uuidv4(),
    adName,
    startedAt: Date.now(),
    endedAt: null,
    isActive: true,
  };
}

export function endPlaybackSession(session: PlaybackSession): PlaybackSession {
  return {
    ...session,
    endedAt: Date.now(),
    isActive: false,
  };
}

export function createProofOfPlay(
  session: PlaybackSession,
  deviceId: string,
  impressions: ImpressionRecord[]
): ProofOfPlay {
  const sessionImpressions = impressions.filter(
    (imp) => imp.playbackId === session.playbackId
  );

  return {
    playbackId: session.playbackId,
    deviceId,
    adName: session.adName,
    startedAt: session.startedAt,
    endedAt: session.endedAt || Date.now(),
    totalImpressions: sessionImpressions.length,
    viewableImpressions: sessionImpressions.filter(
      (i) => i.billingStatus === BillingStatus.Viewable || i.billingStatus === BillingStatus.Qualified
    ).length,
    qualifiedImpressions: sessionImpressions.filter(
      (i) => i.billingStatus === BillingStatus.Qualified
    ).length,
    impressions: sessionImpressions,
  };
}
