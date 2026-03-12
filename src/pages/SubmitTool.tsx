import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, CheckCircle, Upload, FileJson } from 'lucide-react';
import { motion } from 'motion/react';
import { generateSEOTags, importToolsFromJSON } from '../utils/automation';

export default function SubmitTool() {
  const [submitted, setSubmitted] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    setTags(generateSEOTags({ description: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call an API here
    setSubmitted(true);
  };

  const handleBulkImport = () => {
    const tools = importToolsFromJSON(jsonInput);
    if (tools.length > 0) {
      alert(`Successfully imported ${tools.length} tools! (Simulated)`);
      setJsonInput("");
    } else {
      alert("Invalid JSON format.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-12 text-center shadow-xl shadow-slate-200 border border-slate-100"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Submission Received!</h1>
          <p className="text-slate-500 mb-8">
            Thank you for submitting your tool. Our team will review it and get back to you within 48 hours.
          </p>

          <div className="mb-8 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-left">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Boost your approval speed</h3>
            <p className="text-xs text-slate-600 mb-4">
              Add our "Featured" badge to your website to get priority review and a "Verified" checkmark.
            </p>
            <div className="bg-white p-3 rounded-xl border border-slate-200 mb-3 flex items-center justify-center">
              <img src="https://img.shields.io/badge/AI_Tools_Hub-Featured-blue?style=for-the-badge" alt="Featured on AI Tools Hub" />
            </div>
            <textarea 
              readOnly 
              className="w-full h-16 p-2 text-[10px] font-mono bg-white rounded-lg border border-slate-200 outline-none"
              value={`<a href="${window.location.origin}"><img src="https://img.shields.io/badge/AI_Tools_Hub-Featured-blue?style=for-the-badge" alt="Featured on AI Tools Hub" /></a>`}
            />
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
          >
            Submit Another Tool
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <Helmet>
        <title>Submit Your AI Tool | AI Tools Hub Directory</title>
        <meta name="description" content="List your AI tool on the fastest growing AI directory. Reach thousands of potential users and improve your SEO." />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Submit Your Tool</h1>
          <p className="text-lg text-slate-600">
            Join our directory and showcase your AI solution to thousands of daily visitors.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button 
              onClick={() => setBulkMode(false)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${!bulkMode ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Single Submission
            </button>
            <button 
              onClick={() => setBulkMode(true)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${bulkMode ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Bulk Import (JSON)
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200"
        >
          {!bulkMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ... existing form fields ... */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tool Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ChatGPT"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Website URL *</label>
                  <input
                    required
                    type="url"
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Category *</label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all">
                  <option>Chatbots</option>
                  <option>Writing AI</option>
                  <option>Image Generation AI</option>
                  <option>Video AI</option>
                  <option>Coding AI</option>
                  <option>Design AI</option>
                  <option>Automation AI</option>
                  <option>Productivity AI</option>
                  <option>Audio AI</option>
                  <option>Marketing AI</option>
                  <option>Research AI</option>
                  <option>Data AI</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Pricing Model</label>
                <div className="flex flex-wrap gap-4">
                  {['Free', 'Freemium', 'Paid'].map(model => (
                    <label key={model} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pricing" value={model} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-600">{model}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Short Description *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe what your tool does in 1-2 sentences..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                ></textarea>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Auto-generated tags:</span>
                    {tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md border border-indigo-100 uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Submit Tool <Send size={18} />
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-indigo-600 mb-2">
                <FileJson size={24} />
                <h3 className="font-bold text-slate-900">Bulk Import Tools</h3>
              </div>
              <p className="text-sm text-slate-500">
                Paste a JSON array of tool objects. Each object should have at least <code>name</code>, <code>category</code>, <code>description</code>, and <code>url</code>.
              </p>
              <textarea
                rows={10}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"name": "Tool 1", "category": "Chatbots", "description": "...", "url": "..."}]'
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-mono text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              ></textarea>
              <button
                onClick={handleBulkImport}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
              >
                Import Tools <Upload size={18} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
