export type AICategory =
  | "chat"
  | "writing"
  | "image"
  | "video"
  | "audio"
  | "design"
  | "developer"
  | "productivity"
  | "marketing"
  | "automation"
  | "data"
  | "research"
  | "search";

export interface AITool {
  name: string;
  slug: string;
  category: AICategory;
  description: string;
  url: string;
  pricing?: "Free" | "Freemium" | "Paid";
  logo?: string;
  tags?: string[];
  featured?: boolean;
  trending?: boolean;
  rating?: number;
  addedDate?: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image?: string;
  tags?: string[];
}

export const AI_TOOLS: AITool[] = [

  {
    name: "ChatGPT",
    slug: "chatgpt",
    category: "chat",
    description: "Advanced conversational AI assistant for writing, coding, research, and productivity.",
    url: "https://chat.openai.com",
    pricing: "Freemium",
    featured: true,
    trending: true,
    rating: 4.9,
    tags: ["OpenAI", "Assistant", "LLM"]
  },

  {
    name: "Claude",
    slug: "claude",
    category: "chat",
    description: "Next-generation AI assistant by Anthropic designed for safe and helpful conversations.",
    url: "https://claude.ai",
    pricing: "Freemium",
    rating: 4.8
  },

  {
    name: "Gemini",
    slug: "gemini",
    category: "chat",
    description: "Google's multimodal AI assistant integrated across Google services.",
    url: "https://gemini.google.com",
    pricing: "Freemium",
    trending: true,
    rating: 4.7
  },

  {
    name: "Perplexity",
    slug: "perplexity",
    category: "search",
    description: "AI powered answer engine and search assistant.",
    url: "https://perplexity.ai",
    trending: true,
    rating: 4.8
  },

  {
    name: "Copy AI",
    slug: "copy-ai",
    category: "writing",
    description: "AI writing tool for blogs, marketing copy, and product descriptions.",
    url: "https://www.copy.ai",
    pricing: "Freemium",
    rating: 4.6
  },

  {
    name: "Jasper",
    slug: "jasper",
    category: "writing",
    description: "AI content platform for marketers and content teams.",
    url: "https://jasper.ai",
    pricing: "Paid",
    rating: 4.7
  },

  {
    name: "Writesonic",
    slug: "writesonic",
    category: "writing",
    description: "AI writing assistant for blogs, ads, and SEO content.",
    url: "https://writesonic.com",
    pricing: "Freemium"
  },

  {
    name: "Grammarly",
    slug: "grammarly",
    category: "writing",
    description: "AI writing assistant for grammar, tone, and clarity.",
    url: "https://grammarly.com",
    pricing: "Freemium"
  },

  {
    name: "Midjourney",
    slug: "midjourney",
    category: "image",
    description: "AI image generation platform known for artistic visuals.",
    url: "https://midjourney.com",
    pricing: "Paid",
    featured: true,
    rating: 4.8
  },

  {
    name: "DALL·E",
    slug: "dall-e",
    category: "image",
    description: "OpenAI model that creates realistic images from text prompts.",
    url: "https://openai.com/dall-e"
  },

  {
    name: "Leonardo AI",
    slug: "leonardo-ai",
    category: "image",
    description: "Generative AI platform for game assets and design.",
    url: "https://leonardo.ai"
  },

  {
    name: "Ideogram",
    slug: "ideogram",
    category: "image",
    description: "AI image generator specialized in text rendering.",
    url: "https://ideogram.ai"
  },

  {
    name: "Runway",
    slug: "runway",
    category: "video",
    description: "AI video editing and generation platform.",
    url: "https://runwayml.com"
  },

  {
    name: "Synthesia",
    slug: "synthesia",
    category: "video",
    description: "Create professional AI avatar videos for presentations and marketing.",
    url: "https://synthesia.io"
  },

  {
    name: "Pika Labs",
    slug: "pika-labs",
    category: "video",
    description: "Text to video AI generation tool.",
    url: "https://pika.art"
  },

  {
    name: "CapCut AI",
    slug: "capcut-ai",
    category: "video",
    description: "AI powered video editing tools for creators.",
    url: "https://capcut.com"
  },

  {
    name: "ElevenLabs",
    slug: "elevenlabs",
    category: "audio",
    description: "Realistic AI voice generation and voice cloning platform.",
    url: "https://elevenlabs.io",
    trending: true,
    rating: 4.9
  },

  {
    name: "Murf AI",
    slug: "murf-ai",
    category: "audio",
    description: "AI voice generator for narration and presentations.",
    url: "https://murf.ai"
  },

  {
    name: "Suno",
    slug: "suno-ai",
    category: "audio",
    description: "AI music generator that creates complete songs.",
    url: "https://suno.com"
  },

  {
    name: "Canva AI",
    slug: "canva-ai",
    category: "design",
    description: "AI powered design tools for graphics, presentations, and social media.",
    url: "https://canva.com"
  },

  {
    name: "Adobe Firefly",
    slug: "adobe-firefly",
    category: "design",
    description: "Adobe's generative AI for images and design.",
    url: "https://adobe.com/firefly"
  },

  {
    name: "Looka",
    slug: "looka",
    category: "design",
    description: "AI logo generator and brand builder.",
    url: "https://looka.com"
  },

  {
    name: "Framer AI",
    slug: "framer-ai",
    category: "design",
    description: "AI website builder for modern landing pages.",
    url: "https://framer.com"
  },

  {
    name: "GitHub Copilot",
    slug: "github-copilot",
    category: "developer",
    description: "AI coding assistant for developers.",
    url: "https://github.com/features/copilot",
    pricing: "Paid",
    featured: true
  },

  {
    name: "Cursor",
    slug: "cursor",
    category: "developer",
    description: "AI powered code editor designed for faster development.",
    url: "https://cursor.sh",
    trending: true
  },

  {
    name: "Codeium",
    slug: "codeium",
    category: "developer",
    description: "Free AI coding assistant for developers.",
    url: "https://codeium.com"
  },

  {
    name: "Tabnine",
    slug: "tabnine",
    category: "developer",
    description: "AI code completion tool for multiple languages.",
    url: "https://tabnine.com"
  },

  {
    name: "Notion AI",
    slug: "notion-ai",
    category: "productivity",
    description: "AI writing and productivity assistant integrated into Notion.",
    url: "https://notion.so"
  },

  {
    name: "Otter AI",
    slug: "otter-ai",
    category: "productivity",
    description: "AI meeting transcription and note taking tool.",
    url: "https://otter.ai"
  },

  {
    name: "Tome",
    slug: "tome",
    category: "productivity",
    description: "AI storytelling and presentation platform.",
    url: "https://tome.app"
  },

  {
    name: "Zapier AI",
    slug: "zapier-ai",
    category: "automation",
    description: "AI powered workflow automation platform.",
    url: "https://zapier.com"
  },

  {
    name: "Make",
    slug: "make",
    category: "automation",
    description: "Visual automation platform for building workflows.",
    url: "https://make.com"
  },

  {
    name: "Browse AI",
    slug: "browse-ai",
    category: "automation",
    description: "AI web scraping and monitoring automation tool.",
    url: "https://browse.ai"
  }

];

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "Best AI Tools for Students in 2026",
    slug: "best-ai-tools-for-students",
    excerpt: "Discover powerful AI tools that help students research, write, and learn faster.",
    content: "Full content here...",
    date: "2026-03-10",
    author: "AI Hub Team",
    category: "Education"
  },
  {
    title: "How to Automate Your YouTube Workflow with AI",
    slug: "youtube-automation-with-ai",
    excerpt: "Learn how AI tools can automate script writing, video editing, and thumbnails.",
    content: "Full content here...",
    date: "2026-03-05",
    author: "Content Expert",
    category: "Video"
  },
  {
    title: "Top Free AI Tools for Content Creators",
    slug: "free-ai-tools-for-creators",
    excerpt: "The best free AI tools for creators, bloggers, and marketers.",
    content: "Full content here...",
    date: "2026-02-28",
    author: "Marketing Pro",
    category: "Marketing"
  }
];