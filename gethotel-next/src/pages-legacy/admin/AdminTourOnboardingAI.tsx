'use client';
import React, { useState, useRef } from "react";
import {
    Sparkles, Palmtree, Send, FileCode, CheckCircle2, AlertCircle,
    Copy, Check, Plus, Trash2, ArrowUpRight, Loader2, Image as ImageIcon,
    Clock, MapPin, Tag, ChevronDown, ChevronUp, RefreshCw, Upload, Eye,
    X, Percent, DollarSign, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { packageApi } from "@/lib/api";

const PRESET_PROMPTS = [
    {
        label: "🌴 Kerala Backwaters & Tea Gardens (5D/4N)",
        prompt: "Create a 5 Days / 4 Nights luxury Kerala tour package covering Kochi, Munnar tea hills, and Alleppey private houseboat. Include 4-star stays, daily breakfast, and AC cab. Price around ₹19,999."
    },
    {
        label: "🏰 Royal Rajasthan Forts & Desert (7D/6N)",
        prompt: "Create a 7 Days / 6 Nights Royal Rajasthan package covering Jaipur, Jodhpur, and Jaisalmer Sam sand dunes with luxury desert tent stay, camel safari, and heritage havelis. Price around ₹26,999."
    },
    {
        label: "🏔️ Kashmir Paradise & Dal Lake (6D/5N)",
        prompt: "Create a 6 Days / 5 Nights Kashmir holiday package covering Srinagar deluxe houseboat on Dal Lake, Gulmarg gondola ride, and Pahalgam valley. Price around ₹24,500."
    },
    {
        label: "🐅 Golden Triangle + Ranthambore (7D/6N)",
        prompt: "Create a 7 Days / 6 Nights iconic Golden Triangle plus Ranthambore Tiger Safari tour covering Delhi, Agra Taj Mahal sunrise, Ranthambore jeep safari, and Jaipur forts. Price around ₹28,999."
    },
    {
        label: "🌊 Goa Coastal & Heritage Villas (4D/3N)",
        prompt: "Create a 4 Days / 3 Nights Goa luxury tour package covering North Goa beaches, heritage Latin Quarter Fontainhas, and private sunset boat cruise. Price around ₹14,999."
    },
    {
        label: "🏔️ Himachal Snow & Mountain Pass (6D/5N)",
        prompt: "Create a 6 Days / 5 Nights Himachal tour covering Shimla colonial ridge, Kullu valley rafting, and Manali Solang snow pass with 4-star mountain view resorts. Price around ₹17,999."
    }
];

const SAMPLE_JSON_TEMPLATE = [
    {
        "title": "Classic Golden Triangle Tour",
        "destination": "Delhi • Agra • Jaipur",
        "duration": "6 Days / 5 Nights",
        "price": 18999,
        "originalPrice": 24999,
        "discountPercent": "24% OFF",
        "badge": "Bestseller",
        "includedStay": "4-Star Deluxe Heritage Hotels & Havelis",
        "transport": "Private AC Sedan Transfers Included",
        "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"
        ],
        "overview": "Experience India's most iconic cultural circuit connecting the historic capital Delhi, the eternal city of Agra, and the royal Pink City Jaipur.",
        "highlights": [
            "Sunrise visit to the iconic Taj Mahal",
            "Amber Fort jeep ride in Jaipur",
            "Guided tour of Old & New Delhi heritage sites"
        ],
        "inclusions": [
            "5 Nights accommodation on double sharing basis",
            "Daily buffet breakfast at hotels",
            "Private AC sedan vehicle for all transfers & sightseeing",
            "English-speaking monument guides"
        ],
        "exclusions": [
            "Airfare / Train tickets",
            "Monument entrance tickets",
            "Meals not specified in inclusions",
            "Personal expenses and tips"
        ],
        "itinerary": [
            { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi, private airport transfer to hotel, evening orientation walk." },
            { "day": "Day 2", "title": "Old & New Delhi Tour", "desc": "Visit Jama Masjid, Chandni Chowk, India Gate, and Qutub Minar." },
            { "day": "Day 3", "title": "Delhi to Agra", "desc": "Scenic drive to Agra, visit Agra Fort and sunset view of Taj Mahal from Mehtab Bagh." },
            { "day": "Day 4", "title": "Taj Mahal Sunrise & Jaipur", "desc": "Early sunrise visit to Taj Mahal, drive to Jaipur via Fatehpur Sikri." },
            { "day": "Day 5", "title": "Jaipur Sightseeing", "desc": "Amber Fort, City Palace, Jantar Mantar and Hawa Mahal photo stop." },
            { "day": "Day 6", "title": "Jaipur to Delhi Departure", "desc": "Breakfast and drive back to Delhi for onward flight." }
        ]
    }
];

const QUICK_DISCOUNT_PERCENTAGES = [10, 15, 20, 25, 30, 40, 50, 60, 70];

export default function AdminTourOnboardingAI() {
    const [mode, setMode] = useState<"ai" | "json">("ai");
    const [promptText, setPromptText] = useState("");
    const [jsonInput, setJsonInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState("");
    const [generatedTours, setGeneratedTours] = useState<any[]>([]);
    const [publishingMap, setPublishingMap] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});
    const [isBulkPublishing, setIsBulkPublishing] = useState(false);
    const [copiedTemplate, setCopiedTemplate] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

    // Active gallery url input state per tour id
    const [newGalleryUrlMap, setNewGalleryUrlMap] = useState<Record<string, string>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const galleryFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4500);
    };

    // Copy Sample JSON Template
    const handleCopyTemplate = () => {
        navigator.clipboard.writeText(JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2));
        setCopiedTemplate(true);
        setTimeout(() => setCopiedTemplate(false), 2500);
        showToast("📋 Sample JSON Template copied to clipboard!");
    };

    // ─── 2-WAY REACTIVE PRICING & DISCOUNT CALCULATOR ────────────────────────
    // If Original = 10000 and Discount = 50%, Price = 5000
    const handleOriginalPriceChange = (tourId: string, val: string | number) => {
        const orig = typeof val === 'number' ? Math.max(0, val) : Math.max(0, parseFloat(val) || 0);

        setGeneratedTours(prev => prev.map(t => {
            if (t.id !== tourId) return t;

            // Extract numeric discount % if already set
            const discNum = parseFloat(String(t.discountPercent || "").replace(/[^0-9.]/g, "")) || 0;
            let finalPrice = t.price;

            if (discNum > 0 && orig > 0) {
                finalPrice = Math.round(orig * (1 - discNum / 100));
            } else if (orig > 0 && (!finalPrice || finalPrice > orig)) {
                finalPrice = orig;
            }

            return {
                ...t,
                originalPrice: orig > 0 ? orig : null,
                price: finalPrice
            };
        }));
    };

    const handleDiscountChange = (tourId: string, val: string | number) => {
        const discNum = typeof val === 'number'
            ? Math.min(99, Math.max(0, val))
            : Math.min(99, Math.max(0, parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0));

        setGeneratedTours(prev => prev.map(t => {
            if (t.id !== tourId) return t;

            const orig = t.originalPrice || t.price || 0;
            let finalPrice = t.price;

            if (orig > 0 && discNum > 0) {
                finalPrice = Math.round(orig * (1 - discNum / 100));
            } else if (orig > 0 && discNum === 0) {
                finalPrice = orig;
            }

            return {
                ...t,
                originalPrice: orig > 0 ? orig : Math.round(finalPrice * 1.25),
                discountPercent: discNum > 0 ? `${discNum}% OFF` : null,
                price: finalPrice
            };
        }));
    };

    const handleStartingPriceChange = (tourId: string, val: string | number) => {
        const newPrice = typeof val === 'number' ? Math.max(0, val) : Math.max(0, parseFloat(val) || 0);

        setGeneratedTours(prev => prev.map(t => {
            if (t.id !== tourId) return t;

            const orig = t.originalPrice || 0;
            let discountPercent = t.discountPercent;

            if (orig > newPrice && orig > 0) {
                const disc = Math.round(((orig - newPrice) / orig) * 100);
                discountPercent = disc > 0 ? `${disc}% OFF` : null;
            } else if (orig <= newPrice) {
                discountPercent = null;
            }

            return {
                ...t,
                price: newPrice,
                discountPercent
            };
        }));
    };

    // ─── LOCAL PHOTO UPLOAD & DRAG/DROP HANDLERS ─────────────────────────────
    // Convert a local file to Base64 (and optionally upload via API)
    const processLocalFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("No file"));
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;
                if (!base64) return reject(new Error("Failed to read file"));
                
                // Attempt to upload to backend storage for permanent URL
                try {
                    const res = await packageApi.uploadImage(base64);
                    if (res && res.success && res.url) {
                        resolve(res.url);
                        return;
                    }
                } catch (err) {
                    console.warn("Direct upload failed, using local base64 fallback:", err);
                }
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Handle Local Cover Photo Upload / Drop
    const handleCoverPhotoUpload = async (tourId: string, file: File) => {
        if (!file) return;
        try {
            showToast("📸 Processing & uploading cover photo...");
            const url = await processLocalFile(file);
            updateTourField(tourId, "image", url);
            showToast("✅ Cover photo updated successfully!");
        } catch (err: any) {
            alert("Error reading photo: " + err.message);
        }
    };

    // Handle Local Gallery Photos Upload / Drop (Multiple Files)
    const handleGalleryPhotosUpload = async (tourId: string, files: FileList | File[]) => {
        if (!files || files.length === 0) return;
        try {
            showToast(`📸 Processing & uploading ${files.length} gallery photo(s)...`);
            const uploadPromises = Array.from(files).map(f => processLocalFile(f));
            const newUrls = await Promise.all(uploadPromises);

            setGeneratedTours(prev => prev.map(t => {
                if (t.id !== tourId) return t;
                const existing = Array.isArray(t.gallery) ? t.gallery : (t.image ? [t.image] : []);
                return {
                    ...t,
                    gallery: [...existing, ...newUrls]
                };
            }));
            showToast(`✅ Added ${newUrls.length} photo(s) to tour gallery!`);
        } catch (err: any) {
            alert("Error reading gallery photos: " + err.message);
        }
    };

    // Delete single photo from gallery
    const handleDeleteGalleryPhoto = (tourId: string, photoIdx: number) => {
        setGeneratedTours(prev => prev.map(t => {
            if (t.id !== tourId) return t;
            const updated = (t.gallery || []).filter((_: any, idx: number) => idx !== photoIdx);
            return {
                ...t,
                gallery: updated
            };
        }));
    };

    // Add gallery photo via URL
    const handleAddGalleryUrl = (tourId: string) => {
        const url = (newGalleryUrlMap[tourId] || "").trim();
        if (!url) return;

        setGeneratedTours(prev => prev.map(t => {
            if (t.id !== tourId) return t;
            const existing = Array.isArray(t.gallery) ? t.gallery : (t.image ? [t.image] : []);
            return {
                ...t,
                gallery: [...existing, url]
            };
        }));

        setNewGalleryUrlMap(prev => ({ ...prev, [tourId]: "" }));
        showToast("✅ Photo added to gallery!");
    };

    // ─── AI GENERATION HANDLER ───────────────────────────────────────────────
    const handleGenerateWithAI = async () => {
        if (!promptText.trim()) {
            alert("Please type a tour description, rough notes, or select a preset prompt.");
            return;
        }

        setIsGenerating(true);
        setGenerationStep("Analyzing travel circuit, routes & highlights...");

        const stepTimer1 = setTimeout(() => {
            setGenerationStep("Structuring day-by-day itinerary & inclusions...");
        }, 1200);

        const stepTimer2 = setTimeout(() => {
            setGenerationStep("Mapping high-res destination photography & prices...");
        }, 2400);

        try {
            const res = await packageApi.suggestTours({ prompt: promptText });
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                setGeneratedTours(res.data);
                setExpandedCardId(res.data[0]?.id || null);
                showToast(`🎉 Generated ${res.data.length} ready-to-publish tour package(s)!`);
            } else {
                alert("Failed to generate tours: " + (res?.message || "Unknown error"));
            }
        } catch (err: any) {
            console.error("AI Tour Generation failed:", err);
            alert("AI Generation failed: " + err.message);
        } finally {
            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            setIsGenerating(false);
            setGenerationStep("");
        }
    };

    // JSON Parse & Load Handler
    const handleParseJson = () => {
        if (!jsonInput.trim()) {
            alert("Please paste JSON text or upload a .json file.");
            return;
        }

        try {
            let parsed = JSON.parse(jsonInput);
            let items: any[] = [];
            if (Array.isArray(parsed)) items = parsed;
            else if (parsed.packages && Array.isArray(parsed.packages)) items = parsed.packages;
            else if (parsed.tours && Array.isArray(parsed.tours)) items = parsed.tours;
            else if (parsed.title || parsed.name) items = [parsed];

            if (items.length === 0) {
                alert("No valid tour package items found in the JSON structure.");
                return;
            }

            const formatted = items.map((t, idx) => {
                const price = parseFloat(t.price || t.price_starting_inr || 15000);
                const originalPrice = t.originalPrice || t.original_price ? parseFloat(t.originalPrice || t.original_price) : Math.round(price * 1.25);
                const discountPercent = t.discountPercent || t.discount_percent || (originalPrice > price ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF` : null);

                return {
                    id: `json-draft-${Date.now()}-${idx}`,
                    title: t.title || t.tour_name || "Custom Tour Package",
                    destination: t.destination || t.route || "India",
                    duration: t.duration || "5 Days / 4 Nights",
                    price,
                    originalPrice,
                    discountPercent,
                    rating: parseFloat(t.rating || 4.9),
                    reviewsCount: parseInt(t.reviewsCount || t.reviews_count || 50, 10),
                    badge: t.badge || "Bestseller",
                    includedStay: t.includedStay || t.included_stay || "4-Star Deluxe Hotels",
                    transport: t.transport || "Private AC Sedan Transfers Included",
                    image: t.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
                    gallery: Array.isArray(t.gallery) ? t.gallery : [t.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"],
                    overview: t.overview || "Exciting holiday experience with verified stays and guided transfers.",
                    highlights: Array.isArray(t.highlights) ? t.highlights : [],
                    inclusions: Array.isArray(t.inclusions) ? t.inclusions : ["Hotel stay", "Breakfast", "AC Cab"],
                    exclusions: Array.isArray(t.exclusions) ? t.exclusions : ["Airfare", "Personal expenses"],
                    itinerary: Array.isArray(t.itinerary) ? t.itinerary : []
                };
            });

            setGeneratedTours(formatted);
            setExpandedCardId(formatted[0]?.id || null);
            showToast(`✅ Successfully parsed ${formatted.length} tour(s) from JSON! Review below and publish.`);
        } catch (err: any) {
            alert("Invalid JSON: " + err.message);
        }
    };

    // File Upload Handler (for .json files)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonInput(content);
            try {
                const parsed = JSON.parse(content);
                const count = Array.isArray(parsed) ? parsed.length : 1;
                showToast(`📄 Loaded file "${file.name}" (${count} item(s)). Click "Parse & Preview" to load.`);
            } catch (err) {
                showToast(`📄 Loaded file "${file.name}". Click "Parse & Preview" to test JSON syntax.`);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    // Update single tour draft field in state
    const updateTourField = (tourId: string, field: string, value: any) => {
        setGeneratedTours(prev => prev.map(t => t.id === tourId ? { ...t, [field]: value } : t));
    };

    // Publish SINGLE tour to Live MySQL Database
    const handlePublishSingle = async (tour: any) => {
        setPublishingMap(prev => ({ ...prev, [tour.id]: "saving" }));
        try {
            const payload = {
                title: tour.title,
                destination: tour.destination,
                duration: tour.duration,
                price: parseFloat(tour.price),
                originalPrice: tour.originalPrice ? parseFloat(tour.originalPrice) : null,
                discountPercent: tour.discountPercent || null,
                rating: parseFloat(tour.rating || 4.9),
                reviewsCount: parseInt(tour.reviewsCount || 48, 10),
                badge: tour.badge || "Bestseller",
                includedStay: tour.includedStay,
                transport: tour.transport,
                image: tour.image,
                gallery: Array.isArray(tour.gallery) ? tour.gallery : [tour.image],
                overview: tour.overview,
                inclusions: tour.inclusions,
                exclusions: tour.exclusions,
                itinerary: tour.itinerary
            };

            const res = await packageApi.createPackage(payload);
            if (res && res.success) {
                setPublishingMap(prev => ({ ...prev, [tour.id]: "saved" }));
                showToast(`🎉 "${tour.title}" is now LIVE on GetHotelStays.com!`);
            } else {
                setPublishingMap(prev => ({ ...prev, [tour.id]: "error" }));
                alert("Failed to save to database: " + (res?.message || "Server error"));
            }
        } catch (err: any) {
            setPublishingMap(prev => ({ ...prev, [tour.id]: "error" }));
            alert("Database save error: " + err.message);
        }
    };

    // Publish ALL tours in Bulk to Live MySQL Database
    const handlePublishAll = async () => {
        if (generatedTours.length === 0) return;
        if (!confirm(`Are you sure you want to publish all ${generatedTours.length} tour packages live to the database?`)) return;

        setIsBulkPublishing(true);
        try {
            const res = await packageApi.importJson({
                packages: generatedTours
            });

            if (res && res.success) {
                const newMap: Record<string, "saved"> = {};
                generatedTours.forEach(t => { newMap[t.id] = "saved"; });
                setPublishingMap(newMap);
                showToast(`🚀 Successfully published all ${res.count || generatedTours.length} tour packages directly into the live database!`);
            } else {
                alert("Bulk publish failed: " + (res?.message || "Server error"));
            }
        } catch (err: any) {
            alert("Bulk publish error: " + err.message);
        } finally {
            setIsBulkPublishing(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#050505] text-neutral-100 p-6 space-y-8 font-sans">
            {/* Header Banner */}
            <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-950/80 border border-emerald-700/50 rounded-lg text-emerald-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </span>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            AI Tour Onboarding Copilot
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 uppercase tracking-widest">
                            Live Database Connected
                        </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                        Generate complete luxury & budget Indian tour packages instantly via AI prompts, raw itineraries, or direct JSON.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="/packages"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-[#161616] hover:bg-[#202020] border border-[#2a2a2a] text-neutral-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                        <span>View Live Tours Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                </div>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div className="p-4 bg-emerald-950/90 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-bold flex items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <a href="/packages" target="_blank" rel="noreferrer" className="underline text-emerald-300 hover:text-white text-[11px] shrink-0 font-extrabold">
                        Check /packages ↗
                    </a>
                </div>
            )}

            {/* Mode Toggle Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4">
                <div className="flex items-center gap-2 bg-[#0c0c0c] p-1.5 rounded-xl border border-[#1f1f1f]">
                    <button
                        onClick={() => setMode("ai")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            mode === "ai"
                                ? "bg-white text-black shadow-md"
                                : "text-neutral-400 hover:text-white"
                        }`}
                    >
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>AI Prompt Generator</span>
                    </button>

                    <button
                        onClick={() => setMode("json")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            mode === "json"
                                ? "bg-white text-black shadow-md"
                                : "text-neutral-400 hover:text-white"
                        }`}
                    >
                        <FileCode className="w-4 h-4 text-blue-500" />
                        <span>Direct JSON Importer</span>
                    </button>
                </div>

                {mode === "json" && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyTemplate}
                            className="px-3 py-2 bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] text-neutral-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                            <span>{copiedTemplate ? "Copied!" : "Copy JSON Template"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* MODE 1: AI PROMPT GENERATOR */}
            {mode === "ai" && (
                <div className="space-y-4 bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c]">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                            <span>Describe Tour, Itinerary or Travel Circuit:</span>
                            <span className="text-[10px] text-neutral-500 lowercase font-normal">(Hindi, English, or rough notes accepted)</span>
                        </label>
                    </div>

                    <div className="relative">
                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="e.g. Create 3 luxury packages for Rajasthan: Jaipur heritage 3 days, Udaipur lake view 4 days, and Jaisalmer desert safari. Include 4-star stays, daily breakfast, and private cab. Price around ₹18000 to ₹35000."
                            rows={4}
                            disabled={isGenerating}
                            className="w-full bg-[#141414] border border-[#262626] rounded-xl p-4 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed font-mono disabled:opacity-50"
                        />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                            ⚡ Quick 1-Click Tour Presets:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_PROMPTS.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setPromptText(p.prompt)}
                                    disabled={isGenerating}
                                    className="px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] hover:border-emerald-700/60 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer text-left"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Action Button */}
                    <div className="pt-2 flex items-center justify-between">
                        <div className="text-xs text-neutral-400 font-medium">
                            {isGenerating && (
                                <span className="text-emerald-400 flex items-center gap-2 font-bold animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                    <span>{generationStep || "Generating..."}</span>
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleGenerateWithAI}
                            disabled={isGenerating || !promptText.trim()}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Crafting Tours...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-white" />
                                    <span>Generate Complete Tours</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* MODE 2: DIRECT JSON IMPORTER */}
            {mode === "json" && (
                <div className="space-y-4 bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                            Paste Tour Packages JSON Array:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] text-neutral-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5 text-neutral-400" />
                                <span>Upload .json File</span>
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={`[\n  {\n    "title": "Classic Golden Triangle Tour",\n    "destination": "Delhi • Agra • Jaipur",\n    "duration": "6 Days / 5 Nights",\n    "price": 18999,\n    "originalPrice": 24999,\n    "badge": "Bestseller"\n  }\n]`}
                        rows={10}
                        className="w-full bg-[#141414] border border-[#262626] rounded-xl p-4 text-xs font-mono text-emerald-400 placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={handleParseJson}
                            disabled={!jsonInput.trim()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/40"
                        >
                            <FileCode className="w-4 h-4 text-white" />
                            <span>Parse & Preview Tours</span>
                        </button>
                    </div>
                </div>
            )}

            {/* GENERATED TOURS REVIEW & LIVE PUBLISH SECTION */}
            {generatedTours.length > 0 && (
                <div className="space-y-6 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                            <h3 className="text-base font-black text-white uppercase tracking-tight">
                                Ready To Publish ({generatedTours.length} Package{generatedTours.length > 1 ? "s" : ""})
                            </h3>
                            <span className="text-xs text-neutral-400 font-semibold">
                                Edit details below or publish directly to the live database
                            </span>
                        </div>

                        <button
                            onClick={handlePublishAll}
                            disabled={isBulkPublishing}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-950/50"
                        >
                            {isBulkPublishing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Publishing All...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                    <span>Publish ALL Tours to Database ⚡</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Cards Grid / List */}
                    <div className="space-y-6">
                        {generatedTours.map((tour, index) => {
                            const isExpanded = expandedCardId === tour.id;
                            const pubStatus = publishingMap[tour.id] || "idle";

                            const origPrice = Number(tour.originalPrice) || 0;
                            const currentPrice = Number(tour.price) || 0;
                            const discountNum = parseFloat(String(tour.discountPercent || "").replace(/[^0-9.]/g, "")) || 0;
                            const savingsAmount = origPrice > currentPrice ? origPrice - currentPrice : 0;

                            return (
                                <div
                                    key={tour.id || index}
                                    className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-2xl overflow-hidden shadow-lg transition-all hover:border-[#2a2a2a]"
                                >
                                    {/* Card Top Preview Bar */}
                                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111]/60">
                                        <div className="flex items-start gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-24 h-20 rounded-xl overflow-hidden bg-neutral-900 border border-[#222] shrink-0 relative group">
                                                {tour.image ? (
                                                    <img
                                                        src={tour.image}
                                                        alt={tour.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/80 text-emerald-400">
                                                    #{index + 1}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                                                        {tour.badge || "Bestseller"}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                                        {tour.duration}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                                                        {tour.destination}
                                                    </span>
                                                </div>

                                                <h4 className="text-base font-bold text-white leading-snug">
                                                    {tour.title}
                                                </h4>

                                                {/* Live Price Tag */}
                                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                                    <span className="text-emerald-400 font-extrabold text-base">
                                                        ₹{currentPrice.toLocaleString()}
                                                    </span>
                                                    {origPrice > currentPrice && (
                                                        <span className="text-neutral-500 line-through text-xs font-semibold">
                                                            ₹{origPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {tour.discountPercent && (
                                                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-extrabold text-[10px] border border-emerald-800/50">
                                                            {tour.discountPercent}
                                                        </span>
                                                    )}
                                                    {savingsAmount > 0 && (
                                                        <span className="text-emerald-500 text-[10px] font-bold">
                                                            (Save ₹{savingsAmount.toLocaleString()})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => setExpandedCardId(isExpanded ? null : tour.id)}
                                                className="px-3.5 py-2 bg-[#161616] hover:bg-[#202020] border border-[#262626] text-neutral-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                <span>{isExpanded ? "Collapse" : "Edit / Inspect"}</span>
                                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                            </button>

                                            <button
                                                onClick={() => handlePublishSingle(tour)}
                                                disabled={pubStatus === "saving" || pubStatus === "saved"}
                                                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                                    pubStatus === "saved"
                                                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                                        : pubStatus === "saving"
                                                        ? "bg-neutral-800 text-neutral-400 opacity-60"
                                                        : "bg-white hover:bg-neutral-200 text-black shadow-md"
                                                }`}
                                            >
                                                {pubStatus === "saving" ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Saving...</span>
                                                    </>
                                                ) : pubStatus === "saved" ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>Live on Site!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                                        <span>Publish Live</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable Editable Form Inspector */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="border-t border-[#1a1a1a] p-6 space-y-6 bg-[#0a0a0a]"
                                            >
                                                {/* Core Details Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                            Tour Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={tour.title}
                                                            onChange={(e) => updateTourField(tour.id, "title", e.target.value)}
                                                            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                            Destination Route (e.g. Delhi • Agra)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={tour.destination}
                                                            onChange={(e) => updateTourField(tour.id, "destination", e.target.value)}
                                                            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                            Duration (Days / Nights)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={tour.duration}
                                                            onChange={(e) => updateTourField(tour.id, "duration", e.target.value)}
                                                            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* ─── 2-WAY REACTIVE PRICING & DISCOUNT CALCULATOR SECTION ─── */}
                                                <div className="p-4 bg-[#111111] border border-[#222222] rounded-2xl space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Percent className="w-3.5 h-3.5" />
                                                            <span>Smart 2-Way Pricing & Discount Calculator</span>
                                                        </span>
                                                        {origPrice > 0 && currentPrice > 0 && (
                                                            <span className="text-xs font-bold text-neutral-300">
                                                                Formula: <span className="line-through text-neutral-500">₹{origPrice.toLocaleString()}</span> ➔ <span className="text-emerald-400 font-extrabold">₹{currentPrice.toLocaleString()}</span> {tour.discountPercent ? `(${tour.discountPercent})` : ""}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {/* 1. Original Rack Price */}
                                                        <div>
                                                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                                Original Rack Price (₹)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={tour.originalPrice || ""}
                                                                placeholder="e.g. 10000"
                                                                onChange={(e) => handleOriginalPriceChange(tour.id, e.target.value)}
                                                                className="w-full bg-[#161616] border border-[#2c2c2c] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                                                            />
                                                            <span className="text-[9px] text-neutral-500 mt-1 block">Crossed-out original price</span>
                                                        </div>

                                                        {/* 2. Discount % Input */}
                                                        <div>
                                                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                                Discount (%)
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="99"
                                                                    value={discountNum || ""}
                                                                    placeholder="e.g. 50"
                                                                    onChange={(e) => handleDiscountChange(tour.id, e.target.value)}
                                                                    className="w-full bg-[#161616] border border-[#2c2c2c] rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">%</span>
                                                            </div>
                                                            <span className="text-[9px] text-neutral-500 mt-1 block">Auto-calculates selling price</span>
                                                        </div>

                                                        {/* 3. Final Starting Price */}
                                                        <div>
                                                            <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 block">
                                                                Starting Selling Price (₹)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={tour.price || ""}
                                                                placeholder="e.g. 5000"
                                                                onChange={(e) => handleStartingPriceChange(tour.id, e.target.value)}
                                                                className="w-full bg-[#161616] border border-emerald-800/60 rounded-xl px-3 py-2 text-xs font-black text-emerald-400 focus:outline-none focus:border-emerald-400"
                                                            />
                                                            <span className="text-[9px] text-emerald-500 mt-1 block">Final price shown to guest</span>
                                                        </div>

                                                        {/* 4. Badge */}
                                                        <div>
                                                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                                Badge Tag
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={tour.badge}
                                                                onChange={(e) => updateTourField(tour.id, "badge", e.target.value)}
                                                                className="w-full bg-[#161616] border border-[#2c2c2c] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                                                            />
                                                            <span className="text-[9px] text-neutral-500 mt-1 block">Bestseller, Trending, etc.</span>
                                                        </div>
                                                    </div>

                                                    {/* Quick 1-Click Discount Chips */}
                                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                        <span className="text-[10px] text-neutral-400 font-semibold mr-1">Quick Discount:</span>
                                                        {QUICK_DISCOUNT_PERCENTAGES.map((pct) => (
                                                            <button
                                                                key={pct}
                                                                type="button"
                                                                onClick={() => handleDiscountChange(tour.id, pct)}
                                                                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                                                    discountNum === pct
                                                                        ? "bg-amber-400 text-black shadow-sm font-black"
                                                                        : "bg-[#1c1c1c] text-neutral-300 hover:bg-[#252525] hover:text-white border border-[#2a2a2a]"
                                                                }`}
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Stay & Transport */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                            Included Stays (Hotels / Resort / Camp)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={tour.includedStay || ""}
                                                            onChange={(e) => updateTourField(tour.id, "includedStay", e.target.value)}
                                                            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                            Transport Specification
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={tour.transport || ""}
                                                            onChange={(e) => updateTourField(tour.id, "transport", e.target.value)}
                                                            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* ─── LOCAL PHOTO UPLOAD & GALLERY DROP ZONE ────────────────── */}
                                                <div className="space-y-4 p-4 bg-[#111111] border border-[#222222] rounded-2xl">
                                                    {/* 1. Main Cover Photo */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                                                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                                                                <span>Main Cover Photo (Local File Upload / Drag & Drop / URL)</span>
                                                            </label>
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row items-start gap-4">
                                                            {/* Cover Preview */}
                                                            <div className="w-36 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-[#262626] shrink-0 relative group">
                                                                {tour.image ? (
                                                                    <img
                                                                        src={tour.image}
                                                                        alt="Cover"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                                        <ImageIcon className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-black/80 text-emerald-400">
                                                                    Cover
                                                                </span>
                                                            </div>

                                                            {/* Upload / Drag / URL Controls */}
                                                            <div className="flex-1 space-y-2 w-full">
                                                                {/* Drag & Drop Box */}
                                                                <div
                                                                    onDragOver={(e) => e.preventDefault()}
                                                                    onDrop={(e) => {
                                                                        e.preventDefault();
                                                                        const file = e.dataTransfer.files?.[0];
                                                                        if (file) handleCoverPhotoUpload(tour.id, file);
                                                                    }}
                                                                    className="border-2 border-dashed border-[#2d2d2d] hover:border-emerald-600/80 bg-[#161616] p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                                                                    onClick={() => coverFileInputRefs.current[tour.id]?.click()}
                                                                >
                                                                    <input
                                                                        ref={(el) => (coverFileInputRefs.current[tour.id] = el)}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) handleCoverPhotoUpload(tour.id, file);
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        <Upload className="w-4 h-4 text-emerald-400" />
                                                                        <span className="text-xs text-neutral-300 font-semibold">
                                                                            Click to Upload Cover Photo or Drag & Drop File Here
                                                                        </span>
                                                                    </div>
                                                                    <span className="px-2.5 py-1 bg-white text-black text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                                        Browse
                                                                    </span>
                                                                </div>

                                                                {/* URL Input */}
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={tour.image || ""}
                                                                        placeholder="Or paste image URL (e.g. Unsplash or web link)"
                                                                        onChange={(e) => updateTourField(tour.id, "image", e.target.value)}
                                                                        className="w-full bg-[#161616] border border-[#262626] rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 2. Tour Gallery Photos (Multiple) */}
                                                    <div className="space-y-2 pt-2 border-t border-[#1c1c1c]">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                                                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                                                                <span>Tour Gallery Photos ({Array.isArray(tour.gallery) ? tour.gallery.length : 0})</span>
                                                            </label>
                                                        </div>

                                                        {/* Gallery Drag & Drop Multi-file Box */}
                                                        <div
                                                            onDragOver={(e) => e.preventDefault()}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                if (e.dataTransfer.files) {
                                                                    handleGalleryPhotosUpload(tour.id, e.dataTransfer.files);
                                                                }
                                                            }}
                                                            className="border-2 border-dashed border-[#2d2d2d] hover:border-blue-600/80 bg-[#161616] p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                                                            onClick={() => galleryFileInputRefs.current[tour.id]?.click()}
                                                        >
                                                            <input
                                                                ref={(el) => (galleryFileInputRefs.current[tour.id] = el)}
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                onChange={(e) => {
                                                                    if (e.target.files) {
                                                                        handleGalleryPhotosUpload(tour.id, e.target.files);
                                                                    }
                                                                }}
                                                                className="hidden"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <Upload className="w-4 h-4 text-blue-400" />
                                                                <span className="text-xs text-neutral-300 font-semibold">
                                                                    Drop Multiple Photos Here or Click to Select from Local Files
                                                                </span>
                                                            </div>
                                                            <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                                Upload Photos
                                                            </span>
                                                        </div>

                                                        {/* Add via URL bar */}
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={newGalleryUrlMap[tour.id] || ""}
                                                                placeholder="Add single photo by web URL..."
                                                                onChange={(e) => setNewGalleryUrlMap(prev => ({ ...prev, [tour.id]: e.target.value }))}
                                                                onKeyDown={(e) => { if (e.key === "Enter") handleAddGalleryUrl(tour.id); }}
                                                                className="flex-1 bg-[#161616] border border-[#262626] rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none focus:border-blue-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddGalleryUrl(tour.id)}
                                                                className="px-3 py-1.5 bg-[#202020] hover:bg-[#282828] border border-[#333] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                                                            >
                                                                + Add URL
                                                            </button>
                                                        </div>

                                                        {/* Gallery Thumbnails Strip */}
                                                        {Array.isArray(tour.gallery) && tour.gallery.length > 0 && (
                                                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                                                                {tour.gallery.map((photoUrl: string, photoIdx: number) => (
                                                                    <div
                                                                        key={photoIdx}
                                                                        className="w-20 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-[#2c2c2c] shrink-0 relative group shadow-sm"
                                                                    >
                                                                        <img
                                                                            src={photoUrl}
                                                                            alt={`Gallery ${photoIdx + 1}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteGalleryPhoto(tour.id, photoIdx)}
                                                                            className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-600 text-white rounded-md opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                                                                            title="Delete Photo"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Overview */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                                                        Overview & Story
                                                    </label>
                                                    <textarea
                                                        value={tour.overview || ""}
                                                        onChange={(e) => updateTourField(tour.id, "overview", e.target.value)}
                                                        rows={3}
                                                        className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs font-medium text-white focus:outline-none focus:border-emerald-500 resize-y leading-relaxed"
                                                    />
                                                </div>

                                                {/* Day-by-Day Itinerary Accordion / List */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                            Day-by-Day Itinerary ({Array.isArray(tour.itinerary) ? tour.itinerary.length : 0} Days)
                                                        </label>
                                                        <button
                                                            onClick={() => {
                                                                const current = Array.isArray(tour.itinerary) ? [...tour.itinerary] : [];
                                                                const dayNum = current.length + 1;
                                                                current.push({ day: `Day ${dayNum}`, title: `Day ${dayNum} Sightseeing`, desc: "Detailed day itinerary..." });
                                                                updateTourField(tour.id, "itinerary", current);
                                                            }}
                                                            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Plus className="w-3 h-3" /> Add Day
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {(Array.isArray(tour.itinerary) ? tour.itinerary : []).map((item: any, dayIdx: number) => (
                                                            <div key={dayIdx} className="bg-[#141414] border border-[#222] p-3 rounded-xl space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={item.day || `Day ${dayIdx + 1}`}
                                                                        onChange={(e) => {
                                                                            const updated = [...tour.itinerary];
                                                                            updated[dayIdx].day = e.target.value;
                                                                            updateTourField(tour.id, "itinerary", updated);
                                                                        }}
                                                                        className="w-24 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-2 py-1 text-xs font-bold text-emerald-400"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={item.title || ""}
                                                                        placeholder="Day Title"
                                                                        onChange={(e) => {
                                                                            const updated = [...tour.itinerary];
                                                                            updated[dayIdx].title = e.target.value;
                                                                            updateTourField(tour.id, "itinerary", updated);
                                                                        }}
                                                                        className="flex-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-2 py-1 text-xs font-semibold text-white"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const updated = tour.itinerary.filter((_: any, i: number) => i !== dayIdx);
                                                                            updateTourField(tour.id, "itinerary", updated);
                                                                        }}
                                                                        className="p-1 hover:text-rose-400 text-neutral-500 cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                                <textarea
                                                                    value={item.desc || ""}
                                                                    placeholder="Day activity description"
                                                                    onChange={(e) => {
                                                                        const updated = [...tour.itinerary];
                                                                        updated[dayIdx].desc = e.target.value;
                                                                        updateTourField(tour.id, "itinerary", updated);
                                                                    }}
                                                                    rows={2}
                                                                    className="w-full bg-[#181818] border border-[#262626] rounded-lg p-2 text-xs text-neutral-300 resize-none"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Inclusions & Exclusions */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 block">
                                                            Inclusions (1 per line)
                                                        </label>
                                                        <textarea
                                                            value={Array.isArray(tour.inclusions) ? tour.inclusions.join("\n") : (tour.inclusions || "")}
                                                            onChange={(e) => updateTourField(tour.id, "inclusions", e.target.value.split("\n").filter(Boolean))}
                                                            rows={4}
                                                            className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs text-neutral-200 resize-y leading-relaxed font-mono"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 block">
                                                            Exclusions (1 per line)
                                                        </label>
                                                        <textarea
                                                            value={Array.isArray(tour.exclusions) ? tour.exclusions.join("\n") : (tour.exclusions || "")}
                                                            onChange={(e) => updateTourField(tour.id, "exclusions", e.target.value.split("\n").filter(Boolean))}
                                                            rows={4}
                                                            className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs text-neutral-200 resize-y leading-relaxed font-mono"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bottom Save Action */}
                                                <div className="pt-2 flex justify-end">
                                                    <button
                                                        onClick={() => handlePublishSingle(tour)}
                                                        disabled={pubStatus === "saving" || pubStatus === "saved"}
                                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                                                    >
                                                        {pubStatus === "saving" ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span>Saving to Database...</span>
                                                            </>
                                                        ) : pubStatus === "saved" ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-white" />
                                                                <span>Saved Live in Database!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                                                <span>Publish "{tour.title}" Live</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
