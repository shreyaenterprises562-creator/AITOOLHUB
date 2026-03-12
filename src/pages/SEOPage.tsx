import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { AI_TOOLS } from '../data';
import ToolGrid from '../components/ToolGrid';
import { getSEOData, getToolsByIntent } from '../utils/seoEngine';

export default function SEOPage() {
  const { keyword } = useParams<{ keyword: string }>();

  const pageData = useMemo(() => {
    const intent = keyword ? getSEOData(keyword) : undefined;
    
    if (intent) {
      return {
        title: intent.title,
        description: intent.description,
        tools: getToolsByIntent(intent).slice(0, 24) // Show more tools on SEO pages
      };
    }

    // Default fallback
    return {
      title: "Best AI Tools Collection",
      description: "A curated collection of top-rated AI tools for various use cases.",
      tools: AI_TOOLS.slice(0, 12)
    };
  }, [keyword]);

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <Helmet>
        <title>{pageData.title} | AI Tools Hub</title>
        <meta name="description" content={pageData.description} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6">
            <Sparkles size={16} /> Curated Collection
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-6">{pageData.title}</h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            {pageData.description} We've tested and reviewed these tools to ensure they provide real value for your specific needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <ToolGrid tools={pageData.tools} />
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Why these tools?</h3>
              <ul className="space-y-4">
                {[
                  "Expertly curated",
                  "Verified performance",
                  "Updated for 2026",
                  "Community favorites"
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
