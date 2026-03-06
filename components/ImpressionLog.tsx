"use client";

import type { ImpressionRecord } from "@/lib/types";
import { BillingStatus } from "@/lib/types";

interface ImpressionLogProps {
  impressions: ImpressionRecord[];
}

const statusColor: Record<BillingStatus, string> = {
  [BillingStatus.OTS]: "text-zinc-400",
  [BillingStatus.Viewable]: "text-yellow-400",
  [BillingStatus.Qualified]: "text-green-400",
};

const statusBg: Record<BillingStatus, string> = {
  [BillingStatus.OTS]: "bg-zinc-800",
  [BillingStatus.Viewable]: "bg-yellow-900/30",
  [BillingStatus.Qualified]: "bg-green-900/30",
};

export function ImpressionLog({ impressions }: ImpressionLogProps) {
  const sorted = [...impressions].reverse();

  return (
    <div className="bg-zinc-900 rounded-lg p-4 text-sm font-mono">
      <h3 className="text-zinc-400 font-bold mb-3 uppercase text-xs tracking-wider">
        Impression Log ({impressions.length} records)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-800">
              <th className="text-left py-2 pr-3">ID</th>
              <th className="text-left py-2 pr-3">Face</th>
              <th className="text-left py-2 pr-3">Status</th>
              <th className="text-right py-2 pr-3">Attention</th>
              <th className="text-right py-2 pr-3">Dwell</th>
              <th className="text-right py-2 pr-3">Multiplier</th>
              <th className="text-left py-2">Zone</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-zinc-600">
                  No impressions recorded. Start an ad playback to begin tracking.
                </td>
              </tr>
            )}
            {sorted.map((imp) => (
              <tr
                key={imp.id}
                className={`border-b border-zinc-800/50 ${statusBg[imp.billingStatus]}`}
              >
                <td className="py-1.5 pr-3 text-zinc-500">{imp.id.slice(0, 8)}</td>
                <td className="py-1.5 pr-3 text-zinc-300">
                  {imp.seatId ? `S-${imp.seatId.slice(0, 6)}` : `T-${imp.temporaryId.slice(0, 6)}`}
                </td>
                <td className={`py-1.5 pr-3 font-bold ${statusColor[imp.billingStatus]}`}>
                  {imp.billingStatus}
                </td>
                <td className="py-1.5 pr-3 text-right text-zinc-300">
                  {(imp.attentionDurationMs / 1000).toFixed(1)}s
                </td>
                <td className="py-1.5 pr-3 text-right text-zinc-300">
                  {(imp.dwellTimeMs / 1000).toFixed(1)}s
                </td>
                <td className="py-1.5 pr-3 text-right text-zinc-300">
                  {imp.multiplier}x
                </td>
                <td className="py-1.5 text-zinc-500">{imp.gpsZone ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
