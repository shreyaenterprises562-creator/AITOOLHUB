import { Link } from "react-router-dom";
import { Sparkles, Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles size={18} />
              </div>

              <span className="text-lg font-bold text-slate-900">
                AI Tools Hub
              </span>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Discover the best AI tools in one place. We curate the top-tier AI
              solutions to supercharge your workflow.
            </p>

            <div className="mt-6 flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Twitter size={20} />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Github size={20} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Linkedin size={20} />
              </a>

              <a
                href="mailto:contact@aitoolshub.com"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Platform
            </h3>

            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link to="/" className="hover:text-indigo-600 transition-colors">
                  Directory
                </Link>
              </li>

              <li>
                <Link to="/categories" className="hover:text-indigo-600 transition-colors">
                  Categories
                </Link>
              </li>

              <li>
                <Link to="/blog" className="hover:text-indigo-600 transition-colors">
                  Blog
                </Link>
              </li>

              <li>
                <Link to="/founders" className="hover:text-indigo-600 transition-colors">
                  Founders
                </Link>
              </li>

              <li>
                <Link to="/submit-tool" className="hover:text-indigo-600 transition-colors">
                  Submit Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Resources
            </h3>

            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link to="/students" className="hover:text-indigo-600 transition-colors">
                  AI for Students
                </Link>
              </li>

              <li>
                <Link to="/bloggers" className="hover:text-indigo-600 transition-colors">
                  AI for Bloggers
                </Link>
              </li>

              <li>
                <Link to="/developers" className="hover:text-indigo-600 transition-colors">
                  AI for Developers
                </Link>
              </li>

              <li>
                <Link to="/free" className="hover:text-indigo-600 transition-colors">
                  Free AI Tools
                </Link>
              </li>

              <li>
                <Link
                  to="/best-writing-ai-tools-for-bloggers"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Writing AI for Bloggers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Legal
            </h3>

            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link to="/about" className="hover:text-indigo-600 transition-colors">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/privacy" className="hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-indigo-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
          © 2026 AI Tools Hub. All rights reserved.
        </div>

      </div>
    </footer>
  );
}