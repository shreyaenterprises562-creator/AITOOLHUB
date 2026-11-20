import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SITE_NAME, normalizePathname } from './siteConfig';
import type { PageSeoMeta } from './seoData';

interface RouterContextValue {
  pathname: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  pathname: '/',
  navigate: () => {},
});

export function RouterProvider({
  initialPath,
  children,
}: {
  initialPath?: string;
  children: React.ReactNode;
}) {
  const [pathname, setPathname] = useState<string>(() => {
    if (initialPath) return normalizePathname(initialPath);
    if (typeof window !== 'undefined') return normalizePathname(window.location.pathname);
    return '/';
  });

  const navigate = useCallback((to: string) => {
    if (typeof window === 'undefined') return;
    const [rawPath, hash] = to.split('#');
    const targetPath = normalizePathname(rawPath || '/');
    const fullUrl = hash ? `${targetPath}#${hash}` : targetPath;

    if (normalizePathname(window.location.pathname) !== targetPath || window.location.hash !== (hash ? `#${hash}` : '')) {
      window.history.pushState({}, '', fullUrl);
    }

    setPathname(targetPath);

    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setPathname(normalizePathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function Link({ to, onClick, target, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target && target !== '_self')
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} target={target} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function useDocumentSeo(seo: PageSeoMeta) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.title = seo.title;
    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'robots', seo.robots);
    upsertCanonical(seo.canonical);

    upsertMeta('property', 'og:type', seo.ogType);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:url', seo.canonical);

    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);

    // Replace managed JSON-LD scripts
    document.head
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((node) => node.remove());

    for (const schema of seo.jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [seo]);
}
