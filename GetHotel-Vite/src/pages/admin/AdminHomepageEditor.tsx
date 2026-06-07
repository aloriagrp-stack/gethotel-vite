import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Save, LayoutTemplate, Link as LinkIcon, Image as ImageIcon, Plus, Trash2, Search, X, Check, Hotel, Layers } from "lucide-react";
import { adminApi, homepageApi } from "@/lib/api";

const DEFAULT_DESTINATIONS = [
    { name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop", properties: "1,240+ Hotels", linkedHotelIds: [] },
    { name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop", properties: "850+ Hotels", linkedHotelIds: [] },
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

export default function AdminHomepageEditor() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Config states
    const [heroTitle, setHeroTitle] = useState("Where would you");
    const [heroHighlight, setHeroHighlight] = useState("like to stay?");
    const [destinations, setDestinations] = useState<any[]>(DEFAULT_DESTINATIONS);
    const [collections, setCollections] = useState<any[]>(DEFAULT_COLLECTIONS);
    const [hotels, setHotels] = useState<any[]>([]);

    // Linking modal states
    const [linkingTarget, setLinkingTarget] = useState<{ type: 'destination' | 'collection'; index: number } | null>(null);
    const [hotelSearch, setHotelSearch] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch existing config
                const configRes = await homepageApi.getConfig();
                if (configRes.success && configRes.data) {
                    if (configRes.data.heroTitle) setHeroTitle(configRes.data.heroTitle);
                    if (configRes.data.heroHighlight) setHeroHighlight(configRes.data.heroHighlight);
                    if (configRes.data.destinations) {
                        // Ensure everyone has a linkedHotelIds array
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
                }

                // Fetch hotels for trending/featured toggles
                const hotelsRes = await adminApi.getAllHotels();
                if (hotelsRes.success) {
                    setHotels(hotelsRes.data);
                }
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
            const res = await adminApi.updateHomepageConfig({
                heroTitle,
                heroHighlight,
                destinations,
                collections
            });
            if (res.success) {
                alert("Homepage sections updated successfully!");
            }
        } catch (err: any) {
            alert(err.message || "Failed to update configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleTrending = async (id: number) => {
        try {
            const res = await adminApi.toggleTrending(id.toString());
            if (res.success) {
                setHotels(hotels.map(h => h.id === id ? { ...h, isTrending: !h.isTrending } : h));
            }
        } catch (err: any) {
            alert("Failed to toggle trending: " + err.message);
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
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
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
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header / Hero Save Config */}
            <section className="bg-white p-8 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-brand-600" /> Hero Section text
                    </h3>
                    <button 
                        onClick={handleSaveConfig}
                        disabled={saving}
                        className="bg-brand-600 text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Config
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Title</label>
                        <input 
                            type="text" 
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highlight Text (Blue & Italic)</label>
                        <input 
                            type="text" 
                            value={heroHighlight}
                            onChange={(e) => setHeroHighlight(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Trending Destinations Editor */}
            <section className="bg-white p-8 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-600" /> Trending Destinations
                    </h3>
                    <button onClick={handleAddDestination} className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Destination
                    </button>
                </div>
                
                <div className="space-y-4">
                    {destinations.map((dest, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 p-4 rounded-sm border border-slate-200 relative group">
                            <div className="w-full md:w-1/5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">City Name</label>
                                <input 
                                    type="text" 
                                    value={dest.name}
                                    onChange={(e) => handleUpdateDestination(i, 'name', e.target.value)}
                                    placeholder="e.g. Goa"
                                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                            <div className="w-full md:w-2/5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Image URL</label>
                                <input 
                                    type="text" 
                                    value={dest.image}
                                    onChange={(e) => handleUpdateDestination(i, 'image', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                            <div className="w-full md:w-1/5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subtitle</label>
                                <input 
                                    type="text" 
                                    value={dest.properties}
                                    onChange={(e) => handleUpdateDestination(i, 'properties', e.target.value)}
                                    placeholder="e.g. 1,240+ Hotels"
                                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                            
                            {/* Link Hotels Control */}
                            <div className="w-full md:w-auto shrink-0 flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Granular Control</span>
                                <button 
                                    onClick={() => setLinkingTarget({ type: 'destination', index: i })}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        getLinkedHotelsCount('destination', i) > 0 
                                            ? "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100" 
                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
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

                            <button onClick={() => handleRemoveDestination(i)} className="text-red-500 font-bold text-xs p-2 hover:bg-red-50 rounded-sm shrink-0 md:self-end md:mb-0.5">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Collections Editor */}
            <section className="bg-white p-8 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-600" /> Featured Collections
                    </h3>
                    <button onClick={handleAddCollection} className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Collection
                    </button>
                </div>
                
                <div className="space-y-4">
                    {collections.map((coll, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 p-4 rounded-sm border border-slate-200 relative group animate-in fade-in-50 duration-300">
                            <div className="w-full md:w-1/5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Collection Title</label>
                                <input 
                                    type="text" 
                                    value={coll.title}
                                    onChange={(e) => handleUpdateCollection(i, 'title', e.target.value)}
                                    placeholder="e.g. Luxury Stays"
                                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                            <div className="w-full md:w-1/4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subtitle</label>
                                <input 
                                    type="text" 
                                    value={coll.subtitle}
                                    onChange={(e) => handleUpdateCollection(i, 'subtitle', e.target.value)}
                                    placeholder="e.g. Premium stays"
                                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                            <div className="w-full md:w-1/4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Image URL</label>
                                <input 
                                    type="text" 
                                    value={coll.image}
                                    onChange={(e) => handleUpdateCollection(i, 'image', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                            <div className="w-full md:w-1/6">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Label Tag</label>
                                <input 
                                    type="text" 
                                    value={coll.label}
                                    onChange={(e) => handleUpdateCollection(i, 'label', e.target.value)}
                                    placeholder="e.g. Premium"
                                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                            
                            {/* Link Hotels Control */}
                            <div className="w-full md:w-auto shrink-0 flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Granular Control</span>
                                <button 
                                    onClick={() => setLinkingTarget({ type: 'collection', index: i })}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        getLinkedHotelsCount('collection', i) > 0 
                                            ? "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100" 
                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
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

                            <button onClick={() => handleRemoveCollection(i)} className="text-red-500 font-bold text-xs p-2 hover:bg-red-50 rounded-sm shrink-0 md:self-end md:mb-0.5">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Hotels Toggle List */}
            <section className="bg-white p-8 rounded-sm border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-amber-600" /> Choose Trending Hotels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotels.map(hotel => (
                        <div key={hotel.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm">
                            <div>
                                <p className="text-xs font-black text-slate-900 line-clamp-1">{hotel.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold">{hotel.city}</p>
                            </div>
                            <button
                                onClick={() => handleToggleTrending(hotel.id)}
                                className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-colors ${
                                    hotel.isTrending 
                                    ? "bg-amber-100 text-amber-700 border border-amber-200" 
                                    : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                {hotel.isTrending ? "Trending" : "Add"}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Premium Link Hotels Modal */}
            {linkingTarget && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Hotel className="w-4 h-4 text-brand-600" /> Link Explicit Hotels
                                </h4>
                                <p className="text-xs text-slate-500 font-bold mt-1">
                                    Define exactly which hotels load for: <span className="text-brand-600 font-extrabold">"{getLinkingTargetName()}"</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => { setLinkingTarget(null); setHotelSearch(""); }}
                                className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-90"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Toolbar */}
                        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {/* Search bar */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={hotelSearch}
                                    onChange={(e) => setHotelSearch(e.target.value)}
                                    placeholder="Search by hotel name or city..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>

                            {/* Batch operations */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleSelectAllHotels(modalFilteredIds)}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors active:scale-95"
                                >
                                    Select All Filtered
                                </button>
                                <button 
                                    onClick={() => handleClearAllHotels(modalFilteredIds)}
                                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors active:scale-95"
                                >
                                    Clear Filtered
                                </button>
                            </div>
                        </div>

                        {/* Modal Selection Counter Banner */}
                        <div className="px-6 py-2.5 bg-brand-50/50 text-[10px] font-bold text-brand-700 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <span>Selected: {selectedIdsInModal.length} hotels in total</span>
                            {hotelSearch && (
                                <span className="text-slate-500 font-semibold">
                                    Showing {modalFilteredHotels.length} of {hotels.length} hotels
                                </span>
                            )}
                        </div>

                        {/* Modal Hotel List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-2.5">
                            {modalFilteredHotels.length > 0 ? (
                                modalFilteredHotels.map(hotel => {
                                    const isSelected = selectedIdsInModal.includes(hotel.id);
                                    return (
                                        <div 
                                            key={hotel.id}
                                            onClick={() => handleToggleHotelLink(hotel.id)}
                                            className={`p-3.5 bg-white border rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all active:scale-[0.99] select-none hover:shadow-md ${
                                                isSelected 
                                                    ? "border-brand-500 shadow-sm ring-1 ring-brand-500/20" 
                                                    : "border-slate-200 hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                {/* Checkbox circle */}
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                    isSelected 
                                                        ? "bg-brand-600 border-brand-600 text-white" 
                                                        : "border-slate-300 bg-slate-50 group-hover:border-slate-400"
                                                }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>

                                                {/* Hotel thumbnail */}
                                                <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100 relative">
                                                    {hotel.thumbnail ? (
                                                        <img 
                                                            src={hotel.thumbnail} 
                                                            alt={hotel.name}
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Hotel className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Hotel details */}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-900 leading-snug truncate">{hotel.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{hotel.city}, India</p>
                                                </div>
                                            </div>

                                            {/* Indicators (like Featured / Stars) */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {hotel.isFeatured && (
                                                    <span className="bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                                                        Featured
                                                    </span>
                                                )}
                                                <span className="text-slate-400 text-[10px] font-black">
                                                    ★ {hotel.starRating || 5}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-black text-slate-800">No hotels match your search</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-xs">
                                        Try adjusting your search query or clear the filter to view all hotels.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
                            <button 
                                onClick={() => { setLinkingTarget(null); setHotelSearch(""); }}
                                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand-600/10 active:scale-95"
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
