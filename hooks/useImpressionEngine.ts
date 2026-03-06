"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { SpatialTracker } from "@/lib/spatial-tracker";
import { AttentionTimer } from "@/lib/attention-timer";
import { LocalSeatGallery } from "@/lib/re-id";
import { classifyImpression } from "@/lib/billing";
import { cleanupStaleData } from "@/lib/privacy";
import { initFeatureExtractor, extractFeatureVector, isFeatureExtractorReady } from "@/lib/feature-extractor";
import { createPlaybackSession, endPlaybackSession } from "@/lib/playback-log";
import { enqueueImpression } from "@/lib/offline-queue";
import { getDeviceId, getNetworkStatus } from "@/lib/device";
import { getCurrentPosition, findGPSZone } from "@/lib/sensor-fusion";
import { REID_COOLDOWN_MS, UI_UPDATE_INTERVAL_MS, DEFAULT_MULTIPLIER } from "@/lib/constants";
import {
  SystemMode,
  type FaceDetection,
  type TrackedFace,
  type AttentionRecord,
  type ImpressionRecord,
  type PlaybackSession,
  type EngineStats,
} from "@/lib/types";

export function useImpressionEngine(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const trackerRef = useRef(new SpatialTracker());
  const attentionTimerRef = useRef(new AttentionTimer());
  const galleryRef = useRef(new LocalSeatGallery());

  const [stats, setStats] = useState<EngineStats>({
    faceCount: 0,
    activeFaces: [],
    attentionRecords: new Map(),
    gazeEstimates: new Map(),
    impressions: [],
    currentSession: null,
    mode: SystemMode.Standby,
    deviceInfo: {
      deviceId: "",
      isOnline: true,
      gpsZone: null,
      accelerometerMultiplier: DEFAULT_MULTIPLIER,
    },
    fps: 0,
  });

  const sessionRef = useRef<PlaybackSession | null>(null);
  const impressionsRef = useRef<ImpressionRecord[]>([]);
  const deviceIdRef = useRef("");
  const gpsZoneRef = useRef<string | null>(null);
  const multiplierRef = useRef(DEFAULT_MULTIPLIER);
  const lastUiUpdateRef = useRef(0);
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Initialize device info
  useEffect(() => {
    deviceIdRef.current = getDeviceId();

    // Try to get GPS
    getCurrentPosition().then((pos) => {
      if (pos) {
        const zone = findGPSZone(pos.lat, pos.lon);
        if (zone) {
          gpsZoneRef.current = zone.name;
          multiplierRef.current = zone.multiplier;
        }
      }
    });

    // Try feature extractor init (non-blocking)
    initFeatureExtractor().catch(() => {
      // Feature extraction is optional - will work without re-id
    });

    // Cleanup timer
    cleanupIntervalRef.current = setInterval(() => {
      const wiped = cleanupStaleData(
        trackerRef.current,
        galleryRef.current,
        attentionTimerRef.current,
        Date.now()
      );
      if (wiped.length > 0) {
        updateUI();
      }
    }, 5000);

    return () => {
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current);
    };
  }, []);

  const updateUI = useCallback(() => {
    const tracker = trackerRef.current;
    const attTimer = attentionTimerRef.current;
    const activeFaces = tracker.getActiveFaces();
    setStats({
      faceCount: activeFaces.length,
      activeFaces: [...activeFaces],
      attentionRecords: attTimer.getAllRecords(),
      gazeEstimates: attTimer.getAllGazeEstimates(),
      impressions: [...impressionsRef.current],
      currentSession: sessionRef.current ? { ...sessionRef.current } : null,
      mode: sessionRef.current?.isActive ? SystemMode.Active : SystemMode.Standby,
      deviceInfo: {
        deviceId: deviceIdRef.current,
        isOnline: getNetworkStatus(),
        gpsZone: gpsZoneRef.current,
        accelerometerMultiplier: multiplierRef.current,
      },
      fps: 0,
    });
  }, []);

  // Process detections from the face detection loop
  const processDetections = useCallback(
    (detections: FaceDetection[]) => {
      const now = Date.now();
      const tracker = trackerRef.current;
      const attTimer = attentionTimerRef.current;
      const gallery = galleryRef.current;

      // Update spatial tracker
      const newFaces = tracker.update(detections, now);

      // Update attention (which now internally computes head pose + iris gaze) for all active faces
      const activeFaces = tracker.getActiveFaces();
      for (const face of activeFaces) {
        attTimer.update(face.temporaryId, face.landmarks, now);

        // Re-ID: only for new faces or those past cooldown
        if (
          isFeatureExtractorReady() &&
          videoRef.current &&
          now > face.reIdCooldownUntil &&
          !face.seatId
        ) {
          const vector = extractFeatureVector(videoRef.current, face.boundingBox);
          if (vector) {
            face.featureVector = vector;
            face.reIdCooldownUntil = now + REID_COOLDOWN_MS;

            const match = gallery.match(vector);
            if (match) {
              face.seatId = match.seatId;
            } else {
              face.seatId = gallery.addOrUpdate(vector);
            }
          }
        }

        // Create/update impression if playback is active
        if (sessionRef.current?.isActive) {
          const attention = attTimer.getRecord(face.temporaryId);
          if (attention) {
            updateImpression(face, attention, now);
          }
        }
      }

      // Throttled UI update
      if (now - lastUiUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
        lastUiUpdateRef.current = now;
        updateUI();
      }
    },
    [videoRef, updateUI]
  );

  const updateImpression = useCallback(
    (face: TrackedFace, attention: AttentionRecord, now: number) => {
      const session = sessionRef.current;
      if (!session) return;

      // Find existing impression for this face in current session
      let impression = impressionsRef.current.find(
        (i) =>
          i.temporaryId === face.temporaryId &&
          i.playbackId === session.playbackId &&
          !i.endedAt
      );

      const gazeEstimate = attentionTimerRef.current.getGazeEstimate(face.temporaryId);
      const headPose = gazeEstimate?.headPose ?? null;
      const billingStatus = classifyImpression(attention.totalAttentionMs);

      if (!impression) {
        impression = {
          id: uuidv4(),
          deviceId: deviceIdRef.current,
          playbackId: session.playbackId,
          seatId: face.seatId,
          temporaryId: face.temporaryId,
          billingStatus,
          attentionDurationMs: attention.totalAttentionMs,
          dwellTimeMs: now - face.firstSeenAt,
          startedAt: now,
          endedAt: null,
          headPose,
          gpsZone: gpsZoneRef.current,
          multiplier: multiplierRef.current,
        };
        impressionsRef.current.push(impression);
      } else {
        impression.billingStatus = billingStatus;
        impression.attentionDurationMs = attention.totalAttentionMs;
        impression.dwellTimeMs = now - face.firstSeenAt;
        impression.seatId = face.seatId;
        impression.headPose = headPose;
      }
    },
    []
  );

  const startPlayback = useCallback((adName: string) => {
    const session = createPlaybackSession(adName);
    sessionRef.current = session;
    updateUI();
  }, [updateUI]);

  const stopPlayback = useCallback(() => {
    if (!sessionRef.current) return;

    sessionRef.current = endPlaybackSession(sessionRef.current);

    // Close all open impressions
    const now = Date.now();
    for (const imp of impressionsRef.current) {
      if (imp.playbackId === sessionRef.current.playbackId && !imp.endedAt) {
        imp.endedAt = now;
        // Queue for offline sync
        enqueueImpression(imp).catch(console.error);
      }
    }

    updateUI();
  }, [updateUI]);

  return {
    stats,
    processDetections,
    startPlayback,
    stopPlayback,
  };
}
