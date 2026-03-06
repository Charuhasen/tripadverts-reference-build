"use client";

import type { DeviceInfo } from "@/lib/types";
import { SystemMode } from "@/lib/types";

interface StatusBarProps {
  deviceInfo: DeviceInfo;
  mode: SystemMode;
  fps: number;
}

export function StatusBar({ deviceInfo, mode, fps }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 text-zinc-300 text-sm font-mono rounded-t-lg border-b border-zinc-800">
      <div className="flex items-center gap-4">
        <span className="text-zinc-500">Device:</span>
        <span className="text-zinc-200">{deviceInfo.deviceId.slice(0, 8)}...</span>
      </div>
      <div className="flex items-center gap-4">
        <span className={deviceInfo.isOnline ? "text-green-400" : "text-red-400"}>
          {deviceInfo.isOnline ? "Online" : "Offline"}
        </span>
        <span className="text-zinc-500">|</span>
        <span>GPS: {deviceInfo.gpsZone ?? "No Zone"}</span>
        <span className="text-zinc-500">|</span>
        <span>FPS: {fps}</span>
        <span className="text-zinc-500">|</span>
        <span
          className={
            mode === SystemMode.Active
              ? "text-green-400 font-bold"
              : "text-yellow-400"
          }
        >
          {mode}
        </span>
      </div>
    </div>
  );
}
