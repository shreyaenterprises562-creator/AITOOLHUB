import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { AI_TOOLS } from '../data';
import ToolGrid from '../components/ToolGrid';
import AdBanner from '../components/AdBanner';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  
  // Convert slug back to display name (e.g. "writing-ai" -> "Writing AI")
  const categoryName = useMemo(() => {
    if (!category) return "";
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [category]);

  const categoryTools = useMemo(() => {
    return AI_TOOLS.filter(t => t.category.toLowerCase() === categoryName.toLowerCase());
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <Helmet>
        <title>Best {categoryName} Tools in 2026 | AI Tools Hub</title>
        <meta name="description" content={`Discover the best ${categoryName} tools to automate your workflow. Compare features, pricing, and reviews for top ${categoryName} solutions.`} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{categoryName} Tools</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              A curated list of the best {categoryName} solutions available in 2026. Find the perfect tool for your needs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
            <LayoutGrid size={24} className="text-indigo-600" />
            <span>{categoryTools.length} Tools</span>
          </div>
        </div>

        <AdBanner position="header" className="mb-12" />

        <ToolGrid tools={categoryTools} />

        <div className="mt-20 rounded-3xl bg-white p-12 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Why use {categoryName}?</h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              {categoryName} tools are transforming how we work by automating repetitive tasks and providing intelligent insights. Whether you're a professional looking to increase efficiency or a hobbyist exploring new creative frontiers, these tools offer powerful capabilities that were previously unimaginable.
            </p>
            <p className="mt-4">
              In 2026, the landscape of {categoryName} has matured significantly, with tools becoming more specialized and integrated into existing workflows. Our curated list highlights the most reliable and effective solutions in the market today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
