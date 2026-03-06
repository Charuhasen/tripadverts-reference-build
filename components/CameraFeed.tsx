"use client";

import { forwardRef } from "react";
import { CAMERA_WIDTH, CAMERA_HEIGHT } from "@/lib/constants";

interface CameraFeedProps {
  isStreaming: boolean;
  onStart: () => void;
  error: string | null;
  children?: React.ReactNode;
}

export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  function CameraFeed({ isStreaming, onStart, error, children }, ref) {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ width: CAMERA_WIDTH, height: CAMERA_HEIGHT }}>
        <video
          ref={ref}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          style={{ transform: "scaleX(-1)" }}
        />

        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900">
            <button
              onClick={onStart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Enable Camera
            </button>
            {error && (
              <p className="text-red-400 text-sm max-w-xs text-center">{error}</p>
            )}
          </div>
        )}

        {children}
      </div>
    );
  }
);
