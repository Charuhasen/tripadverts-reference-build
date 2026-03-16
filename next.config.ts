import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        // Apply strict COEP only to routes that need SharedArrayBuffer (e.g. face detection)
        source: "/((?!campaigns|fleet).*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        // Routes with Leaflet maps need to load external map tiles — use relaxed COEP
        source: "/(campaigns|fleet)(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
};

export default nextConfig;
