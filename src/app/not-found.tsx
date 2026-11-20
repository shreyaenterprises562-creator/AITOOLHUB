import Link from 'next/link';
import { brandConfig } from '../config/brand.config';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold">
        404
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">
        The page you are looking for does not exist or has been moved in {brandConfig.brandName}.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
      >
        Return to Storefront
      </Link>
    </div>
  );
}
