import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from "./components/ScrollToTop";

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import CategoryPage from './pages/CategoryPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import SubmitTool from './pages/SubmitTool';
import SEOPage from './pages/SEOPage';
import FoundersPage from './pages/FoundersPage';

/* NEW PAGES */
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

function App() {
  return (
    <HelmetProvider>
      <Router>

        {/* Scroll to top on route change */}
        <ScrollToTop />

        <div className="flex min-h-screen flex-col font-sans text-slate-900 antialiased">

          <Navbar />

          <main className="flex-grow">
            <Routes>

              {/* Main pages */}
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/submit-tool" element={<SubmitTool />} />
              <Route path="/founders" element={<FoundersPage />} />

              {/* Tool & category */}
              <Route path="/tool/:slug" element={<ToolPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />

              {/* Legal / info pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* SEO dynamic pages */}
              <Route path="/:keyword" element={<SEOPage />} />

            </Routes>
          </main>

          <Footer />

        </div>

      </Router>
    </HelmetProvider>
  );
}

export default App;