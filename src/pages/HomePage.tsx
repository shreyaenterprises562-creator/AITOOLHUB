import { useMemo, useState } from 'react';
import { ArrowRight, Filter, FolderOpen, LayoutGrid, Search } from 'lucide-react';
import { Link } from '../router';
import {
  CATEGORY_LIST,
  ENRICHED_TOOLS,
  getToolsByCategorySlug,
} from '../seoData';
import { getCategoryPath } from '../siteConfig';
import { ToolCard } from '../components/ToolCard';

const FILTER_CATEGORIES = ['All', ...CATEGORY_LIST.map((cat) => cat.name)];

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ENRICHED_TOOLS.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-25" />
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            AI Tools Hub
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Discover the Best AI Tools in One Place. Browse {ENRICHED_TOOLS.length} curated AI
            tools across {CATEGORY_LIST.length} categories with direct official website links.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <label htmlFor="directory-search" className="sr-only">
              Search AI tools
            </label>
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-4 text-slate-400"
                size={20}
                aria-hidden="true"
              />
              <input
                id="directory-search"
                type="search"
                placeholder={`Search ${ENRICHED_TOOLS.length} AI tools (e.g. 'ChatGPT', 'Gamma', 'Video')...`}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section id="directory" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Interactive Category Filters */}
        <div className="mb-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Filter size={16} aria-hidden="true" />
              <span>Filter by Category</span>
            </div>
            <Link
              to="/categories/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View dedicated category pages <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tools by category">
            {FILTER_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <LayoutGrid size={20} className="text-indigo-600" aria-hidden="true" />
            <h2>
              {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'} Found
            </h2>
          </div>

          {selectedCategory !== 'All' && (
            <Link
              to={getCategoryPath(selectedCategory)}
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              Open {selectedCategory} category page <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} headingLevel="h3" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-6 text-slate-400">
              <Search size={48} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No tools found</h3>
            <p className="mt-2 text-slate-500">
              Try adjusting your search query or clearing the selected category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-6 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Crawlable Category Directory Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <FolderOpen size={16} aria-hidden="true" />
                <span>Explore by Category</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Browse All {CATEGORY_LIST.length} AI Categories
              </h2>
            </div>
            <Link
              to="/categories/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              All Categories <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_LIST.map((category) => {
              const count = getToolsByCategorySlug(category.slug).length;
              return (
                <Link
                  key={category.slug}
                  to={getCategoryPath(category.slug)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600">
                        {category.name}
                      </h3>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {count} {count === 1 ? 'tool' : 'tools'}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {category.intro}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                    Explore {category.name} <ArrowRight size={13} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
