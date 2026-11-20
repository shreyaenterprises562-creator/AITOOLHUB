import { ArrowRight, Search } from 'lucide-react';
import { Link } from '../router';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Search size={30} aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        The AI tool or category page you requested could not be found. Use the links below to
        browse the directory or explore categories.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Back to Directory <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link
          to="/categories/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          Browse Categories
        </Link>
      </div>
    </div>
  );
}
