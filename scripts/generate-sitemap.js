const fs = require("fs")
const path = require("path")

const tools = require("../src/data.ts")

const baseUrl = "https://aitoolhub-five.vercel.app"

let urls = `
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

const categories = new Set()

tools.AI_TOOLS.forEach(tool => {

const slug = tool.name.toLowerCase().replace(/\s+/g,"-")

urls += `
<url>
<loc>${baseUrl}/tool/${slug}</loc>
</url>
`

categories.add(tool.category)

})

categories.forEach(cat => {

const slug = cat.toLowerCase().replace(/\s+/g,"-")

urls += `
<url>
<loc>${baseUrl}/category/${slug}</loc>
</url>
`

})

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls}

</urlset>
`

fs.writeFileSync(
path.join(__dirname,"../public/sitemap.xml"),
sitemap
)

console.log("Sitemap generated")