import React, { useState } from 'react';
import { Menu, Sparkles, X } from 'lucide-react';
import { Link, useRouter } from '../router';
import { CATEGORY_LIST, ENRICHED_TOOLS } from '../seoData';
import { getCategoryPath } from '../siteConfig';

const FEATURED_FOOTER_CATEGORIES = [
  'Chatbots',
  'Design AI',
  'Coding AI',
  'Video AI',
  'Automation AI',
  'Research AI',
  'Data AI',
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDirectoryActive = pathname === '/';
  const isCategoriesActive =
    pathname === '/categories/' || pathname.startsWith('/category/');

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              AI Tools Hub
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm font-medium text-slate-600">
              <li>
                <Link
                  to="/"
                  className={`rounded-md px-1 py-1 transition-colors hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                    isDirectoryActive ? 'font-semibold text-indigo-600' : ''
                  }`}
                >
                  Directory
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/"
                  className={`rounded-md px-1 py-1 transition-colors hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                    isCategoriesActive ? 'font-semibold text-indigo-600' : ''
                  }`}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/category/design-ai/"
                  className="rounded-md px-1 py-1 transition-colors hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  Design AI
                </Link>
              </li>
              <li>
                <Link
                  to="/category/coding-ai/"
                  className="rounded-md px-1 py-1 transition-colors hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  Coding AI
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/categories/"
              className="hidden rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 sm:inline-flex"
            >
              Browse {CATEGORY_LIST.length} Categories
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 md:hidden"
            >
              {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-t border-slate-200 bg-white px-4 py-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isDirectoryActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Directory ({ENRICHED_TOOLS.length} Tools)
              </Link>
              <Link
                to="/categories/"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isCategoriesActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Categories ({CATEGORY_LIST.length})
              </Link>
              <div className="mt-2 border-t border-slate-100 pt-3">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Popular Categories
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORY_LIST.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={getCategoryPath(cat.slug)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <Sparkles className="text-indigo-600" size={24} aria-hidden="true" />
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  AI Tools Hub
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                Curated directory of {ENRICHED_TOOLS.length} AI tools across {CATEGORY_LIST.length}{' '}
                categories with direct links to official vendor websites.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                Explore
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li>
                  <Link to="/" className="hover:text-indigo-600">
                    All AI Tools Directory
                  </Link>
                </li>
                <li>
                  <Link to="/categories/" className="hover:text-indigo-600">
                    Browse All Categories
                  </Link>
                </li>
                <li>
                  <a href="/sitemap.xml" className="hover:text-indigo-600">
                    XML Sitemap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                Categories
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                {FEATURED_FOOTER_CATEGORIES.map((name) => (
                  <li key={name}>
                    <Link to={getCategoryPath(name)} className="hover:text-indigo-600">
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-500 sm:flex sm:items-center sm:justify-between sm:text-left">
            <p>© 2026 AI Tools Hub. Official links directory for AI software discovery.</p>
            <p className="mt-2 sm:mt-0">
              {ENRICHED_TOOLS.length} tools · {CATEGORY_LIST.length} categories
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
