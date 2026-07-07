/**
 * Next.js only auto-prefixes basePath for <Image>/<Link>/router calls.
 * Raw strings passed to useTexture(), <img src>, CSS url(), etc. need
 * manual prefixing or they'll 404 on GitHub Pages project sites
 * (yourname.github.io/repo-name/...).
 */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${base}${path}`;
}
