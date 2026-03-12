import type { VercelRequest, VercelResponse } from "@vercel/node"
import { AI_TOOLS } from "../src/data"

export default function handler(req: VercelRequest, res: VercelResponse) {

const baseUrl = "https://aitoolhub-five.vercel.app"

const categories = [...new Set(AI_TOOLS.map(t =>
t.category.toLowerCase().replace(/\s+/g,"-")
))]

const toolUrls = AI_TOOLS.map(tool => {
const slug = tool.name.toLowerCase().replace(/\s+/g,"-")
return `<url>
<loc>${baseUrl}/tool/${slug}</loc>
</url>`
}).join("")

const categoryUrls = categories.map(cat => {
return `<url>
<loc>${baseUrl}/category/${cat}</loc>
</url>`
}).join("")

const staticPages = `
<url>
<loc>${baseUrl}/</loc>
<priority>1.0</priority>
</url>

<url>
<loc>${baseUrl}/blog</loc>
</url>

<url>
<loc>${baseUrl}/submit-tool</loc>
</url>

<url>
<loc>${baseUrl}/founders</loc>
</url>
`

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${staticPages}

${categoryUrls}

${toolUrls}

</urlset>
`

res.setHeader("Content-Type", "text/xml")
res.status(200).send(sitemap)

}