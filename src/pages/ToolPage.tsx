import React, { useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, ArrowLeft, Star, Share2, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { AI_TOOLS } from '../data';
import ToolCard from '../components/ToolCard';
import AdBanner from '../components/AdBanner';
import { getRelatedTools } from '../utils/automation';

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const tool = useMemo(() => AI_TOOLS.find(t => t.slug === slug), [slug]);

  useEffect(() => {
    if (!tool) {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [tool, navigate]);

  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return getRelatedTools(tool, AI_TOOLS, 4);
  }, [tool]);

  const alternativeTools = useMemo(() => {
    if (!tool) return [];
    // Alternatives are tools in the same category but with high ratings
    return AI_TOOLS
      .filter(t => t.category === tool.category && t.slug !== tool.slug)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [tool]);

  if (!tool) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet>
        <title>{tool.name} | {tool.category} Tool Review 2026 | AI Tools Hub</title>
        <meta name="description" content={`${tool.name} is a ${tool.category} tool. ${tool.description}. Learn more about features, pricing, and alternatives.`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": tool.name,
            "operatingSystem": "Web",
            "applicationCategory": tool.category,
            "description": tool.description,
            "url": tool.url,
            "aggregateRating": tool.rating ? {
              "@type": "AggregateRating",
              "ratingValue": tool.rating,
              "ratingCount": "100"
            } : undefined,
            "offers": {
              "@type": "Offer",
              "price": tool.pricing === "Free" ? "0" : undefined,
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-indigo-600 shadow-inner">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Zap size={40} />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{tool.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        {tool.category}
                      </span>
                      {tool.pricing && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          {tool.pricing}
                        </span>
                      )}
                      {tool.rating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm font-bold">{tool.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                    <Share2 size={20} />
                  </button>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Visit Website <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-bold text-slate-900 mb-4">What is {tool.name}?</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {tool.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                  <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4 text-indigo-600">
                      <ShieldCheck size={24} />
                      <h3 className="font-bold text-slate-900">Key Features</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Advanced AI Capabilities</li>
                      <li>• User-friendly Interface</li>
                      <li>• Seamless Integration</li>
                      <li>• Regular Updates</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4 text-indigo-600">
                      <MessageSquare size={24} />
                      <h3 className="font-bold text-slate-900">User Verdict</h3>
                    </div>
                    <p className="text-sm text-slate-600 italic">
                      "One of the most versatile tools in the {tool.category} space. Highly recommended for professionals."
                    </p>
                  </div>
                </div>

                {tool.tags && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Growth Loop: Backlink Badge */}
                <div className="mt-12 p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Tool Owner? Add this badge to your site</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex items-center justify-center h-16 px-4 bg-white rounded-xl border border-indigo-200 shadow-sm">
                      <span className="text-xs font-bold text-indigo-600">Featured on AI Tools Hub</span>
                    </div>
                    <div className="flex-grow w-full">
                      <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">Embed Code:</p>
                      <textarea 
                        readOnly 
                        className="w-full h-20 p-3 text-[10px] font-mono bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-300 transition-all"
                        value={`<a href="${window.location.origin}/tool/${tool.slug}" target="_blank">\n  <img src="https://img.shields.io/badge/AI_Tools_Hub-Featured-blue?style=for-the-badge" alt="Featured on AI Tools Hub" />\n</a>`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <AdBanner position="content" />

            {/* Related Tools */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedTools.map(t => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </section>

            {/* Alternatives */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Best Alternatives to {tool.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {alternativeTools.map(t => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Tool Info</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</dt>
                  <dd className="text-sm font-medium text-slate-900">{tool.category}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing Model</dt>
                  <dd className="text-sm font-medium text-slate-900">{tool.pricing || 'Contact for Pricing'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</dt>
                  <dd className="text-sm font-medium text-slate-900">March 2026</dd>
                </div>
              </dl>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 px-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Visit Official Site <ExternalLink size={16} />
              </a>
            </div>

            <AdBanner position="sidebar" />

            <div className="rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200">
              <h3 className="text-xl font-bold mb-4">Submit Your Tool</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Want to list your AI tool on our directory? Reach thousands of AI enthusiasts daily.
              </p>
              <Link to="/submit-tool" className="inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
