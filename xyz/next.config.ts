import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Needed because the app is opened over the VPS's network IP/domain in
  // dev, not just localhost. Without this, Next.js blocks cross-origin
  // requests to dev-only resources (HMR, RSC payloads, etc). When that
  // happens the browser has a broken/partial client bundle, which shows up
  // as things like onClick handlers silently doing nothing — exactly what
  // was happening with the header dropdown in Firefox.
  //
  // Add every host/IP you actually browse the dev server from.
  allowedDevOrigins: [
    "200.141.11.175",
    // "your-domain.com",
  ],
};

export default nextConfig;
