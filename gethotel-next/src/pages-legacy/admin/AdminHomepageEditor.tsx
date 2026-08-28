'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Save, LayoutTemplate, Link as LinkIcon, Image as ImageIcon, Plus, Trash2, Search, X, Check, Hotel, Layers } from "lucide-react";
import { adminApi, homepageApi } from "@/lib/api";

const DEFAULT_DESTINATIONS = [
    { name: "Indonesia", flag: "🇮🇩", image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop", properties: "1,345+ Verified Stays", linkedHotelIds: [] },
    { name: "Goa", flag: "🌴", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop", properties: "1,240+ Verified Stays", linkedHotelIds: [] },
    { name: "Kerala", flag: "⛵", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop", properties: "850+ Verified Stays", linkedHotelIds: [] },
];

const DEFAULT_COLLECTIONS = [
    {
        title: "Luxury Stays",
        subtitle: "The ultimate premium experience",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
        label: "Premium",
        linkedHotelIds: []
    },
    {
        title: "Budget Friendly",
        subtitle: "Best value without compromise",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        label: "Affordable",
        linkedHotelIds: []
    },
    {
        title: "Couple Retreats",
        subtitle: "Romantic getaways for two",
        image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=800&auto=format&fit=crop",
        label: "Romantic",
        linkedHotelIds: []
    },
    {
        title: "Family Friendly",
        subtitle: "Memorable stays for all ages",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop",
        label: "Spacious",
        linkedHotelIds: []
    }
];

const DEFAULT_STORIES = [
    {
        label: "Goa",
        query: "Hotels in Goa",
        badge: "Hot",
        buttonText: "Explore Goa",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=200&auto=format&fit=crop",
        slides: [
            { title: "Welcome to Goa!", description: "Sun, sand, and spice! Discover India's coastal paradise famous for its stunning beaches and vibrant nightlife.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80", type: "intro" },
            { title: "Serenity Beach Resort", description: "Experience ultimate luxury at our top-rated beachfront resort in North Goa.", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", type: "hotel" },
            { title: "What travelers say", description: "\"The most relaxing vacation I've had in years. The backwaters are magical!\" - Aman K.", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", type: "review" }
        ]
    },
    {
        label: "Udaipur",
        query: "Hotels in Udaipur",
        badge: "Trend",
        buttonText: "Explore Udaipur",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=200&auto=format&fit=crop",
        slides: [
            { title: "The City of Lakes", description: "Experience the royal charm of Udaipur, known for its majestic palaces reflected in tranquil waters.", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&q=80", type: "intro" },
            { title: "Lake Palace Majesty", description: "Stay in a living palace in the middle of Lake Pichola for a truly royal experience.", image: "https://images.unsplash.com/photo-1620801552882-628f62c01997?w=800&q=80", type: "hotel" },
            { title: "Guest Feedback", description: "\"Floating in the middle of a lake was a dream come true. 5 stars!\" - Sarah L.", image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80", type: "review" }
        ]
    },
    {
        label: "Shimla",
        query: "Hotels in Shimla",
        badge: "",
        buttonText: "Explore Shimla",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=200&auto=format&fit=crop",
        slides: [
            { title: "Queen of the Hills", description: "Enjoy the crisp mountain air and snow-capped peaks in the heart of Himachal Pradesh.", image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80", type: "intro" },
            { title: "The Panorama Palace", description: "Luxury at 7,000 feet with breathtaking Himalayan vistas.", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80", type: "hotel" },
            { title: "Nature's Best", description: "\"Waking up to the Himalayas was the best part of our winter trip!\" - Rohan D.", image: "https://images.unsplash.com/photo-1516048015710-7a3b4c86be43?w=800&q=80", type: "review" }
        ]
    },
    {
        label: "Munnar",
        query: "Hotels in Kerala",
        badge: "",
        buttonText: "Explore Munnar",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=200&auto=format&fit=crop",
        slides: [
            { title: "Emerald Tea Gardens", description: "Lose yourself in the rolling hills of Munnar, carpeted with lush green tea plantations.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80", type: "intro" },
            { title: "Hill Station Chalet", description: "Cozy boutique stay amidst the tea estates with amazing valley views.", image: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=800&q=80", type: "hotel" },
            { title: "Scenic Bliss", description: "\"The most peaceful place I've ever visited. A green heaven!\" - Priya M.", image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&q=80", type: "review" }
        ]
    },
    {
        label: "Jaipur",
        query: "Hotels in Jaipur",
        badge: "New",
        buttonText: "Explore Jaipur",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=200&auto=format&fit=crop",
        slides: [
            { title: "The Pink City", description: "Step into history with majestic forts, vibrant bazaars, and iconic architecture.", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80", type: "intro" },
            { title: "Rajputana Heritage", description: "Live like royalty in a meticulously restored 17th-century palace.", image: "https://images.unsplash.com/photo-1463288889890-a56b2853c40f?w=800&q=80", type: "hotel" },
            { title: "Royal Review", description: "\"Jaipur's hospitality is unmatched. The forts are breathtaking!\" - James B.", image: "https://images.unsplash.com/photo-1524226456802-8bb300d720c7?w=800&q=80", type: "review" }
        ]
    }
];

export default function AdminHomepageEditor() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Config states
    const [headlines, setHeadlines] = useState<any[]>([{ title: "Where would you", highlight: "like to stay?" }]);
    const [heroTransitionInterval, setHeroTransitionInterval] = useState("3");
    const [destinations, setDestinations] = useState<any[]>(DEFAULT_DESTINATIONS);
    const [collections, setCollections] = useState<any[]>(DEFAULT_COLLECTIONS);
    const [stories, setStories] = useState<any[]>(DEFAULT_STORIES);
    const [expandedStoryIndex, setExpandedStoryIndex] = useState<number | null>(null);
    const [hotels, setHotels] = useState<any[]>([]);
    const [selectedTrendingIds, setSelectedTrendingIds] = useState<number[]>([]);
    const [savedConfig, setSavedConfig] = useState(false);
    const [savedTrending, setSavedTrending] = useState(false);

    // Auto-dirty tracking for config changes
    useEffect(() => {
        if (!loading) {
            setSavedConfig(false);
        }
    }, [headlines, heroTransitionInterval, destinations, collections, stories, loading]);

    // Linking modal states
    const [linkingTarget, setLinkingTarget] = useState<{ type: 'destination' | 'collection'; index: number } | null>(null);
    const [hotelSearch, setHotelSearch] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch existing config
                const configRes = await homepageApi.getConfig();
                if (configRes.success && configRes.data) {
                    if (configRes.data.heroTitle || configRes.data.heroHighlight) {
                        const titlesArr = (configRes.data.heroTitle || "Where would you").split(",");
                        const highlightsArr = (configRes.data.heroHighlight || "like to stay?").split(",");
                        const merged = [];
                        const len = Math.max(titlesArr.length, highlightsArr.length);
                        for (let idx = 0; idx < len; idx++) {
                            merged.push({
                                title: (titlesArr[idx] || "Where would you").trim(),
                                highlight: (highlightsArr[idx] || "like to stay?").trim()
                            });
                        }
                        setHeadlines(merged.slice(0, 3));
                    }
                    if (configRes.data.destinations) {
                        const dests = configRes.data.destinations.map((d: any) => ({
                            ...d,
                            linkedHotelIds: d.linkedHotelIds || []
                        }));
                        setDestinations(dests);
                    }
                    if (configRes.data.collections) {
                        const colls = configRes.data.collections.map((c: any) => ({
                            ...c,
                            linkedHotelIds: c.linkedHotelIds || []
                        }));
                        setCollections(colls);
                    }
                    if (configRes.data.stories) {
                        setStories(configRes.data.stories);
                    }
                    if (configRes.data.heroTransitionInterval) {
                        setHeroTransitionInterval(configRes.data.heroTransitionInterval.toString());
                    }
                }

                // Fetch hotels for trending/featured toggles
                const hotelsRes = await adminApi.getAllHotels();
                if (hotelsRes.success) {
                    setHotels(hotelsRes.data);
                    setSelectedTrendingIds(hotelsRes.data.filter((h: any) => h.isTrending).map((h: any) => h.id));
                }
                setSavedConfig(true);
                setSavedTrending(true);
            } catch (err) {
                console.error("Failed to fetch editor data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'super_admin') fetchInitialData();
    }, [user]);

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            const serializedTitles = headlines.map(h => h.title.trim()).join(",");
            const serializedHighlights = headlines.map(h => h.highlight.trim()).join(",");

            const res = await adminApi.updateHomepageConfig({
                heroTitle: serializedTitles,
                heroHighlight: serializedHighlights,
                heroTransitionInterval,
                destinations,
                collections,
                stories
            });
            if (res.success) {
                setSavedConfig(true);
                alert("Homepage sections updated successfully!");
            }
        } catch (err: any) {
            alert(err.message || "Failed to update configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleTrendingLocal = (id: number) => {
        setSelectedTrendingIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
        setSavedTrending(false);
    };

    const [savingTrending, setSavingTrending] = useState(false);

    const handleSaveTrendingBulk = async () => {
        setSavingTrending(true);
        try {
            const res = await adminApi.updateTrendingBulk(selectedTrendingIds);
            if (res.success) {
                setHotels(hotels.map(h => ({
                    ...h,
                    isTrending: selectedTrendingIds.includes(h.id)
                })));
                setSavedTrending(true);
                alert("Trending hotels updated successfully!");
            }
        } catch (err: any) {
            alert("Failed to update trending hotels: " + (err.message || err));
        } finally {
            setSavingTrending(false);
        }
    };

    // Destinations actions
    const handleAddDestination = () => {
        setDestinations([...destinations, { name: "", image: "", properties: "", linkedHotelIds: [] }]);
    };

    const handleUpdateDestination = (index: number, field: string, value: any) => {
        const newDest = [...destinations];
        newDest[index][field] = value;
        setDestinations(newDest);
    };

    const handleRemoveDestination = (index: number) => {
        setDestinations(destinations.filter((_, i) => i !== index));
    };

    // Collections actions
    const handleAddCollection = () => {
        setCollections([...collections, { title: "", subtitle: "", image: "", label: "", linkedHotelIds: [] }]);
    };

    const handleUpdateCollection = (index: number, field: string, value: any) => {
        const newColl = [...collections];
        newColl[index][field] = value;
        setCollections(newColl);
    };

    const handleRemoveCollection = (index: number) => {
        setCollections(collections.filter((_, i) => i !== index));
    };

    // Headlines actions
    const handleUpdateHeadline = (index: number, field: 'title' | 'highlight', value: string) => {
        const newHeadlines = [...headlines];
        newHeadlines[index] = {
            ...newHeadlines[index],
            [field]: value
        };
        setHeadlines(newHeadlines);
    };

    const handleAddHeadline = () => {
        if (headlines.length >= 3) return;
        setHeadlines([...headlines, { title: "", highlight: "" }]);
    };

    const handleRemoveHeadline = (index: number) => {
        if (headlines.length <= 1) return;
        setHeadlines(headlines.filter((_, i) => i !== index));
    };

    // Stories actions
    const handleAddStory = () => {
        setStories([...stories, { label: "", query: "", image: "", badge: "", buttonText: "", slides: [] }]);
        setExpandedStoryIndex(stories.length);
    };

    const handleUpdateStory = (storyIndex: number, field: string, value: any) => {
        const newStories = [...stories];
        newStories[storyIndex] = {
            ...newStories[storyIndex],
            [field]: value
        };
        setStories(newStories);
    };

    const handleRemoveStory = (storyIndex: number) => {
        setStories(stories.filter((_: any, i: number) => i !== storyIndex));
        if (expandedStoryIndex === storyIndex) {
            setExpandedStoryIndex(null);
        }
    };

    const handleAddSlide = (storyIndex: number) => {
        const newStories = [...stories];
        const currentSlides = newStories[storyIndex].slides || [];
        newStories[storyIndex].slides = [
            ...currentSlides,
            { title: "", description: "", image: "", type: "intro" }
        ];
        setStories(newStories);
    };

    const handleUpdateSlide = (storyIndex: number, slideIndex: number, field: string, value: any) => {
        const newStories = [...stories];
        const newSlides = [...newStories[storyIndex].slides];
        newSlides[slideIndex] = {
            ...newSlides[slideIndex],
            [field]: value
        };
        newStories[storyIndex].slides = newSlides;
        setStories(newStories);
    };

    const handleRemoveSlide = (storyIndex: number, slideIndex: number) => {
        const newStories = [...stories];
        newStories[storyIndex].slides = newStories[storyIndex].slides.filter((_: any, i: number) => i !== slideIndex);
        setStories(newStories);
    };

    // Hotel link handlers
    const handleToggleHotelLink = (hotelId: number) => {
        if (!linkingTarget) return;
        const { type, index } = linkingTarget;
        if (type === 'destination') {
            const newDest = [...destinations];
            const linked = newDest[index].linkedHotelIds || [];
            if (linked.includes(hotelId)) {
                newDest[index].linkedHotelIds = linked.filter((id: number) => id !== hotelId);
            } else {
                newDest[index].linkedHotelIds = [...linked, hotelId];
            }
            setDestinations(newDest);
        } else {
            const newColl = [...collections];
            const linked = newColl[index].linkedHotelIds || [];
            if (linked.includes(hotelId)) {
                newColl[index].linkedHotelIds = linked.filter((id: number) => id !== hotelId);
            } else {
                newColl[index].linkedHotelIds = [...linked, hotelId];
            }
            setCollections(newColl);
        }
    };

    const handleSelectAllHotels = (filteredIds: number[]) => {
        if (!linkingTarget) return;
        const { type, index } = linkingTarget;
        if (type === 'destination') {
            const newDest = [...destinations];
            const linked = newDest[index].linkedHotelIds || [];
            const merged = Array.from(new Set([...linked, ...filteredIds]));
            newDest[index].linkedHotelIds = merged;
            setDestinations(newDest);
        } else {
            const newColl = [...collections];
            const linked = newColl[index].linkedHotelIds || [];
            const merged = Array.from(new Set([...linked, ...filteredIds]));
            newColl[index].linkedHotelIds = merged;
            setCollections(newColl);
        }
    };

    const handleClearAllHotels = (filteredIds: number[]) => {
        if (!linkingTarget) return;
        const { type, index } = linkingTarget;
        if (type === 'destination') {
            const newDest = [...destinations];
            const linked = newDest[index].linkedHotelIds || [];
            newDest[index].linkedHotelIds = linked.filter((id: number) => !filteredIds.includes(id));
            setDestinations(newDest);
        } else {
            const newColl = [...collections];
            const linked = newColl[index].linkedHotelIds || [];
            newColl[index].linkedHotelIds = linked.filter((id: number) => !filteredIds.includes(id));
            setCollections(newColl);
        }
    };

    const getLinkedHotelsCount = (type: 'destination' | 'collection', index: number) => {
        if (type === 'destination') {
            return destinations[index]?.linkedHotelIds?.length || 0;
        }
        return collections[index]?.linkedHotelIds?.length || 0;
    };

    const getLinkingTargetIds = () => {
        if (!linkingTarget) return [];
        const { type, index } = linkingTarget;
        if (type === 'destination') {
            return destinations[index]?.linkedHotelIds || [];
        }
        return collections[index]?.linkedHotelIds || [];
    };

    const getLinkingTargetName = () => {
        if (!linkingTarget) return "";
        const { type, index } = linkingTarget;
        if (type === 'destination') {
            return destinations[index]?.name || `Destination #${index + 1}`;
        }
        return collections[index]?.title || `Collection #${index + 1}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] bg-[#050505] text-white">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    // Filter hotels inside the link modal
    const modalFilteredHotels = hotels.filter(h => 
        h.name.toLowerCase().includes(hotelSearch.toLowerCase()) || 
        h.city.toLowerCase().includes(hotelSearch.toLowerCase())
    );
    const modalFilteredIds = modalFilteredHotels.map(h => h.id);
    const selectedIdsInModal = getLinkingTargetIds();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-neutral-100">
            {/* Header / Hero Save Config */}
            <section className="bg-[#0c0c0c] p-6 md:p-8 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f1f1f]">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 font-sans">
                        <LayoutTemplate className="w-4 h-4 text-emerald-400" /> Hero Section Headlines & Carousel
                    </h3>
                    <button 
                        onClick={handleSaveConfig}
                        disabled={saving}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                            saving 
                                ? "bg-amber-500 text-black cursor-wait" 
                                : savedConfig 
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                                    : "bg-white hover:bg-neutral-200 text-black"
                        }`}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                                Saving...
                            </>
                        ) : savedConfig ? (
                            <>
                                <Check className="w-4 h-4 text-white" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 text-black" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 mt-2 gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Headline Cycles (Max 3)</span>
                        <div className="flex items-center gap-1.5 bg-[#141414] px-3 py-1.5 rounded-xl border border-[#262626]">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Pause Interval</span>
                            <select
                                value={heroTransitionInterval}
                                onChange={(e) => {
                                    setHeroTransitionInterval(e.target.value);
                                    setSavedConfig(false);
                                }}
                                className="bg-transparent text-xs font-bold text-white uppercase tracking-wider outline-none border-none cursor-pointer"
                            >
                                <option value="3" className="bg-black text-white">3 Seconds</option>
                                <option value="4" className="bg-black text-white">4 Seconds</option>
                                <option value="5" className="bg-black text-white">5 Seconds</option>
                                <option value="6" className="bg-black text-white">6 Seconds</option>
                                <option value="8" className="bg-black text-white">8 Seconds</option>
                                <option value="10" className="bg-black text-white">10 Seconds</option>
                            </select>
                        </div>
                    </div>
                    {headlines.length < 3 && (
                        <button 
                            type="button" 
                            onClick={handleAddHeadline}
                            className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Headline
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {headlines.map((headline: any, idx: number) => (
                        <div key={idx} className="bg-[#141414] p-4 rounded-xl border border-[#222222] relative flex flex-col md:flex-row gap-4 items-center">
                            <span className="text-xs font-black text-neutral-500 uppercase tracking-wider md:w-16"># {idx + 1}</span>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Main Title Part</label>
                                    <input 
                                        type="text" 
                                        value={headline.title}
                                        onChange={(e) => handleUpdateHeadline(idx, 'title', e.target.value)}
                                        placeholder="e.g. Where would you"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Highlight Part (Blue Accent)</label>
                                    <input 
                                        type="text" 
                                        value={headline.highlight}
                                        onChange={(e) => handleUpdateHeadline(idx, 'highlight', e.target.value)}
                                        placeholder="e.g. like to stay?"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            {headlines.length > 1 && (
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveHeadline(idx)}
                                    className="text-red-400 hover:text-red-300 hover:bg-[#201010] p-2 rounded-xl shrink-0 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Destinations Editor */}
            <section className="bg-[#0c0c0c] p-6 md:p-8 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f1f1f]">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-400" /> Destination Cards Editor
                    </h3>
                    <button onClick={handleAddDestination} className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> Add Destination
                    </button>
                </div>
                
                <div className="space-y-4">
                    {destinations.map((dest, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-[#141414] p-4 rounded-xl border border-[#222222] relative group hover:border-neutral-700 transition-colors">
                            {/* Destination Thumbnail Preview */}
                            <div className="w-16 h-16 rounded-xl bg-[#1c1c1c] border border-[#2c2c2c] overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                                {dest.image ? (
                                    <img src={dest.image} alt={dest.name || "Destination"} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-neutral-500" />
                                )}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Destination</label>
                                    <input 
                                        type="text" 
                                        value={dest.name}
                                        onChange={(e) => handleUpdateDestination(i, 'name', e.target.value)}
                                        placeholder="e.g. Indonesia"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Flag / Emoji</label>
                                    <input 
                                        type="text" 
                                        value={dest.flag || ""}
                                        onChange={(e) => handleUpdateDestination(i, 'flag', e.target.value)}
                                        placeholder="e.g. 🇮🇩"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Stats Line</label>
                                    <input 
                                        type="text" 
                                        value={dest.properties}
                                        onChange={(e) => handleUpdateDestination(i, 'properties', e.target.value)}
                                        placeholder="e.g. 1,345 Hotels • 24 Packages"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Image Control</label>
                                    <div className="flex gap-2">
                                        <label className="px-3.5 py-2.5 bg-[#202020] hover:bg-[#2a2a2a] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors shrink-0 border border-[#333]">
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>{dest.image ? "Change" : "Upload"}</span>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            handleUpdateDestination(i, 'image', reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>

                                        {dest.image && (
                                            <button 
                                                type="button"
                                                onClick={() => handleUpdateDestination(i, 'image', '')}
                                                className="px-3 py-2 text-red-400 hover:bg-[#201010] border border-[#301818] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
                                                title="Clear Image"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Link Hotels Control */}
                            <div className="w-full md:w-auto shrink-0 flex flex-col">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Property Link</span>
                                <button 
                                    onClick={() => setLinkingTarget({ type: 'destination', index: i })}
                                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                        getLinkedHotelsCount('destination', i) > 0 
                                            ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300" 
                                            : "bg-[#1c1c1c] border-[#2c2c2c] text-neutral-300 hover:text-white"
                                    }`}
                                >
                                    <LinkIcon className="w-3.5 h-3.5" />
                                    <span>
                                        {getLinkedHotelsCount('destination', i) > 0 
                                            ? `Linked (${getLinkedHotelsCount('destination', i)})` 
                                            : "Link Hotels"}
                                    </span>
                                </button>
                            </div>

                            <button onClick={() => handleRemoveDestination(i)} className="text-red-400 p-2 hover:bg-[#201010] rounded-xl shrink-0 md:self-end md:mb-0.5 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Collections Editor */}
            <section className="bg-[#0c0c0c] p-6 md:p-8 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f1f1f]">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-400" /> Featured Collections
                    </h3>
                    <button onClick={handleAddCollection} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> Add Collection
                    </button>
                </div>
                
                <div className="space-y-4">
                    {collections.map((coll, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-[#141414] p-4 rounded-xl border border-[#222222] relative group hover:border-neutral-700 transition-colors animate-in fade-in-50 duration-300">
                            {/* Collection Thumbnail Preview */}
                            <div className="w-16 h-16 rounded-xl bg-[#1c1c1c] border border-[#2c2c2c] overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                                {coll.image ? (
                                    <img src={coll.image} alt={coll.title || "Collection"} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-neutral-500" />
                                )}
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Collection Title</label>
                                    <input 
                                        type="text" 
                                        value={coll.title}
                                        onChange={(e) => handleUpdateCollection(i, 'title', e.target.value)}
                                        placeholder="e.g. Luxury Stays"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Subtitle</label>
                                    <input 
                                        type="text" 
                                        value={coll.subtitle}
                                        onChange={(e) => handleUpdateCollection(i, 'subtitle', e.target.value)}
                                        placeholder="e.g. Premium stays"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Label Tag</label>
                                    <input 
                                        type="text" 
                                        value={coll.label}
                                        onChange={(e) => handleUpdateCollection(i, 'label', e.target.value)}
                                        placeholder="e.g. Premium"
                                        className="w-full bg-[#181818] border border-[#282828] text-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Image Control</label>
                                    <div className="flex gap-2">
                                        <label className="px-3.5 py-2.5 bg-[#202020] hover:bg-[#2a2a2a] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors shrink-0 border border-[#333]">
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>{coll.image ? "Change" : "Upload"}</span>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            handleUpdateCollection(i, 'image', reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>

                                        {coll.image && (
                                            <button 
                                                type="button"
                                                onClick={() => handleUpdateCollection(i, 'image', '')}
                                                className="px-3 py-2 text-red-400 hover:bg-[#201010] border border-[#301818] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
                                                title="Clear Image"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Link Hotels Control */}
                            <div className="w-full md:w-auto shrink-0 flex flex-col">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Property Link</span>
                                <button 
                                    onClick={() => setLinkingTarget({ type: 'collection', index: i })}
                                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                        getLinkedHotelsCount('collection', i) > 0 
                                            ? "bg-blue-950/60 border-blue-800/50 text-blue-300" 
                                            : "bg-[#1c1c1c] border-[#2c2c2c] text-neutral-300 hover:text-white"
                                    }`}
                                >
                                    <LinkIcon className="w-3.5 h-3.5" />
                                    <span>
                                        {getLinkedHotelsCount('collection', i) > 0 
                                            ? `Linked (${getLinkedHotelsCount('collection', i)})` 
                                            : "Link Hotels"}
                                    </span>
                                </button>
                            </div>

                            <button onClick={() => handleRemoveCollection(i)} className="text-red-400 p-2 hover:bg-[#201010] rounded-xl shrink-0 md:self-end md:mb-0.5 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Hotels Toggle List */}
            <section className="bg-[#0c0c0c] p-6 md:p-8 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 pb-4 border-b border-[#1f1f1f] flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-amber-400" /> Choose Trending Hotels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotels.map(hotel => {
                        const isSelected = selectedTrendingIds.includes(hotel.id);
                        return (
                            <div key={hotel.id} className="flex items-center justify-between p-4 bg-[#141414] border border-[#222222] rounded-xl hover:border-neutral-700 transition-colors">
                                <div>
                                    <p className="text-xs font-bold text-white line-clamp-1">{hotel.name}</p>
                                    <p className="text-[10px] text-neutral-400 font-semibold">{hotel.city}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleTrendingLocal(hotel.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                        isSelected 
                                        ? "bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm" 
                                        : "bg-[#202020] text-neutral-400 border border-[#303030] hover:text-white"
                                    }`}
                                >
                                    {isSelected ? "Selected" : "Add"}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSaveTrendingBulk}
                        disabled={savingTrending}
                        className={`px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
                            savingTrending 
                                ? "bg-amber-500 text-black cursor-wait" 
                                : savedTrending 
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                                    : "bg-white hover:bg-neutral-200 text-black"
                        }`}
                    >
                        {savingTrending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                                Updating...
                            </>
                        ) : savedTrending ? (
                            <>
                                <Check className="w-4 h-4 text-white" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Update Trending
                            </>
                        )}
                    </button>
                </div>
            </section>

            {/* Premium Link Hotels Modal */}
            {linkingTarget && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0c] w-full max-w-2xl rounded-2xl border border-[#262626] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between bg-[#111111]">
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Hotel className="w-4 h-4 text-emerald-400" /> Link Explicit Hotels
                                </h4>
                                <p className="text-xs text-neutral-400 font-semibold mt-1">
                                    Define exactly which hotels load for: <span className="text-emerald-400 font-bold">"{getLinkingTargetName()}"</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => { setLinkingTarget(null); setHotelSearch(""); }}
                                className="w-8 h-8 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Toolbar */}
                        <div className="p-4 border-b border-[#1f1f1f] bg-[#0c0c0c] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {/* Search bar */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input 
                                    type="text" 
                                    value={hotelSearch}
                                    onChange={(e) => setHotelSearch(e.target.value)}
                                    placeholder="Search by hotel name or city..."
                                    className="w-full bg-[#161616] border border-[#282828] text-white rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:border-neutral-400 outline-none"
                                />
                            </div>

                            {/* Batch operations */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleSelectAllHotels(modalFilteredIds)}
                                    className="px-3 py-2 bg-[#1c1c1c] hover:bg-[#262626] text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-[#303030]"
                                >
                                    Select All Filtered
                                </button>
                                <button 
                                    onClick={() => handleClearAllHotels(modalFilteredIds)}
                                    className="px-3 py-2 bg-red-950/50 hover:bg-red-950 text-red-300 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-red-900/50"
                                >
                                    Clear Filtered
                                </button>
                            </div>
                        </div>

                        {/* Modal Selection Counter Banner */}
                        <div className="px-6 py-2.5 bg-[#141414] text-[10px] font-bold text-neutral-300 border-b border-[#1f1f1f] flex items-center justify-between shrink-0">
                            <span>Selected: <strong className="text-white">{selectedIdsInModal.length}</strong> hotels in total</span>
                            {hotelSearch && (
                                <span className="text-neutral-500 font-semibold">
                                    Showing {modalFilteredHotels.length} of {hotels.length} hotels
                                </span>
                            )}
                        </div>

                        {/* Modal Hotel List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#080808] space-y-2.5">
                            {modalFilteredHotels.length > 0 ? (
                                modalFilteredHotels.map(hotel => {
                                    const isSelected = selectedIdsInModal.includes(hotel.id);
                                    return (
                                        <div 
                                            key={hotel.id}
                                            onClick={() => handleToggleHotelLink(hotel.id)}
                                            className={`p-3.5 bg-[#121212] border rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all select-none hover:border-neutral-600 ${
                                                isSelected 
                                                    ? "border-emerald-500/80 bg-[#16201a]" 
                                                    : "border-[#222222]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                {/* Checkbox circle */}
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                    isSelected 
                                                        ? "bg-emerald-500 border-emerald-500 text-black" 
                                                        : "border-[#404040] bg-[#1a1a1a]"
                                                }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>

                                                {/* Hotel thumbnail */}
                                                <div className="w-11 h-11 rounded-lg bg-[#202020] overflow-hidden shrink-0 border border-[#2c2c2c] relative">
                                                    {hotel.thumbnail ? (
                                                        <img 
                                                            src={hotel.thumbnail} 
                                                            alt={hotel.name}
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                                            <Hotel className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Hotel details */}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-white leading-snug truncate">{hotel.name}</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{hotel.city}, India</p>
                                                </div>
                                            </div>

                                            {/* Indicators */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {hotel.isFeatured && (
                                                    <span className="bg-amber-950/80 text-amber-300 text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-800/60">
                                                        Featured
                                                    </span>
                                                )}
                                                <span className="text-neutral-400 text-[10px] font-bold">
                                                    ★ {hotel.starRating || 5}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-[#181818] rounded-full flex items-center justify-center text-neutral-500 mb-3">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-neutral-300">No hotels match your search</p>
                                    <p className="text-[10px] text-neutral-500 font-medium mt-1 max-w-xs">
                                        Try adjusting your search query or clear the filter to view all hotels.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#1f1f1f] bg-[#111111] flex items-center justify-end shrink-0">
                            <button 
                                onClick={() => { setLinkingTarget(null); setHotelSearch(""); }}
                                className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Done Mapping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
