import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// We need to import data for sitemap generation
// Since we are in a ESM environment and using tsx, we can import TS files
import { AI_TOOLS } from "./src/data";
import { SEO_INTENTS } from "./src/utils/seoEngine";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Allow: /tool/
Allow: /category/
Allow: /blog/
Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml
`;
    res.type("text/plain");
    res.send(robots);
  });

  // Sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    const host = `${req.protocol}://${req.get("host")}`;
    const categories = Array.from(new Set(AI_TOOLS.map(t => t.category.toLowerCase().replace(/\s+/g, '-'))));
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${host}/</loc><priority>1.0</priority></url>
  <url><loc>${host}/submit-tool</loc><priority>0.5</priority></url>
  <url><loc>${host}/blog</loc><priority>0.8</priority></url>
`;

    // Category pages
    categories.forEach(cat => {
      xml += `  <url><loc>${host}/category/${cat}</loc><priority>0.8</priority></url>\n`;
    });

    // Tool pages
    AI_TOOLS.forEach(tool => {
      xml += `  <url><loc>${host}/tool/${tool.slug}</loc><priority>0.7</priority></url>\n`;
    });

    // SEO pages
    SEO_INTENTS.forEach(intent => {
      xml += `  <url><loc>${host}/${intent.keyword}</loc><priority>0.9</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.type("application/xml");
    res.send(xml);
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
