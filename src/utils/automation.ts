import { AITool } from '../data';

/**
 * Automatically generates SEO tags for a tool based on its name, category, and description.
 */
export function generateSEOTags(tool: Partial<AITool>): string[] {
  const tags = new Set<string>();
  
  if (tool.category) {
    tags.add(tool.category);
    tags.add(tool.category.replace(' AI', ''));
  }
  
  if (tool.name) {
    tags.add(tool.name);
  }
  
  // Basic keyword extraction from description
  if (tool.description) {
    const keywords = ["best", "free", "top", "online", "generator", "assistant", "editor", "creator"];
    keywords.forEach(kw => {
      if (tool.description?.toLowerCase().includes(kw)) {
        tags.add(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });
  }
  
  return Array.from(tags);
}

/**
 * Generates a set of tools programmatically for testing or initial population.
 */
export function generateTools(config: { category: string, count: number }): AITool[] {
  const tools: AITool[] = [];
  for (let i = 1; i <= config.count; i++) {
    const name = `${config.category} Tool ${i}`;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const tool: AITool = {
      name,
      slug,
      category: config.category,
      description: `A powerful ${config.category} solution designed to help you achieve better results with AI.`,
      url: `https://example.com/${slug}`,
      pricing: i % 3 === 0 ? "Paid" : (i % 2 === 0 ? "Freemium" : "Free"),
      rating: 4 + Math.random(),
      trending: i % 5 === 0,
      featured: i % 10 === 0,
      addedDate: new Date().toISOString()
    };
    tool.tags = generateSEOTags(tool);
    tools.push(tool);
  }
  return tools;
}

/**
 * Bulk import tools from a JSON string.
 */
export function importToolsFromJSON(json: string): AITool[] {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
        tags: item.tags || generateSEOTags(item)
      }));
    }
  } catch (e) {
    console.error("Failed to import tools:", e);
  }
  return [];
}

/**
 * Logic for internal linking: finding related tools.
 */
export function getRelatedTools(tool: AITool, allTools: AITool[], limit: number = 4): AITool[] {
  return allTools
    .filter(t => t.slug !== tool.slug)
    .filter(t => {
      // Same category is a strong signal
      if (t.category === tool.category) return true;
      
      // Shared tags
      if (t.tags && tool.tags) {
        return t.tags.some(tag => tool.tags?.includes(tag));
      }
      
      return false;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
    .slice(0, limit);
}
