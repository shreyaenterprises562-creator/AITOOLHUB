import { AI_TOOLS, type AITool } from './data';
import {
  SITE_NAME,
  SITE_URL,
  getCanonicalUrl,
  getCategoryPath,
  getDisplayDomain,
  getToolPath,
  slugify,
} from './siteConfig';

export interface CategoryFAQ {
  question: string;
  answer: string;
}

export interface CategoryInfo {
  name: string;
  slug: string;
  title: string;
  metaDescription: string;
  intro: string;
  focusAreas: string[];
  faqs: CategoryFAQ[];
}

export interface VerifiedToolProfile {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  verifiedSummary: string;
  officialCapabilities: string[];
  typicalUseCases: string[];
  sourceLabel: string;
  sourceUrl: string;
  indexable: true;
}

export interface PageSeoMeta {
  title: string;
  description: string;
  canonical: string;
  robots: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  ogType: 'website' | 'article';
  jsonLd: Record<string, unknown>[];
}

export const CATEGORY_LIST: CategoryInfo[] = [
  {
    name: 'Chatbots',
    slug: 'chatbots',
    title: 'AI Chatbots Directory — 11 Conversational Tools | AI Tools Hub',
    metaDescription:
      'Explore 11 AI chatbots and conversational assistants including ChatGPT, Claude, Gemini, Perplexity AI, and Mistral AI with direct official links.',
    intro:
      'Conversational AI tools handle open-ended dialogue, research synthesis, multi-model prompting, and interactive character chat. This collection brings together general-purpose assistants, AI answer engines, and language model platforms.',
    focusAreas: [
      'General-purpose conversational assistants and reasoning models',
      'AI-powered answer engines that combine search with synthesis',
      'Multi-model chat aggregators and character interaction platforms',
    ],
    faqs: [
      {
        question: 'What types of tools are listed under Chatbots?',
        answer:
          'This category includes general-purpose conversational assistants, AI search and answer engines, enterprise language platforms, and interactive roleplay or storytelling chat tools.',
      },
      {
        question: 'How do I access a chatbot listed on this page?',
        answer:
          'Select any tool card to view its overview page or use the Visit Tool button to open the official website directly in a new tab.',
      },
    ],
  },
  {
    name: 'Writing AI',
    slug: 'writing-ai',
    title: 'Writing AI Tools — 11 Copy, Editing & Translation Tools | AI Tools Hub',
    metaDescription:
      'Browse 11 AI writing tools for editing, paraphrasing, marketing copy, fiction drafting, and translation, including Grammarly, DeepL, and Jasper AI.',
    intro:
      'Writing AI tools assist authors, editors, marketers, and multilingual teams across drafting, grammar refinement, paraphrasing, storytelling, and translation workflows.',
    focusAreas: [
      'Grammar checking, sentence rephrasing, and clarity improvements',
      'Long-form content, blog, and marketing copy generation',
      'Creative fiction drafting and accurate neural translation',
    ],
    faqs: [
      {
        question: 'Which writing workflows do these tools cover?',
        answer:
          'The 11 listed tools span grammar and style editing, paraphrasing, commercial copywriting, browser writing extensions, fiction assistance, and language translation.',
      },
      {
        question: 'Are the links on this page official vendor websites?',
        answer:
          'Yes. Every Writing AI listing links directly to the tool’s official website so you can review current capabilities and documentation from the provider.',
      },
    ],
  },
  {
    name: 'Image Generation AI',
    slug: 'image-generation-ai',
    title: 'Image Generation AI — 10 Visual Creation Tools | AI Tools Hub',
    metaDescription:
      'Discover 10 AI image generators including Midjourney, DALL·E, Leonardo AI, Ideogram AI, Krea AI, and Stability AI with official website links.',
    intro:
      'Image generation models turn text prompts and visual references into illustrations, concept art, typography graphics, and photorealistic scenes for creators and studios.',
    focusAreas: [
      'Text-to-image synthesis and real-time visual generation',
      'Typography-aware image generation and creative art exploration',
      'Open-source and studio-oriented diffusion model interfaces',
    ],
    faqs: [
      {
        question: 'How is Image Generation AI different from Design AI?',
        answer:
          'Image Generation AI focuses primarily on generating new images and artwork from prompts, while Design AI includes broader layout, UI/UX, presentation, logo, and photo-editing tools.',
      },
      {
        question: 'Can I compare multiple image generators here?',
        answer:
          'Yes. You can filter the 10 listed platforms on this page, open individual tool overviews, and visit each official site directly.',
      },
    ],
  },
  {
    name: 'Video AI',
    slug: 'video-ai',
    title: 'Video AI Tools — 13 Generation & Editing Platforms | AI Tools Hub',
    metaDescription:
      'Explore 13 Video AI tools for text-to-video generation, AI avatars, short-form clipping, and online editing, including Runway ML, Sora, and HeyGen.',
    intro:
      'Video AI platforms streamline both generative video creation and post-production workflows, from text-to-video synthesis and digital presenters to social clip extraction and browser-based editing.',
    focusAreas: [
      'Text-to-video and creative animation engines',
      'AI avatar and text-to-video business presentation platforms',
      'Automated short-form clipping and social video editors',
    ],
    faqs: [
      {
        question: 'What kinds of video tasks are represented in this category?',
        answer:
          'The Video AI collection covers generative video models, AI presenter platforms, automated highlight clipping from long recordings, and browser-based editing suites.',
      },
      {
        question: 'Where can I check technical specifications for a video tool?',
        answer:
          'Because video generation models and export options change frequently, use the official website link on each tool page to check current specifications directly with the vendor.',
      },
    ],
  },
  {
    name: 'Coding AI',
    slug: 'coding-ai',
    title: 'Coding AI Tools — 17 Developer & ML Platforms | AI Tools Hub',
    metaDescription:
      'Browse 17 Coding AI tools including Cursor AI, Replit AI, Sourcegraph Cody, Hugging Face, LangChain, and Groq with verified official links.',
    intro:
      'Coding AI tools support software engineers and machine learning builders across AI-native editors, codebase search, automated documentation, LLM application frameworks, and cloud model inference.',
    focusAreas: [
      'AI-assisted code editors, autocomplete, and codebase-aware assistants',
      'Developer search engines and automated technical documentation',
      'Machine learning model hubs, LLM frameworks, and inference platforms',
    ],
    faqs: [
      {
        question: 'Does Coding AI only include IDE plugins?',
        answer:
          'No. Alongside code editors and IDE assistants, this category includes developer search, documentation tools, model hubs, LLM frameworks, and cloud inference providers.',
      },
      {
        question: 'How can developers quickly narrow down tools in this category?',
        answer:
          'Use the category search bar below to filter by workflow keywords such as editor, documentation, inference, or framework.',
      },
    ],
  },
  {
    name: 'Productivity AI',
    slug: 'productivity-ai',
    title: 'Productivity AI Tools — 10 Workspace & Meeting Tools | AI Tools Hub',
    metaDescription:
      'Find 10 Productivity AI tools for meeting transcription, note workspaces, email speed, and enterprise search, including Notion AI, Otter AI, and Glean.',
    intro:
      'Productivity AI tools reduce manual overhead across daily knowledge work, helping teams transcribe meetings, organize notes, search internal knowledge, and manage email faster.',
    focusAreas: [
      'Meeting recording, transcription, and automated note-taking',
      'AI-integrated workspaces, docs, and collaborative task organization',
      'Enterprise knowledge search and accelerated email workflows',
    ],
    faqs: [
      {
        question: 'What workflows do Productivity AI tools typically improve?',
        answer:
          'The 10 tools in this category focus on meeting notes and transcription, workspace writing and task management, personal memory search, enterprise knowledge retrieval, and email.',
      },
      {
        question: 'Can I browse related workflow automation tools?',
        answer:
          'Yes. If you need multi-step workflow triggers or autonomous agents, visit the Automation AI category linked below.',
      },
    ],
  },
  {
    name: 'Marketing AI',
    slug: 'marketing-ai',
    title: 'Marketing AI Tools — 19 Sales, Social & Ad Tools | AI Tools Hub',
    metaDescription:
      'Explore 19 Marketing AI tools for ad creatives, social media, sales intelligence, customer support, and prompt libraries with official links.',
    intro:
      'Marketing AI platforms help growth, social media, revenue, and customer engagement teams create campaign assets, analyze sales conversations, manage outreach, and discover reusable prompts.',
    focusAreas: [
      'Social media content generation, scheduling, and ad creative tools',
      'Revenue intelligence, B2B go-to-market, and sales email assistants',
      'Conversational customer support and curated prompt marketplaces',
    ],
    faqs: [
      {
        question: 'Why are sales and customer service tools included in Marketing AI?',
        answer:
          'This category reflects go-to-market workflows across demand generation, ad creatives, social distribution, sales intelligence, and conversational customer engagement.',
      },
      {
        question: 'How do I find tools focused specifically on copywriting?',
        answer:
          'In addition to Marketing AI, check the Writing AI category for dedicated copywriting, editing, and paraphrasing assistants.',
      },
    ],
  },
  {
    name: 'Design AI',
    slug: 'design-ai',
    title: 'Design AI Tools — 21 UI, Branding & Visual Tools | AI Tools Hub',
    metaDescription:
      'Browse 21 Design AI tools for presentations, Figma workflows, 3D websites, UI/UX wireframing, logo branding, and image editing including Gamma AI and Dora AI.',
    intro:
      'Design AI tools accelerate visual production across presentations, web design, UI/UX prototyping, Figma plugins, logo creation, 3D scenes, and quick photo cleanup.',
    focusAreas: [
      'AI presentation builders, pitch decks, and interactive documents',
      'UI/UX wireframing, Figma plugins, and 3D or no-code website builders',
      'Brand identity, logo generators, background removal, and image upscaling',
    ],
    faqs: [
      {
        question: 'What makes Design AI one of the largest categories in AI Tools Hub?',
        answer:
          'Design AI covers 21 specialized tools across presentations (such as Gamma AI and Beautiful AI), UI/UX and Figma plugins (such as Magician, Uizard, and Galileo AI), web builders (such as Dora AI and Framer AI), and graphic editing.',
      },
      {
        question: 'Are Figma-compatible and web design tools included here?',
        answer:
          'Yes. You can use the search box on this page to filter specifically for Figma, 3D, presentation, logo, or website tools.',
      },
    ],
  },
  {
    name: 'Audio AI',
    slug: 'audio-ai',
    title: 'Audio AI Tools — 9 Voice, Music & Podcast Platforms | AI Tools Hub',
    metaDescription:
      'Discover 9 Audio AI tools for realistic text-to-speech, voice cloning, AI music generation, podcast editing, and noise cancellation including ElevenLabs and Suno AI.',
    intro:
      'Audio AI tools power voice synthesis, podcast production, generative music creation, and real-time noise cancellation for creators, podcasters, and distributed teams.',
    focusAreas: [
      'Text-to-speech synthesis and realistic voice generation',
      'Full-track and instrumental AI music generation',
      'Podcast editing and real-time meeting noise cancellation',
    ],
    faqs: [
      {
        question: 'Which audio use cases are covered in this directory?',
        answer:
          'The 9 listed Audio AI tools cover voice generation and cloning, full song and background music generation, text-based podcast editing, and meeting noise removal.',
      },
      {
        question: 'Where can I confirm licensing rules for AI-generated audio?',
        answer:
          'Always review licensing and commercial-use terms directly on each tool’s official website via the Visit Tool link.',
      },
    ],
  },
  {
    name: 'Automation AI',
    slug: 'automation-ai',
    title: 'Automation AI Tools — 23 Workflow & Industry Platforms | AI Tools Hub',
    metaDescription:
      'Explore 23 Automation AI tools spanning workflow triggers, web scraping, AI agents, CRM automation, legal AI, and healthcare or drug discovery platforms.',
    intro:
      'Automation AI encompasses both horizontal workflow tools—like no-code connectors, web scrapers, and autonomous agents—and domain-specific enterprise platforms in legal, CRM, healthcare diagnostics, and drug discovery.',
    focusAreas: [
      'Workflow automation, web monitoring, and conversational or autonomous agents',
      'Website building, process documentation, and enterprise CRM AI',
      'Specialized vertical automation in legal review, pathology, and drug discovery',
    ],
    faqs: [
      {
        question: 'Why does Automation AI include legal and biotech platforms alongside Zapier and Make?',
        answer:
          'This category groups both general workflow automation tools and specialized domain platforms—such as Harvey AI, Ironclad AI, Viz.ai, and BenevolentAI—that automate complex analytical processes.',
      },
      {
        question: 'How can I filter between general workflow tools and enterprise vertical tools?',
        answer:
          'Use the category search bar below to filter by keywords such as workflow, agent, legal, drug, or WordPress.',
      },
    ],
  },
  {
    name: 'Research AI',
    slug: 'research-ai',
    title: 'Research AI Tools — 4 Scientific & Literature Tools | AI Tools Hub',
    metaDescription:
      'Browse 4 Research AI tools for scientific literature review, citation evaluation, and protein structure prediction: AlphaFold, Elicit, Consensus, and Scite.ai.',
    intro:
      'Research AI tools are built specifically for scientific discovery and academic workflows, supporting peer-reviewed literature synthesis, citation context analysis, and structural biology prediction.',
    focusAreas: [
      'Automated literature review and evidence synthesis from scientific papers',
      'Citation evaluation and claim verification in academic research',
      'Computational biology and protein structure prediction',
    ],
    faqs: [
      {
        question: 'How do Research AI tools differ from general AI chatbots?',
        answer:
          'Research AI tools are designed around scientific corpora, citation analysis, or specialized scientific modeling rather than general-purpose conversation.',
      },
      {
        question: 'Which tools are currently listed under Research AI?',
        answer:
          'This category currently includes AlphaFold, Elicit, Consensus, and Scite.ai, each with a direct link to its official website.',
      },
    ],
  },
  {
    name: 'Data AI',
    slug: 'data-ai',
    title: 'Data AI Tools — 8 ML Infrastructure & Analytics Platforms | AI Tools Hub',
    metaDescription:
      'Explore 8 Data AI platforms for vector databases, data labeling, ML experiment tracking, predictive modeling, and precision medicine including Pinecone and Tempus.',
    intro:
      'Data AI platforms provide the underlying data infrastructure, labeling pipelines, experiment tracking, predictive modeling, and clinical data analytics required to build and operate AI systems.',
    focusAreas: [
      'Vector databases and data infrastructure for AI applications',
      'Data labeling, programmatic training data, and ML experiment tracking',
      'Enterprise predictive modeling and clinical/molecular data analysis',
    ],
    faqs: [
      {
        question: 'Who are Data AI tools primarily designed for?',
        answer:
          'Data AI tools serve machine learning engineers, data scientists, enterprise analytics teams, and domain specialists working with structured, unstructured, or clinical datasets.',
      },
      {
        question: 'Does this category include both ML tooling and applied data platforms?',
        answer:
          'Yes. It combines core ML infrastructure (such as Pinecone, Weights & Biases, and Scale AI) with applied platforms such as DataRobot, H2O.ai, and Tempus.',
      },
    ],
  },
];

export const VERIFIED_TOOL_PROFILES: Record<string, VerifiedToolProfile> = {
  'gamma-ai': {
    slug: 'gamma-ai',
    seoTitle: 'Gamma AI — AI Presentations, Docs & Websites | AI Tools Hub',
    seoDescription:
      'Overview of Gamma AI (gamma.app), an AI design platform for creating presentations, interactive documents, and websites from prompts or uploaded files.',
    verifiedSummary:
      'Gamma (gamma.app) is a web-native AI design platform built for generating presentations, scrollable documents, and websites from text prompts, outlines, or existing files without manual slide formatting.',
    officialCapabilities: [
      'Generates card-based, visually structured layouts with text, imagery, and consistent themes from prompts, notes, or uploaded documents.',
      'Supports multiple output formats—slide decks for presenting, interactive documents for reading, and web pages—from one workflow.',
      'Allows browser-based presenting and direct link sharing, along with export options such as PowerPoint and PDF.',
    ],
    typicalUseCases: [
      'Drafting pitch decks and team presentations rapidly from an outline',
      'Turning notes or existing documents into shareable web-native docs',
      'Building simple landing pages without manual layout engineering',
    ],
    sourceLabel: 'Official Gamma Website',
    sourceUrl: 'https://gamma.app',
    indexable: true,
  },
  magician: {
    slug: 'magician',
    seoTitle: 'Magician — AI Design Plugin for Figma | AI Tools Hub',
    seoDescription:
      'Overview of Magician (magician.design), an AI-powered Figma plugin by Diagram for generating copywriting, vector icons, and custom images inside Figma.',
    verifiedSummary:
      'Magician (magician.design), developed by Diagram, is an AI-powered plugin built specifically for Figma. It brings prompt-driven creative actions directly into the Figma canvas to reduce repetitive design tasks.',
    officialCapabilities: [
      'Operates directly inside the Figma design environment as a dedicated plugin.',
      'Uses prompt-based actions ("spells") to generate UI copywriting, vector icons, and custom images.',
      'Helps designers iterate on visual assets and microcopy without switching between external tools.',
    ],
    typicalUseCases: [
      'Generating placeholder or production-ready UX copy directly inside Figma frames',
      'Creating custom vector icons tailored to an interface concept',
      'Generating visual concepts and imagery inside a Figma design file',
    ],
    sourceLabel: 'Official Magician Website',
    sourceUrl: 'https://magician.design',
    indexable: true,
  },
  benevolentai: {
    slug: 'benevolentai',
    seoTitle: 'BenevolentAI — AI Drug Discovery Platform | AI Tools Hub',
    seoDescription:
      'Overview of BenevolentAI (benevolent.com), a clinical-stage biopharma company using proprietary artificial intelligence to accelerate drug discovery.',
    verifiedSummary:
      'BenevolentAI (benevolent.com) is a clinical-stage biopharmaceutical company that applies proprietary artificial intelligence and biomedical data analysis to accelerate drug discovery and development.',
    officialCapabilities: [
      'Combines proprietary AI models with biomedical knowledge to support drug discovery research.',
      'Focuses on accelerating therapeutic discovery and advancing candidates through clinical development.',
      'Publishes platform overviews and research updates through its official portal.',
    ],
    typicalUseCases: [
      'AI-assisted pharmaceutical target identification and drug discovery research',
      'Supporting clinical-stage biopharma research and development pipelines',
      'Reviewing enterprise biopharma AI methodologies via official documentation',
    ],
    sourceLabel: 'Official BenevolentAI Website',
    sourceUrl: 'https://www.benevolent.com',
    indexable: true,
  },
  tempus: {
    slug: 'tempus',
    seoTitle: 'Tempus — AI Precision Medicine & Data | AI Tools Hub',
    seoDescription:
      'Overview of Tempus (tempus.com), a technology company applying artificial intelligence to clinical and molecular data analysis for precision medicine.',
    verifiedSummary:
      'Tempus (tempus.com) is a healthcare technology company focused on advancing precision medicine by applying artificial intelligence to the collection and analysis of clinical and molecular data, with a primary foundation in oncology.',
    officialCapabilities: [
      'Applies AI to analyze multimodal clinical and molecular datasets.',
      'Supports precision medicine workflows with particular depth in oncology and cancer care.',
      'Connects clinical data insights with healthcare and life sciences research.',
    ],
    typicalUseCases: [
      'Clinical and molecular data analysis in precision oncology',
      'Data-driven decision support for personalized patient care research',
      'Life sciences analytics powered by structured clinical datasets',
    ],
    sourceLabel: 'Official Tempus Website',
    sourceUrl: 'https://www.tempus.com',
    indexable: true,
  },
  'dora-ai': {
    slug: 'dora-ai',
    seoTitle: 'Dora AI — No-Code 3D AI Website Builder | AI Tools Hub',
    seoDescription:
      'Overview of Dora AI (dora.run), a no-code 3D website builder and animation platform with AI-assisted web page generation features.',
    verifiedSummary:
      'Dora AI (dora.run) is a no-code website builder centered on interactive 3D visuals and web animation, offering AI-assisted site generation capabilities alongside visual editing controls.',
    officialCapabilities: [
      'Combines no-code website building with interactive 3D elements and keyframe-style web animations.',
      'Includes AI-assisted website generation features available via the official Dora AI workflow.',
      'Enables designers to build visually rich, animated web pages without hand-coding 3D scenes.',
    ],
    typicalUseCases: [
      'Designing interactive 3D product showcases and animated landing pages',
      'Generating initial web page concepts with AI before refining layouts visually',
      'Building motion-focused portfolio and marketing websites without code',
    ],
    sourceLabel: 'Official Dora Website',
    sourceUrl: 'https://www.dora.run',
    indexable: true,
  },
};

export interface EnrichedAITool extends AITool {
  slug: string;
  categorySlug: string;
  path: string;
  categoryPath: string;
  domain: string;
  verifiedProfile?: VerifiedToolProfile;
  indexable: boolean;
}

export const ENRICHED_TOOLS: EnrichedAITool[] = AI_TOOLS.map((tool) => {
  const slug = slugify(tool.name);
  const categorySlug = slugify(tool.category);
  const verifiedProfile = VERIFIED_TOOL_PROFILES[slug];
  return {
    ...tool,
    slug,
    categorySlug,
    path: getToolPath(slug),
    categoryPath: getCategoryPath(categorySlug),
    domain: getDisplayDomain(tool.url),
    verifiedProfile,
    indexable: Boolean(verifiedProfile?.indexable),
  };
});

const TOOL_BY_SLUG = new Map<string, EnrichedAITool>(
  ENRICHED_TOOLS.map((tool) => [tool.slug, tool]),
);

const CATEGORY_BY_SLUG = new Map<string, CategoryInfo>(
  CATEGORY_LIST.map((category) => [category.slug, category]),
);

export function getToolBySlug(slug: string): EnrichedAITool | undefined {
  return TOOL_BY_SLUG.get(slug.toLowerCase());
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORY_BY_SLUG.get(slug.toLowerCase());
}

export function getToolsByCategorySlug(categorySlug: string): EnrichedAITool[] {
  return ENRICHED_TOOLS.filter((tool) => tool.categorySlug === categorySlug);
}

export function getRelatedTools(tool: EnrichedAITool, limit = 6): EnrichedAITool[] {
  const sameCategory = ENRICHED_TOOLS.filter(
    (candidate) => candidate.categorySlug === tool.categorySlug && candidate.slug !== tool.slug,
  );
  // Prioritize verified/indexable tools first while keeping deterministic order
  return [
    ...sameCategory.filter((t) => t.indexable),
    ...sameCategory.filter((t) => !t.indexable),
  ].slice(0, limit);
}

export function getIndexableRoutes(): string[] {
  const routes: string[] = ['/', '/categories/'];
  for (const category of CATEGORY_LIST) {
    routes.push(getCategoryPath(category.slug));
  }
  for (const tool of ENRICHED_TOOLS) {
    if (tool.indexable) {
      routes.push(tool.path);
    }
  }
  return routes;
}

export function getAllPrerenderRoutes(): string[] {
  const routes: string[] = ['/', '/categories/'];
  for (const category of CATEGORY_LIST) {
    routes.push(getCategoryPath(category.slug));
  }
  for (const tool of ENRICHED_TOOLS) {
    routes.push(tool.path);
  }
  return routes;
}

export function getHomeSeoMeta(): PageSeoMeta {
  const canonical = getCanonicalUrl('/');
  const title = 'AI Tools Hub — Curated Directory of 156 AI Tools';
  const description =
    'Browse 156 AI tools across 12 categories including chatbots, design, coding, video, writing, research, and data AI with direct official links.';

  return {
    title,
    description,
    canonical,
    robots: 'index, follow',
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: canonical,
        description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        url: canonical,
        description,
        numberOfItems: ENRICHED_TOOLS.length,
      },
    ],
  };
}

export function getCategoriesIndexSeoMeta(): PageSeoMeta {
  const canonical = getCanonicalUrl('/categories/');
  const title = 'AI Tool Categories — 12 Curated Collections | AI Tools Hub';
  const description =
    'Browse all 12 AI tool categories on AI Tools Hub, from Chatbots, Design AI, and Coding AI to Video, Audio, Automation, Research, and Data AI.';

  return {
    title,
    description,
    canonical,
    robots: 'index, follow',
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'AI Tool Categories',
        url: canonical,
        description,
        numberOfItems: CATEGORY_LIST.length,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: canonical,
          },
        ],
      },
    ],
  };
}

export function getCategorySeoMeta(category: CategoryInfo, toolCount: number): PageSeoMeta {
  const canonical = getCanonicalUrl(getCategoryPath(category.slug));
  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} Tools`,
      url: canonical,
      description: category.metaDescription,
      numberOfItems: toolCount,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Categories',
          item: `${SITE_URL}/categories/`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: canonical,
        },
      ],
    },
  ];

  if (category.faqs.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: category.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return {
    title: category.title,
    description: category.metaDescription,
    canonical,
    robots: 'index, follow',
    ogType: 'website',
    jsonLd,
  };
}

export function getToolSeoMeta(tool: EnrichedAITool): PageSeoMeta {
  const canonical = getCanonicalUrl(tool.path);
  const title = tool.verifiedProfile
    ? tool.verifiedProfile.seoTitle
    : `${tool.name} — ${tool.category} Tool | ${SITE_NAME}`;
  const description = tool.verifiedProfile
    ? tool.verifiedProfile.seoDescription
    : `${tool.name}: ${tool.description}. Listed under ${tool.category} on ${SITE_NAME} with its official website link (${tool.domain}).`;

  return {
    title,
    description,
    canonical,
    robots: tool.indexable ? 'index, follow' : 'noindex, follow',
    ogType: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: `${SITE_URL}/categories/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.category,
            item: getCanonicalUrl(tool.categoryPath),
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: tool.name,
            item: canonical,
          },
        ],
      },
    ],
  };
}

export function getNotFoundSeoMeta(pathname: string): PageSeoMeta {
  return {
    title: `Page Not Found | ${SITE_NAME}`,
    description: `The requested page could not be found on ${SITE_NAME}. Browse the full directory or explore 12 AI tool categories.`,
    canonical: getCanonicalUrl(pathname),
    robots: 'noindex, nofollow',
    ogType: 'website',
    jsonLd: [],
  };
}
