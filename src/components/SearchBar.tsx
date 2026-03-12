import { Search as SearchIcon } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <SearchIcon className="absolute left-4 text-slate-400" size={20} />
      <input
        type="text"
        placeholder={placeholder || "Search 100+ AI tools..."}
        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
