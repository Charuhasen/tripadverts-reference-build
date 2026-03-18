import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        // Relaxed policy for all routes — allows external resources (map tiles, CDNs) to load
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      {
        // Strict COEP only on routes that use SharedArrayBuffer (face detection / WASM)
        // Add specific route patterns here as needed — do NOT use a broad wildcard
        source: "/face-detection(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
