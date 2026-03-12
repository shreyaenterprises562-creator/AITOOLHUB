import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { AI_TOOLS } from '../data';
import ToolCard from '../components/ToolCard';

export default function FoundersPage() {
  // Simulate community tools (e.g. tools added after a certain date or just a subset)
  const communityTools = useMemo(() => {
    return AI_TOOLS.filter(t => t.rating && t.rating > 4.5).slice(0, 12);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <Helmet>
        <title>AI Tool Founders & Community | AI Tools Hub</title>
        <meta name="description" content="Meet the founders and creators behind the world's most innovative AI tools. Explore community-submitted projects." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 mb-6"
          >
            <Users size={16} />
            <span>Community Driven</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 sm:text-5xl">Meet Our AI Founders</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Highlighting the innovators and creators who are building the future of artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Sparkles className="text-indigo-600" />
              Community Submissions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {communityTools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Are you a founder?</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Get your AI tool in front of thousands of users and investors. Our community-driven directory is the perfect place to launch.
              </p>
              <Link
                to="/submit-tool"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Submit Your Tool <ArrowRight size={18} />
              </Link>
            </div>

            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">Growth Benefits</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>High-quality do-follow backlinks</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>Direct traffic from AI enthusiasts</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>Featured placement opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
