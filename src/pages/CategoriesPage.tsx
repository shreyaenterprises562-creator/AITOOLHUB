import { ArrowRight, FolderOpen } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link } from '../router';
import { CATEGORY_LIST, ENRICHED_TOOLS, getToolsByCategorySlug } from '../seoData';
import { getCategoryPath } from '../siteConfig';

export function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />

      <header className="mb-12 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <FolderOpen size={14} aria-hidden="true" />
          <span>{CATEGORY_LIST.length} Curated Categories</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          AI Tool Categories
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Explore all {ENRICHED_TOOLS.length} AI tools organized across {CATEGORY_LIST.length}{' '}
          categories. Each category page lists official tool links, workflow focus areas, and
          individual tool overviews.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_LIST.map((category) => {
          const tools = getToolsByCategorySlug(category.slug);
          const previewTools = tools.slice(0, 4);

          return (
            <article
              key={category.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    <Link
                      to={getCategoryPath(category.slug)}
                      className="transition-colors hover:text-indigo-600"
                    >
                      {category.name}
                    </Link>
                  </h2>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">{category.intro}</p>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Featured tools in this category
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {previewTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        to={tool.path}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  to={getCategoryPath(category.slug)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Browse all {tools.length} {category.name} tools{' '}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
