import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Info,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ToolCard } from '../components/ToolCard';
import { Link } from '../router';
import {
  type EnrichedAITool,
  getCategoryBySlug,
  getRelatedTools,
} from '../seoData';

export function ToolPage({ tool }: { tool: EnrichedAITool }) {
  const category = getCategoryBySlug(tool.categorySlug);
  const relatedTools = getRelatedTools(tool, 6);
  const profile = tool.verifiedProfile;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Categories', to: '/categories/' },
          { label: tool.category, to: tool.categoryPath },
          { label: tool.name },
        ]}
      />

      {/* Main Tool Overview Card */}
      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles size={32} aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={tool.categoryPath}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  {tool.category}
                </Link>
                {profile && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={13} aria-hidden="true" />
                    Verified Overview
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {tool.name}
              </h1>

              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
                {tool.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              Visit Official Website <ExternalLink size={16} aria-hidden="true" />
            </a>
            <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Globe size={14} aria-hidden="true" />
              <span>{tool.domain}</span>
            </div>
          </div>
        </div>

        {/* Verified Profile Section (for GSC priority tools with source-verified content) */}
        {profile ? (
          <div className="mt-10 grid grid-cols-1 gap-8 border-t border-slate-100 pt-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900">About {tool.name}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {profile.verifiedSummary}
              </p>

              <h3 className="mt-8 text-lg font-bold text-slate-900">
                Documented Capabilities
              </h3>
              <ul className="mt-3 space-y-3">
                {profile.officialCapabilities.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-600"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-base font-bold text-slate-900">Common Use Cases</h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-600">
                {profile.typicalUseCases.map((useCase) => (
                  <li key={useCase} className="flex items-start gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600"
                      aria-hidden="true"
                    />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Official Source
                </p>
                <a
                  href={profile.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {profile.sourceLabel} <ExternalLink size={14} aria-hidden="true" />
                </a>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Check the official website directly for current plans, documentation, and
                  availability.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-base font-bold text-slate-900">Directory Summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 pb-2.5">
                    <dt className="text-slate-500">Tool Name</dt>
                    <dd className="font-semibold text-slate-900">{tool.name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 pb-2.5">
                    <dt className="text-slate-500">Category</dt>
                    <dd>
                      <Link
                        to={tool.categoryPath}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        {tool.category}
                      </Link>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Official Domain</dt>
                    <dd>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
                      >
                        {tool.domain} <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Info size={16} className="text-indigo-600" aria-hidden="true" />
                    <span>About This Listing</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    This listing displays core directory information from AI Tools Hub. Visit the
                    official {tool.name} website for current features, documentation, and pricing
                    directly from the provider.
                  </p>
                </div>
                {category && (
                  <div className="mt-4 pt-2">
                    <Link
                      to={tool.categoryPath}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Explore all {category.name} tools <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <Link
            to={tool.categoryPath}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Back to {tool.category}
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Browse full AI Tools Directory <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </article>

      {/* Related Tools in Category */}
      {relatedTools.length > 0 && (
        <section aria-labelledby="related-tools-heading" className="mt-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h2 id="related-tools-heading" className="text-2xl font-bold text-slate-900">
              More {tool.category} Tools
            </h2>
            <Link
              to={tool.categoryPath}
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all in {tool.category} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((related) => (
              <ToolCard key={related.slug} tool={related} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
