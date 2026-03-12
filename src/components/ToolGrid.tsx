import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ToolCard from './ToolCard';
import type { AITool } from '../data';
import { Search } from 'lucide-react';

interface ToolGridProps {
  tools: AITool[];
  onClearFilters?: () => void;
}

export default function ToolGrid({ tools, onClearFilters }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-6 text-slate-400">
          <Search size={48} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No tools found</h3>
        <p className="mt-2 text-slate-500">Try adjusting your search or category filters.</p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-6 font-semibold text-indigo-600 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence mode="popLayout">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
