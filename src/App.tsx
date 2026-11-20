import { Layout } from './components/Layout';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryPage } from './pages/CategoryPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToolPage } from './pages/ToolPage';
import { RouterProvider, useDocumentSeo, useRouter } from './router';
import {
  type PageSeoMeta,
  getCategoriesIndexSeoMeta,
  getCategoryBySlug,
  getCategorySeoMeta,
  getHomeSeoMeta,
  getNotFoundSeoMeta,
  getToolBySlug,
  getToolSeoMeta,
  getToolsByCategorySlug,
} from './seoData';
import { normalizePathname } from './siteConfig';

export interface ResolvedRoute {
  seo: PageSeoMeta;
  render: () => React.ReactElement;
}

export function resolveRoute(rawPathname: string): ResolvedRoute {
  const pathname = normalizePathname(rawPathname);

  if (pathname === '/') {
    return {
      seo: getHomeSeoMeta(),
      render: () => <HomePage />,
    };
  }

  if (pathname === '/categories/') {
    return {
      seo: getCategoriesIndexSeoMeta(),
      render: () => <CategoriesPage />,
    };
  }

  const categoryMatch = pathname.match(/^\/category\/([^/]+)\/$/);
  if (categoryMatch) {
    const category = getCategoryBySlug(categoryMatch[1]);
    if (category) {
      const toolCount = getToolsByCategorySlug(category.slug).length;
      return {
        seo: getCategorySeoMeta(category, toolCount),
        render: () => <CategoryPage category={category} />,
      };
    }
  }

  const toolMatch = pathname.match(/^\/tool\/([^/]+)\/$/);
  if (toolMatch) {
    const tool = getToolBySlug(toolMatch[1]);
    if (tool) {
      return {
        seo: getToolSeoMeta(tool),
        render: () => <ToolPage tool={tool} />,
      };
    }
  }

  return {
    seo: getNotFoundSeoMeta(pathname),
    render: () => <NotFoundPage />,
  };
}

function AppContent() {
  const { pathname } = useRouter();
  const resolved = resolveRoute(pathname);
  useDocumentSeo(resolved.seo);

  return <Layout>{resolved.render()}</Layout>;
}

export default function App({ initialPath }: { initialPath?: string } = {}) {
  return (
    <RouterProvider initialPath={initialPath}>
      <AppContent />
    </RouterProvider>
  );
}
