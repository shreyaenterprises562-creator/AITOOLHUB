import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, HelpCircle, Search } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ToolCard } from '../components/ToolCard';
import { Link } from '../router';
import {
  CATEGORY_LIST,
  type CategoryInfo,
  getToolsByCategorySlug,
} from '../seoData';
import { getCategoryPath } from '../siteConfig';

export function CategoryPage({ category }: { category: CategoryInfo }) {
  const [query, setQuery] = useState('');
  const allCategoryTools = useMemo(
    () => getToolsByCategorySlug(category.slug),
    [category.slug],
  );

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCategoryTools;
    return allCategoryTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q),
    );
  }, [allCategoryTools, query]);

  const otherCategories = CATEGORY_LIST.filter((c) => c.slug !== category.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Categories', to: '/categories/' },
          { label: category.name },
        ]}
      />

      {/* Category Hero */}
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {allCategoryTools.length} {allCategoryTools.length === 1 ? 'Tool' : 'Tools'} Listed
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {category.name} Tools
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
          {category.intro}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {category.focusAreas.map((area) => (
            <div
              key={area}
              className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-indigo-600"
                aria-hidden="true"
              />
              <span>{area}</span>
            </div>
          ))}
        </div>

        {/* Category Search */}
        <div className="mt-8 max-w-xl">
          <label htmlFor="category-search" className="sr-only">
            Filter {category.name} tools
          </label>
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-4 text-slate-400"
              size={18}
              aria-hidden="true"
            />
            <input
              id="category-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search within ${allCategoryTools.length} ${category.name} tools...`}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <section aria-labelledby="category-tools-heading" className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="category-tools-heading" className="text-2xl font-bold text-slate-900">
            {filteredTools.length} {category.name}{' '}
            {filteredTools.length === 1 ? 'Tool' : 'Tools'}
          </h2>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              Reset search
            </button>
          )}
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} headingLevel="h3" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-900">
              No {category.name} tools match &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-4 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Show all {allCategoryTools.length} tools
            </button>
          </div>
        )}
      </section>

      {/* FAQs */}
      {category.faqs.length > 0 && (
        <section
          aria-labelledby="category-faq-heading"
          className="mt-16 rounded-3xl border border-slate-200 bg-white p-8"
        >
          <div className="mb-6 flex items-center gap-2 text-indigo-600">
            <HelpCircle size={20} aria-hidden="true" />
            <h2 id="category-faq-heading" className="text-2xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {category.faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl bg-slate-50 p-5">
                <h3 className="text-base font-bold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other Categories */}
      <section aria-labelledby="other-categories-heading" className="mt-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="other-categories-heading" className="text-xl font-bold text-slate-900">
            Explore Other Categories
          </h2>
          <Link
            to="/categories/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            All Categories <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {otherCategories.map((other) => (
            <Link
              key={other.slug}
              to={getCategoryPath(other.slug)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              {other.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
