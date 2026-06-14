import { useState, useRef, useEffect } from "react";
import { 
    Sparkles, MessageSquare, Send, Hotel, Info, ArrowUpRight, 
    Plus, X, Trash2, CheckCircle2, ChevronDown, RefreshCw, 
    Edit, AlertCircle, Maximize2, Users, Bed, HelpCircle 
} from "lucide-react";
import { cn, safeParse } from "@/lib/utils";
import { adminApi, hotelApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAICopilotProps {
    hotels: any[];
}

interface ChatMessage {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
    suggestedRooms?: any[];
    status?: "pending" | "saving" | "saved" | "error";
    searchQueries?: string[];
    searchSources?: { title: string; url: string }[];
}

export default function AdminAICopilot({ hotels }: AdminAICopilotProps) {
    const [selectedHotelId, setSelectedHotelId] = useState<number | "">("");
    const [inputValue, setInputValue] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [existingRooms, setExistingRooms] = useState<any[]>([]);
    const [loadingRoomsPercent, setLoadingRoomsPercent] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        messageId: string;
        roomList: any[];
        existingRoomsCount: number;
        existingRoomIds: number[];
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeHotel = hotels.find(h => h.id === selectedHotelId);

    // Fetch existing rooms whenever selected hotel changes
    useEffect(() => {
        let progressInterval: any = null;
        if (selectedHotelId) {
            setLoadingRoomsPercent(0);
            let progress = 0;
            progressInterval = setInterval(() => {
                progress += Math.floor(Math.random() * 10) + 5;
                if (progress >= 95) {
                    progress = 95;
                    if (progressInterval) clearInterval(progressInterval);
                }
                setLoadingRoomsPercent(progress);
            }, 100);

            hotelApi.getRooms(selectedHotelId.toString()).then(res => {
                if (progressInterval) clearInterval(progressInterval);
                setLoadingRoomsPercent(100);
                setTimeout(() => {
                    setLoadingRoomsPercent(null);
                }, 300);

                if (res.success && Array.isArray(res.data)) {
                    setExistingRooms(res.data);
                } else {
                    setExistingRooms([]);
                }
            }).catch(err => {
                if (progressInterval) clearInterval(progressInterval);
                setLoadingRoomsPercent(null);
                console.error("Failed to fetch existing rooms", err);
                setExistingRooms([]);
            });
        } else {
            setExistingRooms([]);
            setLoadingRoomsPercent(null);
        }

        return () => {
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [selectedHotelId]);

    // Initial Welcome Message
    useEffect(() => {
        setMessages([
            {
                id: "welcome",
                sender: "ai",
                text: "Hello! I am your AI Room Copilot. Select a hotel above, and I can help you instantly generate, extract, or scrape room categories, prices, bed configurations, and amenities. You can copy-paste hotel details from any website or provide a URL directly!",
                timestamp: new Date()
            }
        ]);
    }, []);

    // Auto Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textPrompt = inputValue, targetUrl = urlInput) => {
        if (!selectedHotelId) {
            alert("Please select a target hotel from the dropdown first.");
            return;
        }

        const promptText = textPrompt.trim();
        const scrapingUrl = targetUrl.trim();

        if (!promptText && !scrapingUrl) return;

        // Collect chat history BEFORE adding the new message
        const chatHistory = messages
            .filter(m => m.id !== "welcome")
            .map(m => ({
                role: m.sender === "ai" ? "model" : "user",
                text: m.text
            }));

        // Reset inputs
        setInputValue("");
        setUrlInput("");

        const userMessageId = `user-${Date.now()}`;
        const userMsgText = [
            promptText ? `Instructions: ${promptText}` : "",
            scrapingUrl ? `URL: ${scrapingUrl}` : ""
        ].filter(Boolean).join("\n");

        // 1. Add User Message
        setMessages(prev => [
            ...prev,
            {
                id: userMessageId,
                sender: "user",
                text: userMsgText,
                timestamp: new Date()
            }
        ]);

        // 2. Add AI Loading Placeholder
        const aiMessageId = `ai-${Date.now()}`;
        setMessages(prev => [
            ...prev,
            {
                id: aiMessageId,
                sender: "ai",
                text: "Thinking...",
                timestamp: new Date()
            }
        ]);

        setLoading(true);

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 120000);

        try {
            const res = await adminApi.suggestRooms({
                hotelId: Number(selectedHotelId),
                prompt: promptText || undefined,
                url: scrapingUrl || undefined,
                history: chatHistory,
                existingRooms: existingRooms
            }, {
                signal: abortController.signal
            });

            if (res.success) {
                // Update placeholder with parsed data
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === aiMessageId 
                            ? {
                                ...msg,
                                text: res.reply || `Successfully processed request.`,
                                suggestedRooms: Array.isArray(res.data) && res.data.length > 0 ? res.data : undefined,
                                status: Array.isArray(res.data) && res.data.length > 0 ? "pending" : undefined,
                                searchQueries: Array.isArray(res.searchQueries) ? res.searchQueries : undefined,
                                searchSources: Array.isArray(res.searchSources) ? res.searchSources : undefined
                              }
                            : msg
                    )
                );
            } else {
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === aiMessageId 
                            ? {
                                ...msg,
                                text: res.message || "Failed to process request. Please try again."
                              }
                            : msg
                    )
                );
            }
        } catch (err: any) {
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === aiMessageId 
                        ? {
                            ...msg,
                            text: `Error: ${err.message || "Request failed"}`
                          }
                        : msg
                )
            );
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    // Handler to modify fields of suggested rooms inside the chat card
    const handleFieldChange = (messageId: string, roomIndex: number, field: string, value: any) => {
        setMessages(prev => 
            prev.map(msg => {
                if (msg.id !== messageId || !msg.suggestedRooms) return msg;
                const updatedRooms = [...msg.suggestedRooms];
                updatedRooms[roomIndex] = {
                    ...updatedRooms[roomIndex],
                    [field]: value
                };
                return { ...msg, suggestedRooms: updatedRooms };
            })
        );
    };

    // Handler to remove an amenity from a specific room category
    const handleRemoveAmenity = (messageId: string, roomIndex: number, amenityIndex: number) => {
        setMessages(prev => 
            prev.map(msg => {
                if (msg.id !== messageId || !msg.suggestedRooms) return msg;
                const updatedRooms = [...msg.suggestedRooms];
                const updatedAmenities = [...updatedRooms[roomIndex].amenities];
                updatedAmenities.splice(amenityIndex, 1);
                updatedRooms[roomIndex] = {
                    ...updatedRooms[roomIndex],
                    amenities: updatedAmenities
                };
                return { ...msg, suggestedRooms: updatedRooms };
            })
        );
    };

    // Handler to add a custom amenity to a specific room category
    const handleAddAmenity = (messageId: string, roomIndex: number, amenityInput: string) => {
        const value = amenityInput.trim();
        if (!value) return;

        setMessages(prev => 
            prev.map(msg => {
                if (msg.id !== messageId || !msg.suggestedRooms) return msg;
                const updatedRooms = [...msg.suggestedRooms];
                const updatedAmenities = [...(updatedRooms[roomIndex].amenities || [])];
                if (!updatedAmenities.includes(value)) {
                    updatedAmenities.push(value);
                }
                updatedRooms[roomIndex] = {
                    ...updatedRooms[roomIndex],
                    amenities: updatedAmenities
                };
                return { ...msg, suggestedRooms: updatedRooms };
            })
        );
    };

    // Bulk save handler with conflict check
    const handleSaveRooms = async (messageId: string, roomList: any[]) => {
        if (!selectedHotelId) return;

        // Check if there are already rooms configured for this hotel
        if (existingRooms.length > 0) {
            setConfirmModal({
                show: true,
                messageId,
                roomList,
                existingRoomsCount: existingRooms.length,
                existingRoomIds: existingRooms.map((r: any) => r.id)
            });
            return;
        }

        // Standard save if no conflict
        await executeSave(messageId, roomList, []);
    };

    // Actual bulk insert/update operation
    const executeSave = async (messageId: string, roomList: any[], deleteIds: number[]) => {
        if (!selectedHotelId) return;

        setMessages(prev => 
            prev.map(msg => msg.id === messageId ? { ...msg, status: "saving" } : msg)
        );

        try {
            // Prepare schema records for bulk inserting
            const formattedRooms = roomList.map(r => {
                const rawVariants = Array.isArray(r.variants) ? r.variants : [];
                const parsedVariants = rawVariants.map((v: any, index: number) => ({
                    id: index + 1,
                    mealPlan: v.mealPlan || "Room Only",
                    price: Number(v.price) || Number(r.pricePerNight),
                    policy: v.policy || "Free cancellation till 24h"
                }));

                return {
                    id: r.id || undefined, // Preserve ID if editing
                    name: r.name,
                    description: r.description || "",
                    pricePerNight: Number(r.pricePerNight),
                    maxOccupancy: Number(r.maxOccupancy) || 2,
                    bedConfiguration: r.bedConfiguration || "1 King Bed",
                    sizeM2: Number(r.sizeM2) || 18,
                    amenities: r.amenities, 
                    images: r.images || "[]",
                    highlights: r.highlights || "[]",
                    trustPoints: r.trustPoints || "[]",
                    status: r.status || "active",
                    totalInventory: Number(r.totalInventory) || 5,
                    isHourlyEnabled: r.isHourlyEnabled || false,
                    hourlyRates: typeof r.hourlyRates === 'string' ? r.hourlyRates : JSON.stringify(r.hourlyRates || {}),
                    variants: JSON.stringify(parsedVariants)
                };
            });

            // Call bulk update API
            const res = await hotelApi.bulkUpdateRooms(Number(selectedHotelId), formattedRooms, deleteIds);

            if (res.success) {
                setMessages(prev => 
                    prev.map(msg => msg.id === messageId ? { ...msg, status: "saved" } : msg)
                );
                alert("Rooms setup updated successfully!");
                // Refresh existing rooms
                const freshRooms = await hotelApi.getRooms(selectedHotelId.toString());
                if (freshRooms.success && Array.isArray(freshRooms.data)) {
                    setExistingRooms(freshRooms.data);
                }
            } else {
                alert(`Error: ${res.message || "Failed to save rooms to the database"}`);
                setMessages(prev => 
                    prev.map(msg => msg.id === messageId ? { ...msg, status: "error" } : msg)
                );
            }

        } catch (err: any) {
            alert(err.message || "Network request failed");
            setMessages(prev => 
                prev.map(msg => msg.id === messageId ? { ...msg, status: "error" } : msg)
            );
        }
    };

    const SUGGESTIONS = [
        { label: "Standard Setup", prompt: "Recommend standard budget rooms setup: 1 Single Room, 1 Double Room, and 1 Suite Room with average standard pricing." },
        { label: "Holiday Resort Rooms", prompt: "Generate luxurious resort categories including Cottage Room, Villa with private pool, and Royal Suite." },
        { label: "Business Hotel Setup", prompt: "Recommend compact smart categories for business travelers: Executive Twin Room, Deluxe Single, and Premium Club Room." }
    ];

    return (
        <div className="w-full flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header / Select Hotel Selector */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-brand-600 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">AI Room Onboarding Copilot</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Extract and draft rooms setup using Generative AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {loadingRoomsPercent !== null ? `Loading Rooms (${loadingRoomsPercent}%):` : "Target Hotel:"}
                    </span>
                    <div className="relative">
                        <select
                            value={selectedHotelId}
                            onChange={(e) => setSelectedHotelId(e.target.value === "" ? "" : Number(e.target.value))}
                            disabled={loadingRoomsPercent !== null}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer w-64 disabled:opacity-80"
                        >
                            {loadingRoomsPercent !== null ? (
                                <option value={selectedHotelId}>
                                    {activeHotel ? `${activeHotel.name} (Loading ${loadingRoomsPercent}%)` : `Loading ${loadingRoomsPercent}%`}
                                </option>
                            ) : (
                                <>
                                    <option value="">-- Select Target Hotel --</option>
                                    {hotels.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.name} ({h.city})
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.map((msg) => {
                    const isAI = msg.sender === "ai";
                    return (
                        <div key={msg.id} className={cn("flex flex-col max-w-[85%] space-y-2", isAI ? "self-start text-left" : "self-end ml-auto text-right")}>
                            {/* Search Queries and Sources display */}
                            {isAI && msg.searchQueries && msg.searchQueries.length > 0 && (
                                <div className="flex flex-col gap-1.5 px-3 py-2 bg-slate-200/50 border border-slate-300/40 rounded-xl max-w-lg mb-1 self-start shadow-xs text-[10px]">
                                    <div className="flex items-center gap-1.5 text-slate-500 font-black text-[9px] uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3 text-brand-600 animate-pulse" />
                                        <span>AI Search Queries:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {msg.searchQueries.map((q, idx) => (
                                            <span key={idx} className="bg-white border border-slate-200/80 px-2 py-0.5 rounded-full text-[9px] text-slate-700 font-bold">
                                                "{q}"
                                            </span>
                                        ))}
                                    </div>
                                    {msg.searchSources && msg.searchSources.length > 0 && (
                                        <div className="mt-1 flex flex-col gap-1 border-t border-slate-200/60 pt-1">
                                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Sources consulted:</span>
                                            <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[9px] text-brand-600 font-bold lowercase">
                                                {msg.searchSources.map((src, idx) => (
                                                    <a 
                                                        key={idx} 
                                                        href={src.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center gap-0.5 hover:text-brand-800 hover:underline transition-colors"
                                                    >
                                                        <span>{src.title || new URL(src.url).hostname}</span>
                                                        <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={cn(
                                "p-5 rounded-2xl shadow-sm text-xs leading-relaxed font-bold border",
                                isAI 
                                    ? "bg-white text-slate-900 border-slate-200/60 rounded-tl-sm" 
                                    : "bg-slate-900 text-white border-slate-800 rounded-tr-sm"
                            )}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>

                            {/* Timestamp */}
                            <span className={cn("text-[9px] text-slate-400 font-bold uppercase tracking-wider px-1", isAI ? "self-start" : "self-end")}>
                                {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>

                            {/* Render suggestion cards inside AI messages if rooms exist */}
                            {isAI && msg.suggestedRooms && msg.suggestedRooms.length > 0 && (
                                <div className="mt-4 space-y-6 max-w-4xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {msg.suggestedRooms.map((room, rIdx) => (
                                            <div key={rIdx} className="bg-white border border-slate-200 shadow-sm p-5 space-y-4 rounded-xl relative group">
                                                {/* Card Header */}
                                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                                    <span className="text-[10px] font-black uppercase text-brand-600 tracking-widest">Category #{rIdx + 1}</span>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold">{room.sizeM2 || 18} m²</span>
                                                    </div>
                                                </div>

                                                {/* Editable Input Fields */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Room Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={room.name}
                                                            onChange={(e) => handleFieldChange(msg.id, rIdx, "name", e.target.value)}
                                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Price (₹/Night)</label>
                                                            <input 
                                                                type="number" 
                                                                value={room.pricePerNight}
                                                                onChange={(e) => handleFieldChange(msg.id, rIdx, "pricePerNight", Number(e.target.value))}
                                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Max Guests</label>
                                                            <input 
                                                                type="number" 
                                                                value={room.maxOccupancy}
                                                                onChange={(e) => handleFieldChange(msg.id, rIdx, "maxOccupancy", Number(e.target.value))}
                                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Beds Config</label>
                                                            <input 
                                                                type="text" 
                                                                value={room.bedConfiguration || ""}
                                                                onChange={(e) => handleFieldChange(msg.id, rIdx, "bedConfiguration", e.target.value)}
                                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Inventory</label>
                                                            <input 
                                                                type="number" 
                                                                value={room.totalInventory || 5}
                                                                onChange={(e) => handleFieldChange(msg.id, rIdx, "totalInventory", Number(e.target.value))}
                                                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Description</label>
                                                        <textarea 
                                                            rows={2}
                                                            value={room.description || ""}
                                                            onChange={(e) => handleFieldChange(msg.id, rIdx, "description", e.target.value)}
                                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Amenities Tag List */}
                                                <div>
                                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Parsed Amenities</label>
                                                    <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1 bg-slate-50 border border-slate-100 rounded-sm">
                                                        {room.amenities.map((amenity: string, aIdx: number) => (
                                                            <span key={aIdx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-black rounded-full shadow-sm">
                                                                {amenity}
                                                                <button 
                                                                    type="button" 
                                                                    disabled={msg.status === "saved" || msg.status === "saving"}
                                                                    onClick={() => handleRemoveAmenity(msg.id, rIdx, aIdx)}
                                                                    className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors shrink-0"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        {(!room.amenities || room.amenities.length === 0) && (
                                                            <span className="text-[9px] text-slate-400 font-bold italic px-1">No amenities configured.</span>
                                                        )}
                                                    </div>

                                                    {/* Quick add custom amenity */}
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Add amenity (e.g. Balcony)..." 
                                                            disabled={msg.status === "saved" || msg.status === "saving"}
                                                            id={`add-amenity-${msg.id}-${rIdx}`}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const inputEl = e.currentTarget;
                                                                    handleAddAmenity(msg.id, rIdx, inputEl.value);
                                                                    inputEl.value = "";
                                                                }
                                                            }}
                                                            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-sm text-[10px] font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                                                        />
                                                        <button 
                                                            type="button"
                                                            disabled={msg.status === "saved" || msg.status === "saving"}
                                                            onClick={() => {
                                                                const inputEl = document.getElementById(`add-amenity-${msg.id}-${rIdx}`) as HTMLInputElement;
                                                                if (inputEl) {
                                                                    handleAddAmenity(msg.id, rIdx, inputEl.value);
                                                                    inputEl.value = "";
                                                                }
                                                            }}
                                                            className="px-3 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-sm active:scale-95 transition-transform"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Bar for the whole set */}
                                    <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 max-w-4xl shadow-sm">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Info className="w-4 h-4 text-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Configure all fields, then save directly into active hotel database records</span>
                                        </div>
                                        <div>
                                            {msg.status === "pending" && (
                                                <button
                                                    onClick={() => handleSaveRooms(msg.id, msg.suggestedRooms || [])}
                                                    className="px-6 py-2.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-brand-700 shadow-md active:scale-95 transition-all"
                                                >
                                                    Approve & Add to Hotel
                                                </button>
                                            )}
                                            {msg.status === "saving" && (
                                                <button
                                                    disabled
                                                    className="px-6 py-2.5 bg-brand-600/50 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center gap-2"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    Saving Rooms...
                                                </button>
                                            )}
                                            {msg.status === "saved" && (
                                                <div className="px-6 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Rooms Added Successfully
                                                </div>
                                            )}
                                            {msg.status === "error" && (
                                                <button
                                                    onClick={() => handleSaveRooms(msg.id, msg.suggestedRooms || [])}
                                                    className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-700 flex items-center gap-2"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    Retry Save
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Prompt Suggestions */}
            {messages.length === 1 && selectedHotelId && (
                <div className="px-6 py-3 bg-white border-t border-slate-100 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quick Prompts:</span>
                    {SUGGESTIONS.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setInputValue(item.prompt);
                            }}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase rounded-full tracking-wider hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 active:scale-95 transition-all shadow-sm"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Footer Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input 
                            type="text"
                            placeholder="Type instructions for Gemini (e.g. Recommend rooms with specific prices)..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={loading || !selectedHotelId}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !selectedHotelId || (!inputValue.trim() && !urlInput.trim())}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-600 hover:text-brand-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Optional OTA Link:</span>
                        <input 
                            type="url"
                            placeholder="https://www.booking.com/hotel/..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={loading || !selectedHotelId}
                            className="flex-1 sm:w-80 px-3 py-1.5 border border-slate-200 rounded-sm text-[10px] font-bold text-slate-900 focus:outline-none focus:border-slate-400 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini 2.5 Flash</span>
                </div>
            </div>
            {/* Conflict Resolution Modal */}
            <AnimatePresence>
                {confirmModal && confirmModal.show && (
                    <>
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200]" 
                            onClick={() => setConfirmModal(null)}
                        />
                        {/* Dialog */}
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 shadow-2xl p-8 w-[95%] max-w-lg z-[210] rounded-xl overflow-hidden text-left">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-6 h-6 text-amber-600 animate-pulse" />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">Room Onboarding Conflict</h4>
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                        This property already has <span className="text-slate-950 font-black">{confirmModal.existingRoomsCount}</span> room categories configured in the database. 
                                        Please choose how you would like to proceed with the newly drafted rooms:
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {/* Option 1: Clean Install / Replace */}
                                <button
                                    onClick={async () => {
                                        const { messageId, roomList, existingRoomIds } = confirmModal;
                                        setConfirmModal(null);
                                        await executeSave(messageId, roomList, existingRoomIds);
                                    }}
                                    className="w-full p-4 border border-red-200 bg-red-50/20 hover:bg-red-50 text-left rounded-xl transition-all group flex items-start justify-between cursor-pointer"
                                >
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase text-red-700 tracking-wider">Option A: Overwrite & Clean Install</h5>
                                        <p className="text-[9px] text-red-500 font-bold mt-1 leading-normal">
                                            Delete all {confirmModal.existingRoomsCount} current room categories and replace them with this newly drafted list.
                                        </p>
                                    </div>
                                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors self-center shrink-0 ml-4" />
                                </button>

                                {/* Option 2: Keep & Append */}
                                <button
                                    onClick={async () => {
                                        const { messageId, roomList } = confirmModal;
                                        setConfirmModal(null);
                                        await executeSave(messageId, roomList, []);
                                    }}
                                    className="w-full p-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left rounded-xl transition-all group flex items-start justify-between cursor-pointer"
                                >
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">Option B: Keep Current & Append</h5>
                                        <p className="text-[9px] text-slate-500 font-bold mt-1 leading-normal">
                                            Keep all existing rooms intact and add these new drafted categories alongside them.
                                        </p>
                                    </div>
                                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors self-center shrink-0 ml-4" />
                                </button>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase rounded-sm transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
