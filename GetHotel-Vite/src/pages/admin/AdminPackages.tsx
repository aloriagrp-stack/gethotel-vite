import React, { useState, useEffect } from "react";
import { packageApi } from "@/lib/api";
import Loader from "@/components/common/Loader";
import SEOHead from "@/components/common/SEOHead";
import {
    Palmtree, Plus, Edit, Trash2, Search, Check, X,
    Eye, EyeOff, MapPin, Clock, Star, Sparkles, Image, ArrowLeft,
    Calendar, ShieldCheck, ChevronRight, Save, Upload, Loader2, FileCode, CheckCircle2,
    CircleDot, Tag, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPackages() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // View state: 'list' for packages table, 'form' for in-page editor
    const [viewMode, setViewMode] = useState<"list" | "form">("list");
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Image uploading states
    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    // JSON Import Modal States
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [jsonInputText, setJsonInputText] = useState("");
    const [isImportingJson, setIsImportingJson] = useState(false);
    const [jsonValidation, setJsonValidation] = useState<{ isValid: boolean; count: number; message: string }>({
        isValid: false,
        count: 0,
        message: ""
    });

    // Hero Section Manager Modal States
    const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
    const [heroConfig, setHeroConfig] = useState<{ title: string; subtitle: string; heroImages: string[] }>({
        title: "Explore Handcrafted Tour Packages",
        subtitle: "Unforgettable journeys designed for your dream vacation across India & global destinations",
        heroImages: [
            "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1920&q=80"
        ]
    });
    const [uploadingHero, setUploadingHero] = useState(false);
    const [savingHero, setSavingHero] = useState(false);

    // Destination Circles Manager Modal States
    const [isDestModalOpen, setIsDestModalOpen] = useState(false);
    const [destinations, setDestinations] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_destinations");
        return saved ? JSON.parse(saved) : [
            { id: "dest-1", name: "All", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80" },
            { id: "dest-2", name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=200&q=80" },
            { id: "dest-3", name: "Rajasthan", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=200&q=80" },
            { id: "dest-4", name: "Kashmir", image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=200&q=80" },
            { id: "dest-5", name: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=200&q=80" },
            { id: "dest-6", name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=200&q=80" },
            { id: "dest-7", name: "Ladakh", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=200&q=80" }
        ];
    });
    const [editingDest, setEditingDest] = useState<any>(null);
    const [destFormData, setDestFormData] = useState({ name: "", image: "" });

    // Filter Tag Line Manager Modal States
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterConfig, setFilterConfig] = useState<{ showFilterLine: boolean; filterTags: string[] }>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_filter_config");
        return saved ? JSON.parse(saved) : {
            showFilterLine: true,
            filterTags: ["All", "Bestseller", "Trending", "Super Saver", "Top Rated"]
        };
    });
    const [newTagInput, setNewTagInput] = useState("");

    // Persist Destination Circles & Filter Config to LocalStorage & dispatch window event
    useEffect(() => {
        localStorage.setItem("ghs_admin_tour_destinations", JSON.stringify(destinations));
        window.dispatchEvent(new Event("ghs_tour_settings_updated"));
    }, [destinations]);

    useEffect(() => {
        localStorage.setItem("ghs_admin_tour_filter_config", JSON.stringify(filterConfig));
        window.dispatchEvent(new Event("ghs_tour_settings_updated"));
    }, [filterConfig]);

    // Form state for Single Package Editor
    const [formData, setFormData] = useState<any>({
        title: "",
        slug: "",
        destination: "",
        duration: "5 Days / 4 Nights",
        price: 15000,
        originalPrice: 19999,
        discountPercent: "25% OFF",
        rating: 4.8,
        reviewsCount: 45,
        badge: "Bestseller",
        includedStay: "4-Star Hotel Stay",
        transport: "Private AC Cab Included",
        image: "",
        gallery: "",
        overview: "",
        inclusions: ["4-Star Hotel Stay with Breakfast", "Airport Transfers Included", "Guided Sightseeing Tour"],
        itinerary: [
            { day: "Day 1", title: "Arrival & Hotel Check-in", desc: "Welcome reception and check-in to your resort." },
            { day: "Day 2", title: "Guided City Sightseeing", desc: "Full day sightseeing tour with private guide." }
        ],
        isActive: true
    });

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await packageApi.getPackages({ includeInactive: true });
            if (res && res.success) {
                setPackages(res.data || []);
            }
        } catch (err: any) {
            console.error("Failed to fetch packages:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHeroConfig = async () => {
        try {
            const res = await packageApi.getHeroConfig();
            if (res && res.success && res.data) {
                setHeroConfig({
                    title: res.data.title || "Explore Handcrafted Tour Packages",
                    subtitle: res.data.subtitle || "Unforgettable journeys designed for your dream vacation",
                    heroImages: Array.isArray(res.data.heroImages) ? res.data.heroImages : []
                });
            }
        } catch (err) {
            console.error("Failed to fetch hero config:", err);
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchHeroConfig();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3500);
    };

    // Live JSON Validator
    const handleJsonInputChange = (text: string) => {
        setJsonInputText(text);
        if (!text.trim()) {
            setJsonValidation({ isValid: false, count: 0, message: "" });
            return;
        }

        try {
            const parsed = JSON.parse(text);
            let count = 0;
            if (Array.isArray(parsed)) {
                count = parsed.length;
            } else if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.packages)) count = parsed.packages.length;
                else if (Array.isArray(parsed.tours)) count = parsed.tours.length;
                else if (parsed.title || parsed.name) count = 1;
            }

            if (count > 0) {
                setJsonValidation({ isValid: true, count, message: `Valid JSON format! (${count} Tour Package(s) detected)` });
            } else {
                setJsonValidation({ isValid: false, count: 0, message: "Valid JSON syntax, but no 'title' or package array found." });
            }
        } catch (e: any) {
            setJsonValidation({ isValid: false, count: 0, message: "Syntax Error: " + e.message });
        }
    };

    // File Picker for JSON file
    const handleJsonFileUpload = (file: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                handleJsonInputChange(content);
            }
        };
        reader.readAsText(file);
    };

    // Paste Sample AI Prompt & JSON Format
    const handlePasteSampleJson = () => {
        const sample = JSON.stringify([
            {
                "title": "Kashmir Paradise 6D5N Snow & Houseboat Escapade",
                "destination": "Srinagar, Gulmarg & Pahalgam, Kashmir",
                "duration": "6 Days / 5 Nights",
                "price": 24999,
                "originalPrice": 32999,
                "discountPercent": "24% OFF",
                "badge": "Bestseller",
                "rating": 4.95,
                "reviewsCount": 142,
                "includedStay": "4-Star Houseboat & Luxury Resort",
                "transport": "Private SUV Mountain Transfers",
                "image": "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80",
                "overview": "Experience Paradise on Earth with luxury houseboat stay in Dal Lake, Shikara ride, and Gondola cable car ride in snow-capped Gulmarg.",
                "inclusions": [
                    "4-Star Houseboat & Resort Stay",
                    "Daily Breakfast & Gourmet Dinner",
                    "Shikara Ride at Dal Lake",
                    "Gondola Cable Car Ride in Gulmarg",
                    "Airport Pickup & Drop in SUV"
                ],
                "itinerary": [
                    { "day": "Day 1", "title": "Srinagar Arrival & Houseboat Check-in", "desc": "Welcome reception and evening Shikara ride on Dal Lake." },
                    { "day": "Day 2", "title": "Srinagar to Gulmarg Snow Excursion", "desc": "Enjoy Gondola cable car ride to Phase 1 & 2 in snow peak mountain." },
                    { "day": "Day 3", "title": "Gulmarg to Pahalgam Valley of Shepherds", "desc": "Visit Aru Valley & Betaab Valley with local pony ride." }
                ]
            }
        ], null, 2);
        handleJsonInputChange(sample);
    };

    // Import JSON Submit Handler
    const handleImportJsonSubmit = async () => {
        if (!jsonInputText.trim() || !jsonValidation.isValid) return;
        setIsImportingJson(true);

        try {
            const res = await packageApi.importJson({ jsonText: jsonInputText });
            if (res && res.success) {
                showToast(`✓ ${res.message || "Tour Packages imported successfully!"}`);
                setIsJsonModalOpen(false);
                setJsonInputText("");
                setJsonValidation({ isValid: false, count: 0, message: "" });
                fetchPackages();
            } else {
                alert(res?.message || "Failed to import packages via JSON.");
            }
        } catch (err: any) {
            alert("Error importing JSON: " + err.message);
        } finally {
            setIsImportingJson(false);
        }
    };

    // Local Hero Section Image File Upload Handler (NO manual link typing!)
    const handleHeroLocalImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploadingHero(true);

        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(file);
                });

                if (base64) {
                    const res = await packageApi.uploadImage(base64);
                    if (res && res.success && res.url) {
                        uploadedUrls.push(res.url);
                    }
                }
            }

            if (uploadedUrls.length > 0) {
                setHeroConfig((prev) => ({
                    ...prev,
                    heroImages: [...prev.heroImages, ...uploadedUrls]
                }));
                showToast(`✓ ${uploadedUrls.length} local hero image(s) uploaded successfully!`);
            }
        } catch (e: any) {
            alert("Failed to upload hero image: " + e.message);
        } finally {
            setUploadingHero(false);
        }
    };

    const handleRemoveHeroImage = (index: number) => {
        setHeroConfig((prev) => ({
            ...prev,
            heroImages: prev.heroImages.filter((_, i) => i !== index)
        }));
    };

    const handleSaveHeroConfig = async () => {
        setSavingHero(true);
        try {
            const res = await packageApi.updateHeroConfig(heroConfig);
            if (res && res.success) {
                showToast("✓ Tour Hero Section Banner & Local Images updated!");
                setIsHeroModalOpen(false);
            } else {
                alert(res?.message || "Failed to update Hero Section.");
            }
        } catch (err: any) {
            alert("Error saving Hero config: " + err.message);
        } finally {
            setSavingHero(false);
        }
    };

    // Smart Price & Automatic Discount Calculator
    const handlePriceChange = (field: "price" | "originalPrice", value: any) => {
        setFormData((prev: any) => {
            const updated = { ...prev, [field]: value };
            const original = parseFloat(updated.originalPrice);
            const selling = parseFloat(updated.price);

            if (original && selling && original > selling) {
                const pct = Math.round(((original - selling) / original) * 100);
                updated.discountPercent = `${pct}% OFF`;
            } else if (original && selling && selling >= original) {
                updated.discountPercent = "";
            }
            return updated;
        });
    };

    // Multi-Image Gallery Upload Handler (Min 1, Max 30 Images)
    const handleLocalGalleryUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const currentGal = Array.isArray(formData.gallery) ? formData.gallery : [];
        if (currentGal.length + files.length > 30) {
            alert("Maximum 30 images allowed per tour package!");
            return;
        }

        setUploadingGallery(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(file);
                });

                if (base64) {
                    const res = await packageApi.uploadImage(base64);
                    if (res && res.success && res.url) {
                        uploadedUrls.push(res.url);
                    }
                }
            }

            if (uploadedUrls.length > 0) {
                setFormData((prev: any) => {
                    const existingGal = Array.isArray(prev.gallery) ? prev.gallery : [];
                    const updatedGal = [...existingGal, ...uploadedUrls];
                    const mainImg = prev.image || updatedGal[0];
                    return { ...prev, image: mainImg, gallery: updatedGal };
                });
                showToast(`✓ ${uploadedUrls.length} image(s) uploaded successfully!`);
            }
        } catch (err: any) {
            alert("Failed to upload images: " + err.message);
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        setFormData((prev: any) => {
            const currentGal = Array.isArray(prev.gallery) ? prev.gallery : [];
            const updatedGal = currentGal.filter((_: any, i: number) => i !== index);
            let updatedMain = prev.image;
            if (!updatedGal.includes(updatedMain)) {
                updatedMain = updatedGal[0] || "";
            }
            return { ...prev, image: updatedMain, gallery: updatedGal };
        });
    };

    const handleOpenCreate = () => {
        setEditingPackage(null);
        setFormData({
            title: "",
            slug: "",
            destination: "",
            duration: "5 Days / 4 Nights",
            price: 15000,
            originalPrice: 19999,
            discountPercent: "25% OFF",
            rating: 4.8,
            reviewsCount: 45,
            badge: "Bestseller",
            includedStay: "4-Star Hotel Stay",
            transport: "Private AC Cab Included",
            image: "",
            gallery: [],
            overview: "",
            inclusions: ["4-Star Hotel Stay with Breakfast", "Airport Transfers Included", "Guided Sightseeing Tour"],
            itinerary: [
                { day: "Day 1", title: "Arrival & Hotel Check-in", desc: "Welcome reception and check-in to your resort." },
                { day: "Day 2", title: "Guided City Sightseeing", desc: "Full day sightseeing tour with private guide." }
            ],
            isActive: true
        });
        setViewMode("form");
    };

    const handleOpenEdit = (pkg: any) => {
        setEditingPackage(pkg);
        setFormData({
            title: pkg.title || "",
            slug: pkg.slug || "",
            destination: pkg.destination || "",
            duration: pkg.duration || "5 Days / 4 Nights",
            price: pkg.price || 15000,
            originalPrice: pkg.originalPrice || 0,
            discountPercent: pkg.discountPercent || "",
            rating: pkg.rating || 4.8,
            reviewsCount: pkg.reviewsCount || 45,
            badge: pkg.badge || "Bestseller",
            includedStay: pkg.includedStay || "",
            transport: pkg.transport || "",
            image: pkg.image || "",
            gallery: Array.isArray(pkg.gallery) ? pkg.gallery : [],
            overview: pkg.overview || "",
            inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
            itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary : [],
            isActive: pkg.isActive !== false
        });
        setViewMode("form");
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.destination || !formData.price) {
            alert("Please fill in Title, Destination, and Price");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                rating: parseFloat(formData.rating || 4.8),
                reviewsCount: parseInt(formData.reviewsCount || 45, 10)
            };

            if (editingPackage) {
                await packageApi.updatePackage(editingPackage.id, payload);
                showToast("✓ Tour Package updated successfully!");
            } else {
                await packageApi.createPackage(payload);
                showToast("✓ New Tour Package created successfully!");
            }

            setViewMode("list");
            fetchPackages();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            alert("Failed to save package: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePackage = async (id: number, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            await packageApi.deletePackage(id);
            showToast("✓ Package deleted successfully!");
            fetchPackages();
        } catch (err: any) {
            alert("Failed to delete package: " + err.message);
        }
    };

    const handleToggleStatus = async (pkg: any) => {
        try {
            await packageApi.updatePackage(pkg.id, { isActive: !pkg.isActive });
            showToast(`✓ Package set to ${!pkg.isActive ? 'Active' : 'Hidden'}!`);
            fetchPackages();
        } catch (err: any) {
            alert("Failed to update status: " + err.message);
        }
    };

    const handleAddInclusion = () => {
        setFormData((prev: any) => ({
            ...prev,
            inclusions: [...prev.inclusions, ""]
        }));
    };

    const handleInclusionChange = (index: number, val: string) => {
        setFormData((prev: any) => {
            const updated = [...prev.inclusions];
            updated[index] = val;
            return { ...prev, inclusions: updated };
        });
    };

    const handleRemoveInclusion = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            inclusions: prev.inclusions.filter((_: any, i: number) => i !== index)
        }));
    };

    const handleAddItineraryDay = () => {
        const nextDayNum = (formData.itinerary?.length || 0) + 1;
        setFormData((prev: any) => ({
            ...prev,
            itinerary: [...(prev.itinerary || []), { day: `Day ${nextDayNum}`, title: "", desc: "" }]
        }));
    };

    const handleItineraryChange = (index: number, field: "day" | "title" | "desc", val: string) => {
        setFormData((prev: any) => {
            const updated = [...prev.itinerary];
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, itinerary: updated };
        });
    };

    const handleRemoveItineraryDay = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            itinerary: prev.itinerary.filter((_: any, i: number) => i !== index)
        }));
    };

    const filteredPackages = packages.filter(pkg => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (pkg.title || "").toLowerCase().includes(q) || (pkg.destination || "").toLowerCase().includes(q);
    });

    return (
        <div className="p-4 sm:p-8 space-y-6 font-sans text-neutral-100 max-w-6xl mx-auto">
            <SEOHead title="Manage Tour Packages | Super Admin" description="Manage all tour packages, itineraries, inclusions and prices." noIndex />

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-[300] px-5 py-3 bg-[#181818] border border-[#2a2a2a] text-white text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2"
                    >
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========================================================= */}
            {/* VIEW MODE 1: LIST / TABLE VIEW */}
            {/* ========================================================= */}
            {viewMode === "list" && (
                <div className="space-y-6">
                    {/* Header - Pure Black Skeuomorphic */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                <Palmtree className="w-4 h-4 text-emerald-400" />
                                <span>Tour Packages Manager</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                Package Directory ({packages.length})
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                onClick={() => setIsDestModalOpen(true)}
                                className="px-4 py-2.5 bg-[#161616] hover:bg-[#202020] border border-[#282828] text-sky-400 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <CircleDot className="w-4 h-4 text-sky-400" />
                                <span>Destination Circles</span>
                            </button>

                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                className="px-4 py-2.5 bg-[#161616] hover:bg-[#202020] border border-[#282828] text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Tag className="w-4 h-4 text-indigo-400" />
                                <span>Filter Line Settings</span>
                            </button>

                            <button
                                onClick={() => setIsHeroModalOpen(true)}
                                className="px-4 py-2.5 bg-[#161616] hover:bg-[#202020] border border-[#282828] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Image className="w-4 h-4 text-blue-400" />
                                <span>Hero Banner</span>
                            </button>

                            <button
                                onClick={() => setIsJsonModalOpen(true)}
                                className="px-4 py-2.5 bg-[#161616] hover:bg-[#202020] border border-[#282828] text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <span>Import via JSON</span>
                            </button>

                            <button
                                onClick={handleOpenCreate}
                                className="px-5 py-2.5 bg-neutral-100 hover:bg-white text-black rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-black" />
                                <span>Create Package</span>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by package title or destination..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl text-xs sm:text-sm font-semibold text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all font-mono"
                        />
                    </div>

                    {/* Packages List */}
                    {loading ? (
                        <Loader variant="inline" text="Loading tour packages..." />
                    ) : filteredPackages.length === 0 ? (
                        <div className="bg-[#0c0c0c] rounded-2xl p-12 text-center border border-[#1c1c1c] border-t-[#2d2d2d] shadow-2xl space-y-4">
                            <Palmtree className="w-10 h-10 text-neutral-600 mx-auto" />
                            <h3 className="text-sm font-bold uppercase text-white tracking-wider">No Tour Packages Found</h3>
                            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-medium">
                                Click "Import via JSON" or "Create Package" to add your tour packages!
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setIsJsonModalOpen(true)}
                                    className="px-4 py-2.5 bg-[#181818] border border-[#2a2a2a] text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#222222] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Import via JSON</span>
                                </button>

                                <button
                                    onClick={handleOpenCreate}
                                    className="px-4 py-2.5 bg-neutral-100 text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add First Package</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] divide-y divide-[#181818] overflow-hidden">
                            {filteredPackages.map((pkg) => (
                                <div key={pkg.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#121212] transition-colors">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={pkg.image || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80"}
                                            alt={pkg.title}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#282828] shrink-0 bg-[#161616] shadow-inner"
                                        />
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-2.5 py-0.5 bg-[#141414] text-neutral-300 text-[10px] font-bold rounded-md uppercase tracking-wider border border-[#262626]">
                                                    {pkg.badge || "Package"}
                                                </span>
                                                <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-emerald-400" />
                                                    {pkg.destination}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-sm sm:text-base text-white">
                                                {pkg.title}
                                            </h3>

                                            <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                                    {pkg.duration}
                                                </span>
                                                <span>•</span>
                                                <span className="font-black text-white">
                                                    ₹{pkg.price?.toLocaleString("en-IN")}
                                                </span>
                                                {pkg.discountPercent && (
                                                    <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded">
                                                        {pkg.discountPercent}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <button
                                            onClick={() => handleToggleStatus(pkg)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                                                pkg.isActive
                                                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/40"
                                                    : "bg-[#141414] text-neutral-500 border-[#262626]"
                                            }`}
                                        >
                                            {pkg.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            <span>{pkg.isActive ? "Active" : "Hidden"}</span>
                                        </button>

                                        <button
                                            onClick={() => handleOpenEdit(pkg)}
                                            className="p-2 text-neutral-300 hover:text-white hover:bg-[#1f1f1f] border border-[#282828] rounded-lg transition-colors cursor-pointer"
                                            title="Edit Package"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                                            className="p-2 text-red-400 hover:bg-red-950/60 border border-red-900/40 rounded-lg transition-colors cursor-pointer"
                                            title="Delete Package"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 1: IMPORT TOUR VIA JSON MODAL */}
            {/* ========================================================= */}
            {isJsonModalOpen && (
                <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0c] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#1c1c1c] border-t-[#2d2d2d] text-white max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-[#161616] text-emerald-400 flex items-center justify-center border border-[#282828]">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white uppercase tracking-wider">Import Tour Packages via JSON</h2>
                                    <p className="text-xs text-neutral-400 font-medium">Paste AI-generated JSON or upload a .json file</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsJsonModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Prompt Assistant Tip */}
                        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                    <span>AI Prompt Assistant</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handlePasteSampleJson}
                                    className="px-3 py-1 bg-[#1e1e1e] hover:bg-[#282828] border border-[#333333] text-emerald-400 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                >
                                    Paste Sample JSON
                                </button>
                            </div>
                            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                                You can ask ChatGPT/Claude: <em>"Generate a JSON array of 5 exotic Indian tour packages with title, destination, duration, price, overview, inclusions, itinerary array."</em>
                            </p>
                        </div>

                        {/* File upload or Text input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                    Paste JSON String or Upload File
                                </label>
                                <label className="cursor-pointer text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1">
                                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Upload .json File</span>
                                    <input
                                        type="file"
                                        accept=".json,application/json"
                                        onChange={(e) => e.target.files?.[0] && handleJsonFileUpload(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <textarea
                                rows={10}
                                value={jsonInputText}
                                onChange={(e) => handleJsonInputChange(e.target.value)}
                                placeholder="Paste your tour package JSON here..."
                                className="w-full p-4 bg-[#070707] font-mono text-xs text-emerald-400 rounded-2xl border border-[#222222] outline-none resize-none focus:border-neutral-500"
                            />
                        </div>

                        {/* Live Validation Indicator */}
                        {jsonInputText.trim() && (
                            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                jsonValidation.isValid
                                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                                    : "bg-red-950/80 text-red-400 border border-red-800/40"
                            }`}>
                                {jsonValidation.isValid ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                                <span>{jsonValidation.message}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 border-t border-[#1f1f1f] pt-3">
                            <button
                                onClick={() => setIsJsonModalOpen(false)}
                                className="px-4 py-2 bg-[#181818] border border-[#2a2a2a] text-neutral-300 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImportJsonSubmit}
                                disabled={!jsonValidation.isValid || isImportingJson}
                                className="px-6 py-2 bg-neutral-100 hover:bg-white text-black disabled:opacity-50 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                            >
                                {isImportingJson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span>{isImportingJson ? "Importing..." : `Import ${jsonValidation.count || ''} Tours Now`}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: HERO BANNER & LOCAL IMAGE MANAGER MODAL */}
            {/* ========================================================= */}
            {isHeroModalOpen && (
                <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0c] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#1c1c1c] border-t-[#2d2d2d] text-white max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-[#161616] text-blue-400 flex items-center justify-center border border-[#282828]">
                                    <Image className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white uppercase tracking-wider">Manage Tour Hero Section & Local Images</h2>
                                    <p className="text-xs text-neutral-400 font-medium">Upload local files directly from your device</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsHeroModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Title & Subtitle Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Hero Section Main Title
                                </label>
                                <input
                                    type="text"
                                    value={heroConfig.title}
                                    onChange={(e) => setHeroConfig(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Explore Handcrafted Tour Packages"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Hero Subtitle / Tagline
                                </label>
                                <input
                                    type="text"
                                    value={heroConfig.subtitle}
                                    onChange={(e) => setHeroConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                                    placeholder="Unforgettable journeys designed for your dream vacation..."
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-semibold text-neutral-300 outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>
                        </div>

                        {/* Local File Image Upload Box */}
                        <div className="space-y-3 border-t border-[#1f1f1f] pt-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                                    <Upload className="w-4 h-4 text-emerald-400" />
                                    <span>Upload Local Banner Images</span>
                                </label>
                                <span className="text-[11px] text-neutral-500 font-semibold">({heroConfig.heroImages.length} images)</span>
                            </div>

                            <label className="border-2 border-dashed border-[#282828] hover:border-neutral-500 bg-[#141414] p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                                {uploadingHero ? (
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Converting & Uploading Local Images to WebP...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-neutral-400" />
                                        <span className="text-xs font-bold text-white">Click to Select Local Images from Device</span>
                                        <span className="text-[11px] text-neutral-500">Supports PNG, JPG, WebP (Converted automatically to high-res WebP)</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleHeroLocalImageUpload(e.target.files)}
                                    className="hidden"
                                />
                            </label>

                            {/* Uploaded Hero Images Gallery Grid */}
                            {heroConfig.heroImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                    {heroConfig.heroImages.map((imgUrl, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[16/9] border border-[#282828] bg-[#161616]">
                                            <img src={imgUrl} alt={`Hero Banner ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveHeroImage(idx)}
                                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-all cursor-pointer"
                                                title="Remove Image"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-[#1f1f1f] pt-4">
                            <button
                                onClick={() => setIsHeroModalOpen(false)}
                                className="px-4 py-2 bg-[#181818] border border-[#2a2a2a] text-neutral-300 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveHeroConfig}
                                disabled={savingHero}
                                className="px-6 py-2 bg-neutral-100 hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                            >
                                {savingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{savingHero ? "Saving..." : "Save Hero Section"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* VIEW MODE 2: FORM / PACKAGE EDITOR VIEW */}
            {/* ========================================================= */}
            {viewMode === "form" && (
                <form onSubmit={handleSubmitForm} className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className="w-9 h-9 rounded-xl bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight">
                                    {editingPackage ? `Edit: ${editingPackage.title}` : "Create New Tour Package"}
                                </h1>
                                <p className="text-xs text-neutral-400 font-medium">Configure package itinerary, pricing, and inclusions</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-neutral-100 hover:bg-white text-black text-xs font-bold rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4 text-black" />
                            <span>{isSubmitting ? "Saving..." : (editingPackage ? "Save Changes" : "Publish Package")}</span>
                        </button>
                    </div>

                    {/* Section 1: Basic Tour Information */}
                    <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 border-b border-[#1f1f1f] pb-3">
                            <Palmtree className="w-4 h-4 text-emerald-400" />
                            <span>1. Basic Tour Details</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Package Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Royal Rajasthan Heritage & Fort Trail"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Destination Covered *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    placeholder="e.g. Jaipur • Udaipur • Jodhpur"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-semibold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Duration *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g. 5 Days / 4 Nights"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-semibold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Badge / Tag
                                </label>
                                <input
                                    type="text"
                                    value={formData.badge}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="e.g. Bestseller, Trending, Flat 25% OFF"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-semibold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Pricing & Stay Features */}
                    <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 border-b border-[#1f1f1f] pb-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>2. Pricing & Stay Features</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Selling Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => handlePriceChange("price", e.target.value)}
                                    placeholder="15000"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-black text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Original Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={(e) => handlePriceChange("originalPrice", e.target.value)}
                                    placeholder="19999"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-neutral-400 outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Discount Tag
                                </label>
                                <input
                                    type="text"
                                    value={formData.discountPercent}
                                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                    placeholder="e.g. 25% OFF"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-emerald-400 outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Included Hotel Stay
                                </label>
                                <input
                                    type="text"
                                    value={formData.includedStay}
                                    onChange={(e) => setFormData({ ...formData, includedStay: e.target.value })}
                                    placeholder="e.g. Beachfront 4-Star Resort"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-semibold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                    Transport Included
                                </label>
                                <input
                                    type="text"
                                    value={formData.transport}
                                    onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                                    placeholder="e.g. Private AC Sedan Included"
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-semibold text-white outline-none focus:border-neutral-500 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Package Images */}
                    <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
                        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                <Image className="w-4 h-4 text-emerald-400" />
                                <span>3. Package Images (Min 1, Max 30 Photos)</span>
                            </h2>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border bg-[#141414] border-[#262626] text-neutral-300">
                                {formData.gallery?.length || (formData.image ? 1 : 0)} / 30 Images
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Upload Area */}
                            <label className="border-2 border-dashed border-[#282828] hover:border-neutral-500 bg-[#141414] p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                                {uploadingGallery ? (
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Uploading & Optimizing Local Images to WebP...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-neutral-400" />
                                        <span className="text-xs font-bold text-white">Click to Select Local Images from Device</span>
                                        <span className="text-[11px] text-neutral-500 font-medium">Select single or multiple photos (Min 1, Max 30 photos per package)</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleLocalGalleryUpload(e.target.files)}
                                    className="hidden"
                                />
                            </label>

                            {/* Uploaded Gallery Thumbnails Grid */}
                            {Array.isArray(formData.gallery) && formData.gallery.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                            Uploaded Photos ({formData.gallery.length})
                                        </span>
                                        <span className="text-[11px] text-neutral-500 font-medium">Click star to set as main cover photo</span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {formData.gallery.map((imgUrl: string, idx: number) => {
                                            const isMain = formData.image === imgUrl || (!formData.image && idx === 0);
                                            return (
                                                <div key={idx} className={`relative group rounded-xl overflow-hidden aspect-[4/3] border-2 bg-[#141414] transition-all ${
                                                    isMain ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-[#282828]"
                                                }`}>
                                                    <img src={imgUrl} alt={`Tour Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                                    
                                                    {isMain && (
                                                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase tracking-wider shadow">
                                                            Cover
                                                        </span>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        {!isMain && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData((prev: any) => ({ ...prev, image: imgUrl }))}
                                                                className="p-1.5 rounded-full bg-white text-amber-500 shadow transition-all cursor-pointer"
                                                                title="Set as Cover Image"
                                                            >
                                                                <Star className="w-4 h-4 fill-amber-400" />
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveGalleryImage(idx)}
                                                            className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow transition-all cursor-pointer"
                                                            title="Delete Image"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : formData.image ? (
                                <div className="space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                                        Cover Photo (1 Photo)
                                    </span>
                                    <div className="relative group rounded-xl overflow-hidden max-w-xs aspect-[16/9] border-2 border-emerald-500 bg-[#141414]">
                                        <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev: any) => ({ ...prev, image: "", gallery: [] }))}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow transition-all cursor-pointer"
                                            title="Delete Image"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Section 4: Package Overview & Inclusions */}
                    <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 border-b border-[#1f1f1f] pb-3">
                            <FileCode className="w-4 h-4 text-emerald-400" />
                            <span>4. Overview & Key Inclusions</span>
                        </h2>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                Tour Overview & Highlights
                            </label>
                            <textarea
                                rows={4}
                                value={formData.overview}
                                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                                placeholder="Write detailed overview of this tour package..."
                                className="w-full p-3.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-medium text-white outline-none focus:border-neutral-500 resize-none font-mono"
                            />
                        </div>

                        {/* Inclusions list */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                    Key Inclusions
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddInclusion}
                                    className="px-3 py-1 bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Add Inclusion</span>
                                </button>
                            </div>

                            {formData.inclusions.map((inc: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inc}
                                        onChange={(e) => handleInclusionChange(idx, e.target.value)}
                                        placeholder="e.g. 4-Star Hotel Stay with Breakfast"
                                        className="flex-1 px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs font-semibold text-white outline-none font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveInclusion(idx)}
                                        className="w-9 h-9 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center hover:bg-red-900 transition-colors shrink-0 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 5: Day-by-Day Itinerary */}
                    <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
                        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-400" />
                                <span>5. Day-by-Day Itinerary</span>
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddItineraryDay}
                                className="px-3 py-1 bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Add Day</span>
                            </button>
                        </div>

                        {formData.itinerary.map((dayItem: any, idx: number) => (
                            <div key={idx} className="p-4 bg-[#141414] border border-[#262626] rounded-xl space-y-2.5 relative">
                                <div className="flex items-center justify-between gap-2">
                                    <input
                                        type="text"
                                        value={dayItem.day}
                                        onChange={(e) => handleItineraryChange(idx, "day", e.target.value)}
                                        placeholder="Day 1"
                                        className="w-24 px-3 py-2 bg-[#0c0c0c] border border-[#282828] rounded-lg text-xs font-extrabold text-emerald-400 outline-none font-mono"
                                    />
                                    <input
                                        type="text"
                                        value={dayItem.title}
                                        onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                                        placeholder="Day Activity Title"
                                        className="flex-1 px-3.5 py-2 bg-[#0c0c0c] border border-[#282828] rounded-lg text-xs font-semibold text-white outline-none font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItineraryDay(idx)}
                                        className="w-8 h-8 rounded-lg bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center hover:bg-red-900 shrink-0 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <textarea
                                    rows={2}
                                    value={dayItem.desc}
                                    onChange={(e) => handleItineraryChange(idx, "desc", e.target.value)}
                                    placeholder="Activity description for this day..."
                                    className="w-full px-3.5 py-2 bg-[#0c0c0c] border border-[#282828] rounded-lg text-xs font-medium text-neutral-300 outline-none resize-none font-mono"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="bg-[#0c0c0c] p-5 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className="px-5 py-2.5 bg-[#181818] border border-[#2a2a2a] hover:bg-[#222222] text-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            Cancel & Return
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-neutral-100 hover:bg-white text-black text-xs font-bold rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4 text-black" />
                            <span>{isSubmitting ? "Saving..." : (editingPackage ? "Save Changes" : "Publish Package")}</span>
                        </button>
                    </div>
                </form>
            )}

            {/* DESTINATION STORY CIRCLES MANAGER MODAL */}
            <AnimatePresence>
                {isDestModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0c0c0c] rounded-2xl shadow-2xl border border-[#1c1c1c] border-t-[#2d2d2d] w-full max-w-2xl overflow-hidden text-white"
                        >
                            <div className="p-5 bg-[#0e0e0e] border-b border-[#1f1f1f] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <CircleDot className="w-4 h-4 text-sky-400" />
                                    <span>Manage Popular Destination Circles ({destinations.length})</span>
                                </h3>
                                <button
                                    onClick={() => { setIsDestModalOpen(false); setEditingDest(null); setDestFormData({ name: "", image: "" }); }}
                                    className="w-7 h-7 rounded-full bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
                                {/* Grid of current circle destinations */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {destinations.map((dest) => (
                                        <div key={dest.id} className="p-3 bg-[#121212] border border-[#222] rounded-xl flex flex-col items-center gap-2 relative group hover:border-sky-500/50 transition-all">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-xs font-bold text-white truncate max-w-full">{dest.name}</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setEditingDest(dest); setDestFormData({ name: dest.name, image: dest.image }); }}
                                                    className="p-1 bg-[#202020] text-neutral-300 hover:text-white rounded border border-[#333] cursor-pointer"
                                                    title="Edit Destination"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete destination "${dest.name}"?`)) {
                                                            setDestinations(prev => prev.filter(d => d.id !== dest.id));
                                                            showToast(`✓ Destination "${dest.name}" deleted!`);
                                                        }
                                                    }}
                                                    className="p-1 bg-red-950/60 text-red-400 hover:text-red-300 rounded border border-red-900/40 cursor-pointer"
                                                    title="Delete Destination"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Create / Edit Form inside Modal */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!destFormData.name.trim() || !destFormData.image.trim()) return;

                                        if (editingDest) {
                                            setDestinations(prev => prev.map(d => d.id === editingDest.id ? {
                                                ...d,
                                                name: destFormData.name.trim(),
                                                image: destFormData.image.trim()
                                            } : d));
                                            showToast(`✓ Destination "${destFormData.name}" updated!`);
                                        } else {
                                            const newD = {
                                                id: `dest-${Date.now()}`,
                                                name: destFormData.name.trim(),
                                                image: destFormData.image.trim()
                                            };
                                            setDestinations(prev => [...prev, newD]);
                                            showToast(`✓ Destination "${destFormData.name}" added!`);
                                        }
                                        setEditingDest(null);
                                        setDestFormData({ name: "", image: "" });
                                    }}
                                    className="p-4 bg-[#141414] border border-[#262626] rounded-xl space-y-3"
                                >
                                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                                        {editingDest ? `Edit Destination "${editingDest.name}"` : "Add New Destination Circle"}
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Destination Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Goa, Manali, Shimla..."
                                                value={destFormData.name}
                                                onChange={(e) => setDestFormData({ ...destFormData, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#282828] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Circle Image URL</label>
                                            <input
                                                type="url"
                                                required
                                                placeholder="https://images.unsplash.com/..."
                                                value={destFormData.image}
                                                onChange={(e) => setDestFormData({ ...destFormData, image: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#282828] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                                        >
                                            {editingDest ? "Update Circle" : "Add Destination Circle"}
                                        </button>

                                        {editingDest && (
                                            <button
                                                type="button"
                                                onClick={() => { setEditingDest(null); setDestFormData({ name: "", image: "" }); }}
                                                className="px-3 py-2 bg-[#222] text-neutral-400 hover:text-white rounded-xl text-xs font-bold"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FILTER TAG LINE SETTINGS MODAL */}
            <AnimatePresence>
                {isFilterModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0c0c0c] rounded-2xl shadow-2xl border border-[#1c1c1c] border-t-[#2d2d2d] w-full max-w-lg overflow-hidden text-white"
                        >
                            <div className="p-5 bg-[#0e0e0e] border-b border-[#1f1f1f] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-indigo-400" />
                                    <span>Filter Tag Line Settings</span>
                                </h3>
                                <button
                                    onClick={() => setIsFilterModalOpen(false)}
                                    className="w-7 h-7 rounded-full bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-5 text-xs font-medium">
                                {/* Toggle Filter Line Visibility */}
                                <div className="p-4 bg-[#121212] border border-[#222] rounded-xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {filterConfig.showFilterLine ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-neutral-500" />}
                                            <span>Filter Bar Line Visibility</span>
                                        </h4>
                                        <p className="text-[11px] text-neutral-400 mt-0.5">
                                            {filterConfig.showFilterLine ? "Filter bar is VISIBLE on public page." : "Filter bar is HIDDEN on public page."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const updated = !filterConfig.showFilterLine;
                                            setFilterConfig(prev => ({ ...prev, showFilterLine: updated }));
                                            showToast(updated ? "✓ Filter tag bar is now Visible!" : "✓ Filter tag bar is now Hidden!");
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                            filterConfig.showFilterLine
                                                ? "bg-emerald-950 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900"
                                                : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                                        }`}
                                    >
                                        {filterConfig.showFilterLine ? "Visible" : "Hidden"}
                                    </button>
                                </div>

                                {/* Active Filter Tags List */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                                        Active Filter Tags ({filterConfig.filterTags.length})
                                    </h4>

                                    <div className="flex flex-wrap gap-2">
                                        {filterConfig.filterTags.map((tag) => (
                                            <div
                                                key={tag}
                                                className="px-3 py-1.5 bg-[#181818] border border-[#2b2b2b] rounded-xl text-xs font-bold text-white flex items-center gap-2"
                                            >
                                                <span>{tag}</span>
                                                {tag !== "All" && (
                                                    <button
                                                        onClick={() => {
                                                            setFilterConfig(prev => ({
                                                                ...prev,
                                                                filterTags: prev.filterTags.filter(t => t !== tag)
                                                            }));
                                                            showToast(`✓ Tag "${tag}" deleted.`);
                                                        }}
                                                        className="text-neutral-500 hover:text-red-400 cursor-pointer"
                                                        title="Delete Tag"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add New Filter Tag Form */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const t = newTagInput.trim();
                                        if (!t) return;
                                        if (filterConfig.filterTags.includes(t)) {
                                            alert("Tag already exists.");
                                            return;
                                        }
                                        setFilterConfig(prev => ({
                                            ...prev,
                                            filterTags: [...prev.filterTags, t]
                                        }));
                                        setNewTagInput("");
                                        showToast(`✓ Tag "${t}" added!`);
                                    }}
                                    className="flex gap-2 pt-2 border-t border-[#1f1f1f]"
                                >
                                    <input
                                        type="text"
                                        required
                                        placeholder="Add new filter tag (e.g. Honeymoon, Luxury)..."
                                        value={newTagInput}
                                        onChange={(e) => setNewTagInput(e.target.value)}
                                        className="flex-1 px-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                                    >
                                        Add Tag
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
