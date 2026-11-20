export const SITE_URL = 'https://aitoolhub-five.vercel.app';
export const SITE_NAME = 'AI Tools Hub';

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[·.]/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function normalizePathname(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] || '/';
  if (clean === '/') return '/';
  const trimmed = clean.replace(/\/+$/, '');
  return `${trimmed}/`;
}

export function getCategoryPath(categoryNameOrSlug: string): string {
  return `/category/${slugify(categoryNameOrSlug)}/`;
}

export function getToolPath(toolNameOrSlug: string): string {
  return `/tool/${slugify(toolNameOrSlug)}/`;
}

export function getCanonicalUrl(pathname: string): string {
  const normalized = normalizePathname(pathname);
  return `${SITE_URL}${normalized}`;
}

export function getDisplayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
