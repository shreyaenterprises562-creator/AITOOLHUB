import { renderToString } from 'react-dom/server';
import App, { resolveRoute } from './App';
import type { PageSeoMeta } from './seoData';

export interface PrerenderResult {
  appHtml: string;
  seo: PageSeoMeta;
}

export function renderRoute(pathname: string): PrerenderResult {
  const resolved = resolveRoute(pathname);
  const appHtml = renderToString(<App initialPath={pathname} />);
  return {
    appHtml,
    seo: resolved.seo,
  };
}
