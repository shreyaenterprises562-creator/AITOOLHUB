import { Link } from 'react-router-dom';
import { Sparkles, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Sparkles size={22} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">AI Tools Hub</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Home</Link>
              <Link to="/categories" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Categories</Link>
              <Link to="/blog" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Blog</Link>
              <Link to="/founders" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Founders</Link>
              <Link to="/submit-tool" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Submit Tool</Link>
              <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95">
                Join Community
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4">
          <Link to="/" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/categories" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Categories</Link>
          <Link to="/blog" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Blog</Link>
          <Link to="/submit-tool" className="block text-base font-medium text-slate-600" onClick={() => setIsOpen(false)}>Submit Tool</Link>
          <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white">
            Join Community
          </button>
        </div>
      )}
    </nav>
  );
}
