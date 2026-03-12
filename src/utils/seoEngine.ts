import { AI_TOOLS, AITool } from '../data';

export interface SEOIntent {
  keyword: string;
  title: string;
  description: string;
  categories?: string[];
  tags?: string[];
  pricing?: "Free" | "Freemium" | "Paid" | "FreeOrFreemium";
}

export const SEO_INTENTS: SEOIntent[] = [
  {
    keyword: "students",
    title: "Best AI Tools for Students in 2026",
    description: "The ultimate list of AI tools for students to help with studying, writing, and productivity.",
    categories: ["Chatbots", "Writing AI", "Research AI", "Productivity AI"],
    tags: ["Education", "Study", "Learning"]
  },
  {
    keyword: "bloggers",
    title: "Top AI Tools for Bloggers & Content Creators",
    description: "Boost your blogging workflow with these AI tools for writing, SEO, and image generation.",
    categories: ["Writing AI", "Marketing AI", "Image Generation AI"],
    tags: ["Blogging", "SEO", "Content"]
  },
  {
    keyword: "marketers",
    title: "Essential AI Tools for Digital Marketing",
    description: "Scale your marketing efforts with AI-powered tools for copywriting, social media, and analytics.",
    categories: ["Marketing AI", "Automation AI", "Writing AI"],
    tags: ["Marketing", "Growth", "Ads"]
  },
  {
    keyword: "developers",
    title: "Best AI Tools for Software Developers",
    description: "Code faster and smarter with these AI-powered IDEs, assistants, and documentation tools.",
    categories: ["Coding AI", "Automation AI"],
    tags: ["Coding", "Programming", "DevOps"]
  },
  {
    keyword: "business",
    title: "Top AI Tools for Business & Enterprise",
    description: "Scale your business with these professional AI solutions for marketing, data, and automation.",
    categories: ["Marketing AI", "Automation AI", "Data AI", "Productivity AI"],
    tags: ["Business", "Enterprise", "ROI"]
  },
  {
    keyword: "freelancers",
    title: "Best AI Tools for Freelancers & Solopreneurs",
    description: "Manage your freelance business more efficiently with these AI tools for productivity and design.",
    categories: ["Productivity AI", "Design AI", "Writing AI"],
    tags: ["Freelance", "Gig", "Solo"]
  },
  {
    keyword: "youtube",
    title: "AI Tools for YouTube Creators & Video Editors",
    description: "Create viral content faster with AI tools for video editing, scriptwriting, and thumbnails.",
    categories: ["Video AI", "Audio AI", "Writing AI"],
    tags: ["YouTube", "Video", "Editing"]
  },
  {
    keyword: "free",
    title: "Best Free AI Tools in 2026",
    description: "Discover the most powerful AI tools you can use for free without a subscription.",
    pricing: "FreeOrFreemium"
  },
  {
    keyword: "writing",
    title: "Best AI Writing Tools & Assistants",
    description: "Improve your writing with the best AI-powered tools for copywriting, editing, and paraphrasing.",
    categories: ["Writing AI"]
  },
  {
    keyword: "design",
    title: "Top AI Design Tools for Creatives",
    description: "Revolutionize your design process with AI tools for UI/UX, logos, and image editing.",
    categories: ["Design AI", "Image Generation AI"]
  }
];

// Mass SEO Page Generation Logic
const useCases = ["students", "bloggers", "marketers", "developers", "business", "youtube", "freelancers", "teachers", "designers", "startups"];
const categories = Array.from(new Set(AI_TOOLS.map(t => t.category)));

categories.forEach(cat => {
  // Category + Use Case combinations
  useCases.forEach(useCase => {
    const keyword = `best-${cat.toLowerCase().replace(/\s+/g, '-')}-for-${useCase}`;
    if (!SEO_INTENTS.find(i => i.keyword === keyword)) {
      SEO_INTENTS.push({
        keyword,
        title: `Best ${cat} for ${useCase.charAt(0).toUpperCase() + useCase.slice(1)} in 2026`,
        description: `Find the top-rated ${cat} solutions specifically curated for ${useCase}. Compare features and pricing.`,
        categories: [cat],
        tags: [useCase.charAt(0).toUpperCase() + useCase.slice(1)]
      });
    }
  });

  // Free Category combinations
  const freeKeyword = `free-${cat.toLowerCase().replace(/\s+/g, '-')}`;
  if (!SEO_INTENTS.find(i => i.keyword === freeKeyword)) {
    SEO_INTENTS.push({
      keyword: freeKeyword,
      title: `Best Free ${cat} in 2026`,
      description: `Discover the most powerful ${cat} tools you can use for free. No subscription required for these top picks.`,
      categories: [cat],
      pricing: "FreeOrFreemium"
    });
  }
});

export function getToolsByIntent(intent: SEOIntent): AITool[] {
  return AI_TOOLS.filter(tool => {
    let matches = false;

    if (intent.categories && intent.categories.includes(tool.category)) {
      matches = true;
    }

    if (intent.tags && tool.tags && intent.tags.some(tag => tool.tags?.includes(tag))) {
      matches = true;
    }

    if (intent.pricing) {
      if (intent.pricing === "FreeOrFreemium") {
        if (tool.pricing === "Free" || tool.pricing === "Freemium") {
          matches = true;
        }
      } else if (tool.pricing === intent.pricing) {
        matches = true;
      }
    }

    // If no specific filters, return false unless it's a general keyword
    return matches;
  });
}

export function getSEOData(keyword: string): SEOIntent | undefined {
  const k = keyword.toLowerCase();
  // Exact match first
  const exact = SEO_INTENTS.find(intent => intent.keyword.toLowerCase() === k);
  if (exact) return exact;
  
  // Partial match fallback
  return SEO_INTENTS.find(intent => k.includes(intent.keyword.toLowerCase()));
}
