import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { AITool } from '../data';

interface ToolCardProps {
  tool: AITool;
  key?: string | number;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-indigo-600 transition-colors group-hover:bg-indigo-50 overflow-hidden">
          {tool.logo ? (
            <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Sparkles size={24} />
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {tool.category}
          </span>
          {tool.pricing && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              tool.pricing === 'Free' ? 'bg-emerald-100 text-emerald-700' : 
              tool.pricing === 'Freemium' ? 'bg-indigo-100 text-indigo-700' : 
              'bg-amber-100 text-amber-700'
            }`}>
              {tool.pricing}
            </span>
          )}
        </div>
      </div>

      <Link to={`/tool/${tool.slug}`} className="block">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {tool.name}
        </h3>
      </Link>
      
      <p className="mt-2 flex-grow text-sm leading-relaxed text-slate-500 line-clamp-2">
        {tool.description}
      </p>

      {tool.rating && (
        <div className="mt-3 flex items-center gap-1 text-amber-500">
          <Star size={14} fill="currentColor" />
          <span className="text-xs font-bold">{tool.rating}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Visit Tool <ExternalLink size={14} />
        </a>
        <Link
          to={`/tool/${tool.slug}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all hover:bg-indigo-600 hover:text-white"
        >
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}
