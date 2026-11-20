import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from '../router';
import type { EnrichedAITool } from '../seoData';

export function ToolCard({
  tool,
  headingLevel = 'h3',
}: {
  tool: EnrichedAITool;
  headingLevel?: 'h2' | 'h3';
}) {
  const HeadingTag = headingLevel;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <Link
          to={tool.path}
          aria-label={`View ${tool.name} details`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-indigo-600 transition-colors group-hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <Sparkles size={24} aria-hidden="true" />
        </Link>
        <Link
          to={tool.categoryPath}
          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          {tool.category}
        </Link>
      </div>

      <HeadingTag className="text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
        <Link
          to={tool.path}
          className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          {tool.name}
        </Link>
      </HeadingTag>

      <p className="mt-2 flex-grow text-sm leading-relaxed text-slate-600">
        {tool.description}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          Visit Tool <ExternalLink size={14} aria-hidden="true" />
        </a>
        <Link
          to={tool.path}
          aria-label={`Read more about ${tool.name}`}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-indigo-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          Details <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
