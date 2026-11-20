import fs from 'node:fs/promises';
import path from 'node:path';
import { AI_TOOLS } from '../src/data';
import {
  CATEGORY_LIST,
  ENRICHED_TOOLS,
  getAllPrerenderRoutes,
  getIndexableRoutes,
} from '../src/seoData';
import { SITE_URL, getCanonicalUrl } from '../src/siteConfig';

const DIST_DIR = path.join(process.cwd(), 'dist');

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

function record(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const badge = passed ? 'PASS' : 'FAIL';
  console.log(`[${badge}] ${name} — ${details}`);
}

function routeToFilePath(route: string): string {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, route.replace(/^\/+|\/+$/g, ''), 'index.html');
}

function extractSingle(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match ? match[1] : null;
}

async function run() {
  // 1. Dataset integrity check
  const nameCounts = new Map<string, number>();
  const slugCounts = new Map<string, number>();
  const urlCounts = new Map<string, number>();
  const invalidUrls: string[] = [];

  for (const tool of ENRICHED_TOOLS) {
    const kName = tool.name.toLowerCase();
    nameCounts.set(kName, (nameCounts.get(kName) || 0) + 1);
    slugCounts.set(tool.slug, (slugCounts.get(tool.slug) || 0) + 1);
    const kUrl = tool.url.replace(/\/+$/, '').toLowerCase();
    urlCounts.set(kUrl, (urlCounts.get(kUrl) || 0) + 1);
    try {
      const parsed = new URL(tool.url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        invalidUrls.push(tool.url);
      }
    } catch {
      invalidUrls.push(tool.url);
    }
  }

  const dupNames = [...nameCounts.entries()].filter(([, c]) => c > 1);
  const dupSlugs = [...slugCounts.entries()].filter(([, c]) => c > 1);
  const dupUrls = [...urlCounts.entries()].filter(([, c]) => c > 1);
  const categorySet = new Set(AI_TOOLS.map((t) => t.category));

  record(
    'Dataset integrity (156 tools & 12 categories)',
    AI_TOOLS.length === 156 && categorySet.size === 12 && invalidUrls.length === 0,
    `${AI_TOOLS.length} tools, ${categorySet.size} categories, ${invalidUrls.length} invalid URLs`,
  );
  record(
    'Duplicate tool name & slug check',
    dupNames.length === 0 && dupSlugs.length === 0,
    `${dupNames.length} duplicate names, ${dupSlugs.length} duplicate slugs`,
  );
  record(
    'Duplicate external URL check',
    dupUrls.length === 0,
    `${dupUrls.length} duplicate external URLs`,
  );

  // 2. Route generation & HTML crawlability check
  const allRoutes = getAllPrerenderRoutes();
  const indexableRoutes = new Set(getIndexableRoutes());

  const missingFiles: string[] = [];
  const emptyRootFiles: string[] = [];
  const missingH1Files: string[] = [];
  const badCanonicalFiles: string[] = [];
  const badRobotsFiles: string[] = [];
  const badJsonLdFiles: string[] = [];
  const placeholderLinks: string[] = [];
  const brokenInternalLinks: string[] = [];

  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();
  const validInternalPaths = new Set<string>([...allRoutes, '/sitemap.xml', '/robots.txt']);

  for (const route of allRoutes) {
    const filePath = routeToFilePath(route);
    let html: string;
    try {
      html = await fs.readFile(filePath, 'utf-8');
    } catch {
      missingFiles.push(route);
      continue;
    }

    // Check root is not empty
    if (html.includes('<div id="root"></div>')) {
      emptyRootFiles.push(route);
    }

    // Check single H1 exists in prerendered HTML
    const h1Matches = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/g) || [];
    if (h1Matches.length !== 1) {
      missingH1Files.push(`${route} (h1 count: ${h1Matches.length})`);
    }

    // Extract title & meta description
    const title = extractSingle(html, /<title>([\s\S]*?)<\/title>/);
    const description = extractSingle(
      html,
      /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/,
    );
    const canonical = extractSingle(
      html,
      /<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/,
    );
    const robots = extractSingle(
      html,
      /<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/,
    );

    if (title) {
      titles.set(title, [...(titles.get(title) || []), route]);
    } else {
      badCanonicalFiles.push(`${route} missing title`);
    }

    if (description) {
      descriptions.set(description, [...(descriptions.get(description) || []), route]);
    } else {
      badCanonicalFiles.push(`${route} missing description`);
    }

    const expectedCanonical = getCanonicalUrl(route);
    if (canonical !== expectedCanonical) {
      badCanonicalFiles.push(`${route}: expected ${expectedCanonical}, got ${canonical}`);
    }

    const expectedRobots = indexableRoutes.has(route) ? 'index, follow' : 'noindex, follow';
    if (robots !== expectedRobots) {
      badRobotsFiles.push(`${route}: expected "${expectedRobots}", got "${robots}"`);
    }

    // Validate JSON-LD blocks
    const jsonLdMatches = [
      ...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ];
    if (jsonLdMatches.length === 0) {
      badJsonLdFiles.push(`${route}: missing JSON-LD`);
    }
    for (const m of jsonLdMatches) {
      try {
        const parsed = JSON.parse(m[1]);
        if (!parsed['@context'] || !parsed['@type']) {
          badJsonLdFiles.push(`${route}: JSON-LD missing @context or @type`);
        }
      } catch (e) {
        badJsonLdFiles.push(`${route}: invalid JSON-LD (${String(e)})`);
      }
    }

    // Check internal links and placeholder href="#"
    const hrefMatches = [...html.matchAll(/href="([^"]*)"/g)];
    for (const m of hrefMatches) {
      const href = m[1];
      if (href === '#') {
        placeholderLinks.push(`${route} contains href="#"`);
      } else if (href.startsWith('/') && !href.startsWith('/assets/')) {
        const cleanHref = href.split(/[?#]/)[0];
        if (!validInternalPaths.has(cleanHref)) {
          brokenInternalLinks.push(`${route} -> ${href}`);
        }
      }
    }
  }

  // Verify 404.html exists and is noindex, nofollow
  let has404 = false;
  let fourOhFourRobots = '';
  try {
    const html404 = await fs.readFile(path.join(DIST_DIR, '404.html'), 'utf-8');
    has404 = html404.includes('Page Not Found') && !html404.includes('<div id="root"></div>');
    fourOhFourRobots =
      extractSingle(html404, /<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/) || '';
  } catch {
    has404 = false;
  }

  record(
    'Route generation & static HTML crawlability',
    missingFiles.length === 0 &&
      emptyRootFiles.length === 0 &&
      missingH1Files.length === 0 &&
      has404 &&
      fourOhFourRobots === 'noindex, nofollow',
    `${allRoutes.length} routes + 404.html verified (${missingFiles.length} missing, ${emptyRootFiles.length} empty roots, ${missingH1Files.length} H1 issues)`,
  );

  record(
    'Canonical URL validation',
    badCanonicalFiles.length === 0,
    badCanonicalFiles.length === 0
      ? `All ${allRoutes.length} routes have exact self-referencing canonical URLs`
      : badCanonicalFiles.slice(0, 5).join('; '),
  );

  record(
    'Robots meta directive validation (index vs noindex)',
    badRobotsFiles.length === 0,
    badRobotsFiles.length === 0
      ? `${indexableRoutes.size} indexable routes, ${allRoutes.length - indexableRoutes.size} noindex,follow routes`
      : badRobotsFiles.slice(0, 5).join('; '),
  );

  const dupTitles = [...titles.entries()].filter(([, routes]) => routes.length > 1);
  const dupDescs = [...descriptions.entries()].filter(([, routes]) => routes.length > 1);

  record(
    'Duplicate metadata check (titles & descriptions)',
    dupTitles.length === 0 && dupDescs.length === 0,
    `${dupTitles.length} duplicate titles, ${dupDescs.length} duplicate descriptions across ${allRoutes.length} routes`,
  );

  record(
    'JSON-LD syntax validation',
    badJsonLdFiles.length === 0,
    badJsonLdFiles.length === 0
      ? `All JSON-LD scripts parsed cleanly across ${allRoutes.length} routes`
      : badJsonLdFiles.slice(0, 5).join('; '),
  );

  record(
    'Internal link & placeholder check',
    placeholderLinks.length === 0 && brokenInternalLinks.length === 0,
    placeholderLinks.length === 0 && brokenInternalLinks.length === 0
      ? `Zero href="#" placeholders and zero broken internal links across ${allRoutes.length} routes`
      : [...placeholderLinks, ...brokenInternalLinks].slice(0, 5).join('; '),
  );

  // 3. Sitemap validation
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  const sitemapXml = await fs.readFile(sitemapPath, 'utf-8');
  const locMatches = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const uniqueLocs = new Set(locMatches);
  const expectedLocs = new Set([...indexableRoutes].map((r) => getCanonicalUrl(r)));
  const hasLastmod = /<lastmod>/i.test(sitemapXml);
  const allMatchOrigin = locMatches.every((url) => url.startsWith(`${SITE_URL}/`));
  const exactSitemapMatch =
    locMatches.length === uniqueLocs.size &&
    uniqueLocs.size === expectedLocs.size &&
    [...uniqueLocs].every((u) => expectedLocs.has(u));

  record(
    'Sitemap.xml validation',
    sitemapXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>') &&
      exactSitemapMatch &&
      !hasLastmod &&
      allMatchOrigin,
    `${locMatches.length} canonical URLs, 0 duplicates, 0 noindex URLs, 0 external URLs, 0 fake lastmod dates`,
  );

  // 4. Robots.txt validation
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  const robotsTxt = await fs.readFile(robotsPath, 'utf-8');
  const robotsValid =
    robotsTxt.includes('User-agent: *') &&
    robotsTxt.includes('Allow: /') &&
    !robotsTxt.includes('Disallow: /assets') &&
    robotsTxt.includes(`Sitemap: ${SITE_URL}/sitemap.xml`);

  record(
    'Robots.txt validation',
    robotsValid,
    robotsValid ? `Allow: / and Sitemap: ${SITE_URL}/sitemap.xml verified` : 'Invalid robots.txt',
  );

  // 5. GSC Priority Pages verification
  const gscPrioritySlugs = ['gamma-ai', 'magician', 'benevolentai', 'tempus', 'dora-ai'];
  const gscIssues: string[] = [];
  for (const slug of gscPrioritySlugs) {
    const route = `/tool/${slug}/`;
    const html = await fs.readFile(routeToFilePath(route), 'utf-8');
    if (!html.includes('content="index, follow"')) {
      gscIssues.push(`${route} not indexable`);
    }
    if (!html.includes('Verified Overview')) {
      gscIssues.push(`${route} missing verified overview`);
    }
    if (!uniqueLocs.has(getCanonicalUrl(route))) {
      gscIssues.push(`${route} missing from sitemap.xml`);
    }
  }

  record(
    'GSC Priority Pages (5 verified tool pages)',
    gscIssues.length === 0,
    gscIssues.length === 0
      ? `All 5 priority pages (${gscPrioritySlugs.join(', ')}) are prerendered, verified, indexable, and in sitemap.xml`
      : gscIssues.join('; '),
  );

  // 6. Category pages verification
  const categoryIssues: string[] = [];
  for (const cat of CATEGORY_LIST) {
    const route = `/category/${cat.slug}/`;
    const html = await fs.readFile(routeToFilePath(route), 'utf-8');
    if (!html.includes(`<h1>`) && !html.includes(`<h1 `)) {
      categoryIssues.push(`${route} missing H1`);
    }
    if (!html.includes('CollectionPage') || !html.includes('BreadcrumbList')) {
      categoryIssues.push(`${route} missing CollectionPage or BreadcrumbList JSON-LD`);
    }
  }

  record(
    'Category pages (12 categories)',
    categoryIssues.length === 0,
    categoryIssues.length === 0
      ? `All ${CATEGORY_LIST.length} category pages verified with unique content, breadcrumbs, and structured data`
      : categoryIssues.join('; '),
  );

  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`\nSummary: ${results.length - failedCount}/${results.length} checks passed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('SEO verification error:', err);
  process.exit(1);
});
