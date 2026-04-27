import type { NextConfig } from "next";

// Next 16 made ESLint during build opt-in (no `next lint` step in the default
// build pipeline) so the pre-existing `as any` errors flagged by issue 020
// don't block deploys. We rely on `npm run lint` locally / in CI to surface
// them, and on TypeScript itself for the must-fix type errors.
const nextConfig: NextConfig = {};

export default nextConfig;
