"use client";

import { useState } from "react";
import type { PlaybackSession } from "@/lib/types";

interface PlaybackSimulatorProps {
  currentSession: PlaybackSession | null;
  onStart: (adName: string) => void;
  onStop: () => void;
}

export function PlaybackSimulator({ currentSession, onStart, onStop }: PlaybackSimulatorProps) {
  const [adName, setAdName] = useState("Demo Ad Campaign");

  const isActive = currentSession?.isActive ?? false;
  const elapsed = isActive && currentSession
    ? Math.floor((Date.now() - currentSession.startedAt) / 1000)
    : 0;

  return (
    <div className="bg-zinc-900 rounded-lg p-4 text-sm font-mono">
      <h3 className="text-zinc-400 font-bold mb-3 uppercase text-xs tracking-wider">
        Playback Simulator
      </h3>

      {!isActive ? (
        <div className="space-y-3">
          <input
            type="text"
            value={adName}
            onChange={(e) => setAdName(e.target.value)}
            placeholder="Ad campaign name"
            className="w-full bg-zinc-800 text-zinc-200 px-3 py-2 rounded border border-zinc-700 focus:border-blue-500 outline-none text-sm"
          />
          <button
            onClick={() => onStart(adName)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition-colors"
          >
            Start Ad Playback
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-bold">PLAYING</span>
          </div>
          <div className="text-zinc-300">
            <div>Ad: {currentSession?.adName}</div>
            <div>Duration: {elapsed}s</div>
            <div className="text-xs text-zinc-500">
              ID: {currentSession?.playbackId.slice(0, 8)}
            </div>
          </div>
          <button
            onClick={onStop}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium transition-colors"
          >
            Stop Playback
          </button>
        </div>
      )}
    </div>
  );
}
