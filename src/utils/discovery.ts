import { AITool } from '../data';
import { generateSEOTags } from './automation';

/**
 * Simulates an AI tool discovery engine.
 * In a real scenario, this would fetch from RSS feeds, APIs, or scrape directories.
 */
export class DiscoveryEngine {
  private discoveredTools: Partial<AITool>[] = [
    {
      name: "Flux AI",
      category: "Image Generation AI",
      description: "A new state-of-the-art image generation model known for its realism and prompt adherence.",
      url: "https://blackforestlabs.ai"
    },
    {
      name: "Grok",
      category: "Chatbots",
      description: "xAI's conversational assistant with real-time access to X (formerly Twitter) data.",
      url: "https://x.ai"
    },
    {
      name: "Sunno v4",
      category: "Audio AI",
      description: "The latest version of Suno's music generation model with improved fidelity.",
      url: "https://suno.com"
    }
  ];

  /**
   * Discovers new tools (simulated).
   */
  async discoverNewTools(): Promise<AITool[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.discoveredTools.map(tool => ({
      ...tool,
      slug: tool.name?.toLowerCase().replace(/\s+/g, '-') || "",
      pricing: "Freemium",
      rating: 4.5,
      addedDate: new Date().toISOString(),
      tags: generateSEOTags(tool)
    } as AITool));
  }

  /**
   * Adds a tool to the dataset (simulated - in a real app this would be a DB write).
   */
  addTool(tool: Partial<AITool>, currentTools: AITool[]): AITool[] {
    const newTool: AITool = {
      name: tool.name || "Unnamed Tool",
      slug: tool.slug || tool.name?.toLowerCase().replace(/\s+/g, '-') || `tool-${Date.now()}`,
      category: tool.category || "General AI",
      description: tool.description || "No description provided.",
      url: tool.url || "#",
      pricing: tool.pricing || "Free",
      tags: tool.tags || generateSEOTags(tool),
      addedDate: new Date().toISOString(),
      rating: tool.rating || 0
    };

    // Check if already exists
    if (currentTools.some(t => t.slug === newTool.slug)) {
      return currentTools;
    }

    return [...currentTools, newTool];
  }
}

export const discoveryEngine = new DiscoveryEngine();
