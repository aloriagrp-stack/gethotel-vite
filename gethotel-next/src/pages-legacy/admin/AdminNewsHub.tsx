'use client';
import { useState, useEffect } from "react";
import { 
    Newspaper, 
    Plus, 
    ExternalLink, 
    Trash2, 
    Edit3, 
    Search, 
    CheckCircle2, 
    Clock, 
    Globe, 
    Sparkles, 
    RefreshCw,
    X,
    FileText
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface NewsArticle {
    id: number;
    title: string;
    slug: string;
    category: string;
    author: string;
    excerpt?: string;
    content: string;
    image?: string;
    is_published: boolean | number;
    views: number;
    created_at: string;
    updated_at: string;
}

export default function AdminNewsHub() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
        show: false,
        msg: "",
        type: "success"
    });

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        category: "Travel Technology",
        author: "GHS Editorial Desk",
        excerpt: "",
        content: "",
        image: "assets/resort.webp"
    });

    const categories = [
        "Travel Technology",
        "Hospitality & Hotels",
        "Aviation & Routes",
        "Industry Analysis",
        "Guest Experience"
    ];

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getNewsArticles();
            if (res.success && Array.isArray(res.data)) {
                setArticles(res.data);
            } else {
                setArticles([]);
            }
        } catch (err: any) {
            console.error("Failed to load articles:", err);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 5000);
    };

    const handleOpenCreate = () => {
        setEditingArticle(null);
        setFormData({
            title: "",
            category: "Travel Technology",
            author: "GHS Editorial Desk",
            excerpt: "",
            content: "",
            image: "assets/resort.webp"
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (art: NewsArticle) => {
        setEditingArticle(art);
        setFormData({
            title: art.title,
            category: art.category,
            author: art.author || "GHS Editorial Desk",
            excerpt: art.excerpt || "",
            content: art.content,
            image: art.image || "assets/resort.webp"
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            showToast("Title and content are required", "error");
            return;
        }

        setSaving(true);
        try {
            if (editingArticle) {
                const res = await adminApi.updateNewsArticle(editingArticle.id, formData);
                if (res.success) {
                    showToast("Article updated & live files synced!");
                    setModalOpen(false);
                    fetchArticles();
                } else {
                    showToast(res.message || "Failed to update article", "error");
                }
            } else {
                const res = await adminApi.createNewsArticle(formData);
                if (res.success) {
                    showToast("Published! Live on news.gethotelstays.com");
                    setModalOpen(false);
                    fetchArticles();
                } else {
                    showToast(res.message || "Failed to publish article", "error");
                }
            }
        } catch (err: any) {
            showToast(err.message || "Failed to save article", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This will also remove the static page from news.gethotelstays.com.`)) {
            return;
        }

        try {
            const res = await adminApi.deleteNewsArticle(id);
            if (res.success) {
                showToast("Article deleted successfully");
                fetchArticles();
            } else {
                showToast(res.message || "Failed to delete", "error");
            }
        } catch (err: any) {
            showToast(err.message || "Error deleting article", "error");
        }
    };

    const filtered = articles.filter(a => {
        const matchesCat = selectedCategory === "all" || a.category === selectedCategory;
        const matchesQuery = !searchQuery || 
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium ${
                    toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Header with Title & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-6 h-6 text-brand-600" />
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">GHS News & Editorial Desk</h1>
                        <span className="bg-blue-50 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">LIVE</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Publish and manage authoritative travel journalism directly to <strong className="text-slate-800">news.gethotelstays.com</strong>.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href="https://news.gethotelstays.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        Visit Live Channel
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Write New Article
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Published Articles</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{articles.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Domain & Architecture</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">news.gethotelstays.com</p>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">● 100% Pure Static HTML Speed</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Globe className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">LLM & GEO Standard</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">llms.txt + NewsArticle Schema</p>
                        <p className="text-[11px] text-brand-600 font-medium mt-0.5">SearchGPT & Perplexity Enabled</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search articles by title or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            selectedCategory === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        All ({articles.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                                selectedCategory === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                    <button
                        onClick={fetchArticles}
                        title="Refresh articles"
                        className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                        Loading published dispatches...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                        <Newspaper className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        No articles found. Click "Write New Article" to publish your first dispatch!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Article Title &amp; Slug</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Date Published</th>
                                    <th className="py-3 px-4 text-center">Live Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((art) => (
                                    <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 max-w-md line-clamp-1">{art.title}</div>
                                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                                /{art.slug}.html
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {art.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                {new Date(art.created_at || Date.now()).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                LIVE
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1">
                                                <a
                                                    href={`https://news.gethotelstays.com/${art.slug}.html`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="View Live Article"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                <button
                                                    onClick={() => handleOpenEdit(art)}
                                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="Edit Article"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(art.id, art.title)}
                                                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="Delete Article"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    {editingArticle ? "Edit News Article" : "Write & Publish New Dispatch"}
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Instantly renders to pure static HTML and updates sitemaps on news.gethotelstays.com.
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Article Headline *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Lemon Tree Hotels Signs 120-Room Property in Jaipur"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Editorial Desk / Author</label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Executive Summary / Meta Excerpt</label>
                                <input
                                    type="text"
                                    placeholder="Short 1-2 sentence brief for Google search snippets and social cards..."
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Featured Header Image (Path or URL)</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="assets/resort.webp"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Article Content &amp; Findings *
                                </label>
                                <p className="text-[11px] text-slate-400 mb-1.5">
                                    Tip: Separate paragraphs with double-Enter. Use <code>### Subheading</code> for editorial section breaks.
                                </p>
                                <textarea
                                    required
                                    rows={10}
                                    placeholder="Write your research, facts, and findings here..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 font-sans leading-relaxed text-slate-800"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {saving ? "Publishing..." : editingArticle ? "Update & Sync" : "Publish to news.gethotelstays.com"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
