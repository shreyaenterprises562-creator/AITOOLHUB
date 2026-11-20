import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  getAllPrerenderRoutes,
  getIndexableRoutes,
  type PageSeoMeta,
} from '../src/seoData';
import { SITE_NAME, SITE_URL, getCanonicalUrl } from '../src/siteConfig';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SSR_DIR = path.join(ROOT_DIR, '.ssr-temp');

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSeoHeadHtml(seo: PageSeoMeta): string {
  const titleText = escapeHtmlText(seo.title);
  const titleAttr = escapeHtmlAttr(seo.title);
  const descAttr = escapeHtmlAttr(seo.description);
  const canonicalAttr = escapeHtmlAttr(seo.canonical);
  const robotsAttr = escapeHtmlAttr(seo.robots);
  const ogTypeAttr = escapeHtmlAttr(seo.ogType);
  const siteNameAttr = escapeHtmlAttr(SITE_NAME);

  const jsonLdBlocks = seo.jsonLd
    .map(
      (schema) =>
        `    <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`,
    )
    .join('\n');

  const lines = [
    `    <title>${titleText}</title>`,
    `    <meta name="description" content="${descAttr}" />`,
    `    <meta name="robots" content="${robotsAttr}" />`,
    `    <link rel="canonical" href="${canonicalAttr}" />`,
    `    <meta property="og:type" content="${ogTypeAttr}" />`,
    `    <meta property="og:site_name" content="${siteNameAttr}" />`,
    `    <meta property="og:title" content="${titleAttr}" />`,
    `    <meta property="og:description" content="${descAttr}" />`,
    `    <meta property="og:url" content="${canonicalAttr}" />`,
    `    <meta name="twitter:card" content="summary" />`,
    `    <meta name="twitter:title" content="${titleAttr}" />`,
    `    <meta name="twitter:description" content="${descAttr}" />`,
  ];

  if (jsonLdBlocks) {
    lines.push(jsonLdBlocks);
  }

  return lines.join('\n');
}

function injectIntoTemplate(template: string, appHtml: string, seo: PageSeoMeta): string {
  const seoMarkerRegex = /<!--\s*SEO_HEAD_START\s*-->[\s\S]*?<!--\s*SEO_HEAD_END\s*-->/;
  if (!seoMarkerRegex.test(template)) {
    throw new Error('Missing SEO_HEAD_START / SEO_HEAD_END markers in dist/index.html');
  }

  const rootDivRegex = /<div id="root"><\/div>/;
  if (!rootDivRegex.test(template)) {
    throw new Error('Missing <div id="root"></div> placeholder in dist/index.html');
  }

  const withHead = template.replace(
    seoMarkerRegex,
    `<!-- SEO_HEAD_START -->\n${buildSeoHeadHtml(seo)}\n    <!-- SEO_HEAD_END -->`,
  );

  return withHead.replace(rootDivRegex, `<div id="root">${appHtml}</div>`);
}

function routeToFilePath(route: string): string {
  if (route === '/') {
    return path.join(DIST_DIR, 'index.html');
  }
  const clean = route.replace(/^\/+|\/+$/g, '');
  return path.join(DIST_DIR, clean, 'index.html');
}

function buildSitemapXml(routes: string[]): string {
  const uniqueUrls = Array.from(new Set(routes.map((route) => getCanonicalUrl(route))));
  const entries = uniqueUrls
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function run() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  const template = await fs.readFile(templatePath, 'utf-8');

  const ssrEntryPath = path.join(SSR_DIR, 'entry-server.js');
  const ssrModule = (await import(pathToFileURL(ssrEntryPath).href)) as {
    renderRoute: (pathname: string) => { appHtml: string; seo: PageSeoMeta };
  };

  const routes = getAllPrerenderRoutes();

  for (const route of routes) {
    const { appHtml, seo } = ssrModule.renderRoute(route);
    const html = injectIntoTemplate(template, appHtml, seo);
    const outputFile = routeToFilePath(route);
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, html, 'utf-8');
  }

  // Generate 404.html for Vercel static hosting
  const notFound = ssrModule.renderRoute('/404/');
  const notFoundHtml = injectIntoTemplate(template, notFound.appHtml, notFound.seo);
  await fs.writeFile(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf-8');

  // Generate sitemap.xml containing ONLY indexable canonical routes
  const indexableRoutes = getIndexableRoutes();
  const sitemapXml = buildSitemapXml(indexableRoutes);
  await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');

  // Ensure robots.txt exists in dist/
  const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), robotsContent, 'utf-8');

  // Clean temporary SSR bundle directory
  await fs.rm(SSR_DIR, { recursive: true, force: true });

  console.log(
    `Prerendered ${routes.length} routes + 404.html. Generated sitemap.xml with ${indexableRoutes.length} indexable URLs and robots.txt.`,
  );
}

run().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
