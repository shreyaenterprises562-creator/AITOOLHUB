import { useParams } from "react-router-dom";
import { AI_TOOLS } from "../data";
import ToolGrid from "../components/ToolGrid";
import { Helmet } from "react-helmet-async";

function CategoryPage() {
  const { category } = useParams();

  if (!category) {
    return <div className="p-10 text-center">Category not found</div>;
  }

  // convert category to slug format
  const normalize = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-");

  // filter tools by category slug
  const filteredTools = AI_TOOLS.filter(
    (tool) => normalize(tool.category) === category
  );

  // get readable category name
  const categoryName =
    filteredTools.length > 0
      ? filteredTools[0].category
      : category.replace(/-/g, " ");

  return (
    <>
      <Helmet>
        <title>{categoryName} AI Tools | AI Tools Hub</title>
        <meta
          name="description"
          content={`Explore the best ${categoryName} AI tools. Discover powerful AI tools for productivity, automation, design, and more.`}
        />
      </Helmet>

      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold capitalize">
          {categoryName} AI Tools
        </h1>

        {filteredTools.length > 0 ? (
          <ToolGrid tools={filteredTools} />
        ) : (
          <div className="text-center text-gray-500">
            No tools found in this category.
          </div>
        )}
      </div>
    </>
  );
}

export default CategoryPage;