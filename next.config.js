/** @type {import('next').NextConfig} */

// IMPORTANT: set this to your actual GitHub repo name if this is a
// PROJECT page (e.g. github.com/yourname/dragons-call → served at
// yourname.github.io/dragons-call/). Leave it as '' if this repo IS
// named exactly "yourname.github.io" (a USER page, served at the root).
const REPO_NAME = 'dragons-call';

const isProjectPage = true; // flip to false for a username.github.io user page
const basePath = isProjectPage ? `/${REPO_NAME}` : '';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath,
  env: {
    // Exposed to the client so we can prefix manually-referenced
    // public/ assets (texture URLs) that Next.js does NOT auto-prefix.
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
