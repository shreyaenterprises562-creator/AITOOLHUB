import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="flex min-h-screen flex-col font-sans text-slate-900 antialiased">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tool/:slug" element={<ToolPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/submit-tool" element={<SubmitTool />} />
              <Route path="/founders" element={<FoundersPage />} />
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
