"use client";

import { CAMERA_WIDTH, CAMERA_HEIGHT } from "@/lib/constants";
import type { TrackedFace, AttentionRecord, GazeEstimate } from "@/lib/types";
import { TrackingState } from "@/lib/types";

interface DetectionOverlayProps {
  faces: TrackedFace[];
  attentionRecords: Map<string, AttentionRecord>;
  gazeEstimates: Map<string, GazeEstimate>;
}


export function DetectionOverlay({ faces, attentionRecords, gazeEstimates }: DetectionOverlayProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${CAMERA_WIDTH} ${CAMERA_HEIGHT}`}
      style={{ transform: "scaleX(-1)" }}
    >
      {faces.map((face) => {
        const attention = attentionRecords.get(face.temporaryId);
        const gaze = gazeEstimates.get(face.temporaryId);
        const headPose = gaze?.headPose;
        const irisGaze = gaze?.irisGaze;
        const isAttentive = attention?.isAttentive ?? false;
        const isLost = face.state === TrackingState.Lost;

        const color = isLost ? "#ef4444" : isAttentive ? "#22c55e" : "#eab308";
        const x = face.boundingBox.x * CAMERA_WIDTH;
        const y = face.boundingBox.y * CAMERA_HEIGHT;
        const w = face.boundingBox.width * CAMERA_WIDTH;
        const h = face.boundingBox.height * CAMERA_HEIGHT;

        const attMs = attention?.totalAttentionMs ?? 0;
        const attSec = (attMs / 1000).toFixed(1);
        const label = face.seatId
          ? `Seat ${face.seatId.slice(0, 6)}`
          : `T-${face.temporaryId.slice(0, 6)}`;


        // Nose tip position for gaze arrow origin
        const noseTip = face.landmarks.length > 1 ? face.landmarks[1] : null;
        const nosePx = noseTip
          ? { x: noseTip.x * CAMERA_WIDTH, y: noseTip.y * CAMERA_HEIGHT }
          : null;

        // Gaze direction arrow: project yaw/pitch into a 2D vector from the nose tip
        const gazeArrowLength = 40;
        let gazeEndX = 0;
        let gazeEndY = 0;
        if (nosePx && headPose) {
          const yawRad = (headPose.yaw * Math.PI) / 180;
          const pitchRad = (headPose.pitch * Math.PI) / 180;
          gazeEndX = nosePx.x + Math.sin(yawRad) * gazeArrowLength;
          gazeEndY = nosePx.y + Math.sin(pitchRad) * gazeArrowLength;
        }

        // Iris positions for visualization
        const leftIrisLm = face.landmarks.length >= 478 ? face.landmarks[468] : null;
        const rightIrisLm = face.landmarks.length >= 478 ? face.landmarks[473] : null;

        return (
          <g key={face.temporaryId}>
            {/* Bounding box */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              stroke={color}
              strokeWidth={2}
              fill="none"
              rx={4}
            />

            {/* Top label: ID + attention time + source */}
            <rect
              x={x}
              y={y - 22}
              width={Math.max(w, 180)}
              height={20}
              fill={color}
              rx={2}
            />
            <text
              x={x + 4}
              y={y - 7}
              fill="white"
              fontSize={11}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {label} | {attSec}s {isAttentive ? "Verified" : ""}
            </text>

            {/* Bottom label: head pose angles + iris gaze */}
            {headPose && (
              <>
                <rect
                  x={x}
                  y={y + h + 2}
                  width={Math.max(w, 200)}
                  height={irisGaze ? 32 : 18}
                  fill="rgba(0,0,0,0.7)"
                  rx={2}
                />
                <text
                  x={x + 4}
                  y={y + h + 14}
                  fill={isAttentive ? "#4ade80" : "#fbbf24"}
                  fontSize={10}
                  fontFamily="monospace"
                >
                  Head: Y:{headPose.yaw.toFixed(1)}° P:{headPose.pitch.toFixed(1)}° R:{headPose.roll.toFixed(1)}°
                </text>
                {irisGaze && (
                  <text
                    x={x + 4}
                    y={y + h + 28}
                    fill={irisGaze.isLookingCenter ? "#4ade80" : "#f87171"}
                    fontSize={10}
                    fontFamily="monospace"
                  >
                    Eyes: H:{irisGaze.avgHorizontal.toFixed(2)} V:{irisGaze.avgVertical.toFixed(2)}{" "}
                    {irisGaze.isLookingCenter ? "centered" : "off-center"}
                  </text>
                )}
              </>
            )}

            {/* Nose tip dot */}
            {nosePx && (
              <circle
                cx={nosePx.x}
                cy={nosePx.y}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={1}
              />
            )}

            {/* Iris center dots */}
            {leftIrisLm && (
              <circle
                cx={leftIrisLm.x * CAMERA_WIDTH}
                cy={leftIrisLm.y * CAMERA_HEIGHT}
                r={3}
                fill={irisGaze?.isLookingCenter ? "#4ade80" : "#f87171"}
                stroke="white"
                strokeWidth={0.5}
              />
            )}
            {rightIrisLm && (
              <circle
                cx={rightIrisLm.x * CAMERA_WIDTH}
                cy={rightIrisLm.y * CAMERA_HEIGHT}
                r={3}
                fill={irisGaze?.isLookingCenter ? "#4ade80" : "#f87171"}
                stroke="white"
                strokeWidth={0.5}
              />
            )}

            {/* Gaze direction arrow from nose tip */}
            {nosePx && headPose && (
              <>
                <line
                  x1={nosePx.x}
                  y1={nosePx.y}
                  x2={gazeEndX}
                  y2={gazeEndY}
                  stroke={isAttentive ? "#4ade80" : "#f87171"}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <circle
                  cx={gazeEndX}
                  cy={gazeEndY}
                  r={3}
                  fill={isAttentive ? "#4ade80" : "#f87171"}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
