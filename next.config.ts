import type { NextConfig } from "next";

/**
 * GitHub Pages serves the site under /<repo-name>.
 * Set GITHUB_PAGES=true in CI (and optionally locally to preview the export).
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "machine-learning-lab";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(isGithubPages
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? `/${repoName}` : "",
  },
};

export default nextConfig;
