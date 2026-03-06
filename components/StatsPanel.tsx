"use client";

import type { TrackedFace, AttentionRecord, ImpressionRecord, GazeEstimate } from "@/lib/types";
import { BillingStatus } from "@/lib/types";

interface StatsPanelProps {
  faceCount: number;
  activeFaces: TrackedFace[];
  attentionRecords: Map<string, AttentionRecord>;
  gazeEstimates: Map<string, GazeEstimate>;
  impressions: ImpressionRecord[];
  multiplier: number;
  gallerySize: number;
}


export function StatsPanel({
  faceCount,
  activeFaces,
  attentionRecords,
  gazeEstimates,
  impressions,
  multiplier,
  gallerySize,
}: StatsPanelProps) {
  const attentiveCount = Array.from(attentionRecords.values()).filter(
    (r) => r.isAttentive
  ).length;

  const otsCount = impressions.filter((i) => i.billingStatus === BillingStatus.OTS).length;
  const viewableCount = impressions.filter((i) => i.billingStatus === BillingStatus.Viewable).length;
  const qualifiedCount = impressions.filter((i) => i.billingStatus === BillingStatus.Qualified).length;

  return (
    <div className="bg-zinc-900 rounded-lg p-4 text-sm font-mono">
      <h3 className="text-zinc-400 font-bold mb-3 uppercase text-xs tracking-wider">
        Real-Time Metrics
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Faces Detected" value={faceCount} color="text-blue-400" />
        <Stat label="Attentive" value={attentiveCount} color="text-green-400" />
        <Stat label="Gallery Size" value={gallerySize} color="text-purple-400" />
        <Stat label="Multiplier" value={`${multiplier}x`} color="text-yellow-400" />
      </div>

      <hr className="border-zinc-800 my-3" />

      <h3 className="text-zinc-400 font-bold mb-3 uppercase text-xs tracking-wider">
        Billing Breakdown
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="OTS" value={otsCount} color="text-zinc-400" />
        <Stat label="Viewable" value={viewableCount} color="text-yellow-400" />
        <Stat label="Qualified" value={qualifiedCount} color="text-green-400" />
      </div>

      <hr className="border-zinc-800 my-3" />

      <h3 className="text-zinc-400 font-bold mb-3 uppercase text-xs tracking-wider">
        Active Faces
      </h3>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {activeFaces.length === 0 && (
          <p className="text-zinc-600 text-xs">No faces detected</p>
        )}
        {activeFaces.map((face) => {
          const att = attentionRecords.get(face.temporaryId);
          const gaze = gazeEstimates.get(face.temporaryId);
          const headPose = gaze?.headPose;
          const irisGaze = gaze?.irisGaze;
          return (
            <div key={face.temporaryId} className="border-b border-zinc-800/50 pb-1.5 mb-1.5 last:border-0 last:pb-0 last:mb-0">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">
                  {face.seatId ? `Seat ${face.seatId.slice(0, 6)}` : `T-${face.temporaryId.slice(0, 6)}`}
                </span>
                <span className={att?.isAttentive ? "text-green-400" : "text-zinc-500"}>
                  {att?.isAttentive ? "Looking" : "Away"} | {((att?.totalAttentionMs ?? 0) / 1000).toFixed(1)}s
                </span>
              </div>
              {headPose && (
                <div className="flex gap-3 text-[10px] text-zinc-500 mt-0.5">
                  <span>Yaw: <span className={Math.abs(headPose.yaw) <= 20 ? "text-green-400" : "text-red-400"}>{headPose.yaw.toFixed(1)}°</span></span>
                  <span>Pitch: <span className={Math.abs(headPose.pitch) <= 15 ? "text-green-400" : "text-red-400"}>{headPose.pitch.toFixed(1)}°</span></span>
                  <span>Roll: <span className="text-zinc-400">{headPose.roll.toFixed(1)}°</span></span>
                </div>
              )}
              {irisGaze && (
                <div className="flex gap-3 text-[10px] text-zinc-500 mt-0.5">
                  <span>Eyes H: <span className={irisGaze.isLookingCenter ? "text-green-400" : "text-red-400"}>{irisGaze.avgHorizontal.toFixed(2)}</span></span>
                  <span>Eyes V: <span className={irisGaze.isLookingCenter ? "text-green-400" : "text-red-400"}>{irisGaze.avgVertical.toFixed(2)}</span></span>
                  <span className={irisGaze.isLookingCenter ? "text-green-400" : "text-zinc-600"}>
                    {irisGaze.isLookingCenter ? "centered" : "off-center"}
                  </span>
                </div>
              )}
              {gaze && att?.isAttentive && (
                <div className="text-[10px] text-green-400 mt-0.5">
                  Verified: Head + Eyes
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div className="text-zinc-500 text-xs">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
