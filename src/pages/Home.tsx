import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { TrendingUp, Star, LayoutGrid, Clock } from 'lucide-react';
import { AI_TOOLS } from '../data';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ToolGrid from '../components/ToolGrid';
import AdBanner from '../components/AdBanner';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTools = useMemo(() => {
    return AI_TOOLS.filter(tool => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags?.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const trendingTools = useMemo(() => {
    return [...AI_TOOLS]
      .sort((a, b) => {
        const getScore = (t: any) => {
          let score = (t.rating || 0) * 2;
          if (t.featured) score += 10;
          if (t.trending) score += 5;
          if (
            t.addedDate &&
            new Date(t.addedDate).getTime() >
              Date.now() - 30 * 24 * 60 * 60 * 1000
          )
            score += 5;
          return score;
        };
        return getScore(b) - getScore(a);
      })
      .slice(0, 4);
  }, []);

  const featuredTools = useMemo(
    () => AI_TOOLS.filter(t => t.featured).slice(0, 4),
    []
  );

  const newestTools = useMemo(
    () => [...AI_TOOLS].reverse().slice(0, 4),
    []
  );

  const topRatedTools = useMemo(
    () => [...AI_TOOLS]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4),
    []
  );

  const popularCategories = useMemo(() => {
    const counts: Record<string, number> = {};

    AI_TOOLS.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>AI Tools Hub | Discover the Best AI Tools in 2026</title>
        <meta
          name="description"
          content="Discover the best 100+ AI tools for writing, coding, marketing, design, and productivity."
        />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Discover The Best <span className="text-indigo-600">AI Tools</span> in 2026
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              We've curated 100+ top-tier AI solutions to supercharge your workflow.
            </p>
          </motion.div>

          {/* SEARCH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </motion.div>

          {/* ⭐ CATEGORY FILTER MOVED HERE */}
          <div className="mt-6 flex justify-center">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <AdBanner position="header" className="mb-12" />

        {!searchQuery && selectedCategory === "All" && (
          <>
            {/* Trending */}
            <section className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="text-indigo-600" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">
                  Trending AI Tools
                </h2>
              </div>
              <ToolGrid tools={trendingTools} />
            </section>

            {/* Featured */}
            <section className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <Star className="text-amber-500" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">
                  Featured AI Tools
                </h2>
              </div>
              <ToolGrid tools={featuredTools} />
            </section>

            {/* New */}
            <section className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <Clock className="text-indigo-600" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">
                  Newest Tools
                </h2>
              </div>
              <ToolGrid tools={newestTools} />
            </section>

            {/* Top Rated */}
            <section className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <Star className="text-amber-500" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">
                  Top Rated AI Tools
                </h2>
              </div>
              <ToolGrid tools={topRatedTools} />
            </section>

            {/* Popular Categories */}
            <section id="categories" className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">
                Popular Categories
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {popularCategories.map(cat => (
                  <Link
                    key={cat}
                    to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                  >
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                      {cat}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* All Tools */}
        <section id="directory" className="pt-8">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-2xl mb-8">
            <LayoutGrid size={24} className="text-indigo-600" />
            <h2>
              {searchQuery || selectedCategory !== "All"
                ? `${filteredTools.length} Results Found`
                : "All AI Tools"}
            </h2>
          </div>

          <ToolGrid
            tools={filteredTools}
            onClearFilters={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          />
        </section>
      </div>
    </div>
  );
}