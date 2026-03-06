"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { initFaceLandmarker, detectFaces } from "@/lib/face-detection";
import { FRAME_INTERVAL_MS, UI_UPDATE_INTERVAL_MS } from "@/lib/constants";
import type { FaceDetection } from "@/lib/types";

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isStreaming: boolean
) {
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [fps, setFps] = useState(0);
  const detectionsRef = useRef<FaceDetection[]>([]);
  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(performance.now());
  const onDetectionRef = useRef<((d: FaceDetection[]) => void) | null>(null);

  const setOnDetection = useCallback(
    (cb: (d: FaceDetection[]) => void) => {
      onDetectionRef.current = cb;
    },
    []
  );

  useEffect(() => {
    if (!isStreaming) return;

    let cancelled = false;

    initFaceLandmarker().then(() => {
      if (!cancelled) setIsModelLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isStreaming]);

  useEffect(() => {
    if (!isModelLoaded || !isStreaming || !videoRef.current) return;

    const video = videoRef.current;

    const loop = () => {
      const now = performance.now();

      if (now - lastFrameTimeRef.current >= FRAME_INTERVAL_MS) {
        lastFrameTimeRef.current = now;

        if (video.readyState >= 2) {
          const results = detectFaces(video, now);
          detectionsRef.current = results;
          frameCountRef.current++;

          // Call external detection callback
          if (onDetectionRef.current) {
            onDetectionRef.current(results);
          }

          // Update UI at lower frequency
          if (now - lastUiUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
            lastUiUpdateRef.current = now;
            setDetections([...results]);

            // Calculate FPS
            const elapsed = now - fpsTimerRef.current;
            if (elapsed >= 1000) {
              setFps(
                Math.round((frameCountRef.current / elapsed) * 1000)
              );
              frameCountRef.current = 0;
              fpsTimerRef.current = now;
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isModelLoaded, isStreaming, videoRef]);

  return { detections, isModelLoaded, fps, detectionsRef, setOnDetection };
}
