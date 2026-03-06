"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useImpressionEngine } from "@/hooks/useImpressionEngine";
import { CameraFeed } from "./CameraFeed";
import { DetectionOverlay } from "./DetectionOverlay";
import { StatsPanel } from "./StatsPanel";
import { PlaybackSimulator } from "./PlaybackSimulator";
import { ImpressionLog } from "./ImpressionLog";
import { StatusBar } from "./StatusBar";

export function Dashboard() {
  const { videoRef, isStreaming, error, start } = useCamera();
  const { detections, isModelLoaded, fps, setOnDetection } = useFaceDetection(videoRef, isStreaming);
  const { stats, processDetections, startPlayback, stopPlayback } = useImpressionEngine(videoRef);

  // Wire detection callback to engine
  useEffect(() => {
    setOnDetection(processDetections);
  }, [setOnDetection, processDetections]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <StatusBar deviceInfo={stats.deviceInfo} mode={stats.mode} fps={fps} />

      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-zinc-100">
            DOOH Impression Tracker
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Smart Digital Out-of-Home impression tracking with face detection, gaze analysis, and billing classification
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Left: Camera */}
          <div className="shrink-0">
            <CameraFeed
              ref={videoRef}
              isStreaming={isStreaming}
              onStart={start}
              error={error}
            >
              {isStreaming && (
                <DetectionOverlay
                  faces={stats.activeFaces}
                  attentionRecords={stats.attentionRecords}
                  gazeEstimates={stats.gazeEstimates}
                />
              )}
            </CameraFeed>

            {isStreaming && !isModelLoaded && (
              <div className="mt-2 text-xs text-yellow-400 font-mono animate-pulse">
                Loading MediaPipe Face Landmarker...
              </div>
            )}
            {isStreaming && isModelLoaded && (
              <div className="mt-2 text-xs text-green-400 font-mono">
                MediaPipe ready | {stats.faceCount} face(s) detected
              </div>
            )}
          </div>

          {/* Right: Stats + Controls */}
          <div className="flex-1 flex flex-col gap-4 min-w-[280px]">
            <StatsPanel
              faceCount={stats.faceCount}
              activeFaces={stats.activeFaces}
              attentionRecords={stats.attentionRecords}
              gazeEstimates={stats.gazeEstimates}
              impressions={stats.impressions}
              multiplier={stats.deviceInfo.accelerometerMultiplier}
              gallerySize={0}
            />

            <PlaybackSimulator
              currentSession={stats.currentSession}
              onStart={startPlayback}
              onStop={stopPlayback}
            />
          </div>
        </div>

        {/* Bottom: Impression Log */}
        <div className="mt-4">
          <ImpressionLog impressions={stats.impressions} />
        </div>
      </div>
    </div>
  );
}
