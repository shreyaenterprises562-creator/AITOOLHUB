import { Filter } from 'lucide-react';

const CATEGORIES = [
  "All",
  "Chatbots",
  "Writing AI",
  "Image Generation AI",
  "Video AI",
  "Coding AI",
  "Productivity AI",
  "Marketing AI",
  "Design AI",
  "Audio AI",
  "Automation AI",
  "Research AI",
  "Data AI"
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4 text-slate-500 font-medium text-sm">
        <Filter size={16} />
        <span>Filter by Category</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selected === category
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
