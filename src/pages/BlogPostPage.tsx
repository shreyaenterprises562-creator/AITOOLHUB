import React, { useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { BLOG_POSTS, AI_TOOLS } from '../data';
import ToolCard from '../components/ToolCard';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = useMemo(() => BLOG_POSTS.find(p => p.slug === slug), [slug]);

  useEffect(() => {
    if (!post) {
      navigate('/blog');
    }
    window.scrollTo(0, 0);
  }, [post, navigate]);

  // Find tools mentioned or relevant to the post
  const relevantTools = useMemo(() => {
    if (!post) return [];
    return AI_TOOLS
      .filter(t => post.tags?.some(tag => t.tags?.includes(tag)) || t.category === post.category)
      .slice(0, 4);
  }, [post]);

  if (!post) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet>
        <title>{post.title} | AI Tools Hub Blog</title>
        <meta name="description" content={post.excerpt} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "datePublished": post.date,
            "image": post.image || `https://picsum.photos/seed/${post.slug}/800/400`
          })}
        </script>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm"
        >
          <div className="aspect-[21/9] bg-slate-100 relative">
            <img
              src={post.image || `https://picsum.photos/seed/${post.slug}/1200/600`}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="p-8 sm:p-12">
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} />
                <span className="text-indigo-600 font-bold">{post.category}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
              <p className="text-xl text-slate-500 italic border-l-4 border-indigo-200 pl-6 py-2">
                {post.excerpt}
              </p>
              
              <p>
                Artificial Intelligence is no longer a futuristic concept; it's a present-day reality that's reshaping how we live, work, and learn. In this guide, we'll explore the most effective ways to leverage AI tools to achieve your goals more efficiently.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">The Rise of Specialized AI</h2>
              <p>
                As the AI landscape matures, we're seeing a shift from general-purpose models to highly specialized tools designed for specific use cases. Whether you're a student looking for research assistance or a content creator automating your video workflow, there's likely an AI tool built exactly for your needs.
              </p>

              <div className="my-12 p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
                <h3 className="text-xl font-bold mb-4">Pro Tip: Start Small</h3>
                <p className="text-indigo-100 leading-relaxed">
                  Don't try to implement 10 new tools at once. Pick one area of your workflow that feels most repetitive and find a single AI tool to automate it. Once you've mastered that, move on to the next.
                </p>
              </div>

              <p>
                The tools we've curated below represent the gold standard in their respective categories for 2026. They combine ease of use with powerful underlying models to provide real value from day one.
              </p>
            </div>

            {relevantTools.length > 0 && (
              <div className="mt-16 pt-16 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Recommended Tools from this Guide</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relevantTools.map(tool => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-16 flex items-center justify-between p-8 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Share2 size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Share this guide</p>
                  <p className="text-xs text-slate-500">Help others discover these AI insights</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors">Twitter</button>
                <button className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors">LinkedIn</button>
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
