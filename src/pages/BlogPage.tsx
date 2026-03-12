import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { BLOG_POSTS } from '../data';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <Helmet>
        <title>AI Tools Blog | Latest Insights & Guides 2026</title>
        <meta name="description" content="Stay updated with the latest AI trends, tool reviews, and guides to improve your productivity with artificial intelligence." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">AI Insights & Guides</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Expert reviews, tutorials, and roundups of the best AI tools to help you navigate the rapidly evolving AI landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="aspect-video overflow-hidden relative bg-slate-100">
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <BookOpen size={48} />
                </div>
                <img
                  src={post.image || `https://picsum.photos/seed/${post.slug}/800/400`}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all"
                >
                  Read More <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
