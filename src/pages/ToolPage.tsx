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
if (!tool) navigate('/');
window.scrollTo(0, 0);
}, [tool, navigate]);

const relatedTools = useMemo(() => {
if (!tool) return [];
return getRelatedTools(tool, AI_TOOLS, 4);
}, [tool]);

const alternativeTools = useMemo(() => {
if (!tool) return [];
return AI_TOOLS
.filter(t => t.category === tool.category && t.slug !== tool.slug)
.sort((a, b) => (b.rating || 0) - (a.rating || 0))
.slice(0, 4);
}, [tool]);

if (!tool) return null;

const canonicalURL = `https://aitoolshub.com/tool/${tool.slug}`;

return ( <div className="min-h-screen bg-slate-50 py-12">

```
  <Helmet>

    <title>{tool.name} Review, Pricing & Alternatives (2026) | AI Tools Hub</title>

    <meta
      name="description"
      content={`${tool.name} is a ${tool.category} AI tool. Explore features, pricing, pros, cons, and the best alternatives.`}
    />

    <link rel="canonical" href={canonicalURL} />

    <meta property="og:title" content={`${tool.name} Review`} />
    <meta property="og:description" content={tool.description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />

    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.name,
        "operatingSystem": "Web",
        "applicationCategory": tool.category,
        "description": tool.description,
        "url": tool.url
      })}
    </script>

  </Helmet>

  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8"
    >
      <ArrowLeft size={16} /> Back to Directory
    </Link>

    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

      {/* MAIN CONTENT */}

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
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Zap size={40} />
                )}

              </div>

              <div>

                <h1 className="text-3xl font-bold text-slate-900">
                  {tool.name}
                </h1>

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

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700"
            >
              Visit Website <ExternalLink size={16} />
            </a>

          </div>

          <p className="text-slate-600 leading-relaxed mb-10">
            {tool.description}
          </p>

        </motion.div>

        <AdBanner position="content" />

        {/* RELATED TOOLS */}

        <section className="mt-16">

          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Related AI Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {relatedTools.map(t => (
              <ToolCard key={t.slug} tool={t} />
            ))}

          </div>

        </section>

        {/* ALTERNATIVES (SEO BOOST) */}

        <section className="mt-16">

          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            {tool.name} Alternatives
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {alternativeTools.map(alt => (

              <Link
                key={alt.slug}
                to={`/tool/${alt.slug}`}
                className="border p-4 rounded-xl bg-white hover:shadow-md text-center text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >

                {alt.name}

              </Link>

            ))}

          </div>

        </section>

      </div>

      {/* SIDEBAR */}

      <div className="space-y-8">

        <AdBanner position="sidebar" />

        <div className="rounded-3xl bg-indigo-600 p-8 text-white">

          <h3 className="text-xl font-bold mb-4">
            Submit Your Tool
          </h3>

          <p className="text-indigo-100 text-sm mb-6">
            Reach thousands of AI enthusiasts by listing your tool.
          </p>

          <Link
            to="/submit-tool"
            className="inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
          >
            Submit Tool
          </Link>

        </div>

      </div>

    </div>

  </div>

</div>
```

);
}
