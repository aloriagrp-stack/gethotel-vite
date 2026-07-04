import { useState, useRef, useEffect } from "react";
import { 
    Sparkles, MessageSquare, Send, Hotel, Info, ArrowUpRight, 
    Plus, X, Trash2, CheckCircle2, ChevronDown, RefreshCw, 
    Edit, AlertCircle, Maximize2, Users, Bed, HelpCircle, Paperclip,
    Star, Globe, Link2
} from "lucide-react";
import { cn, safeParse } from "@/lib/utils";
import { adminApi, hotelApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import AdminReviewImporter from "./AdminReviewImporter";

interface AdminAICopilotProps {
    hotels: any[];
    loadingHotels?: boolean;
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
    clearAllRooms?: boolean;
    imageProgress?: {
        roomIndex: number;
        current: number;
        total: number;
        status: "idle" | "converting" | "completed" | "error";
        errorMsg?: string;
    };
}

const getResolvedImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const backendBase = import.meta.env.MODE === 'production' 
        ? 'https://gethotelstays.com' 
        : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function AdminAICopilot({ hotels, loadingHotels = false }: AdminAICopilotProps) {
    const [selectedHotelId, setSelectedHotelId] = useState<number | "">("");
    const [inputValue, setInputValue] = useState("");
    const [urls, setUrls] = useState<string[]>([""]);
    const [attachedImages, setAttachedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [existingRooms, setExistingRooms] = useState<any[]>([]);
    const [loadingRoomsPercent, setLoadingRoomsPercent] = useState<number | null>(null);
    
    // AI Review Importer states
    const [activeSubTab, setActiveSubTab] = useState<"rooms" | "reviews">("rooms");
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        messageId: string;
        roomList: any[];
        existingRoomsCount: number;
        existingRoomIds: number[];
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setAttachedImages(prev => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const activeHotel = hotels.find(h => h.id === selectedHotelId);

    // Fetch existing rooms whenever selected hotel changes
    useEffect(() => {
        let progressInterval: any = null;
        if (selectedHotelId) {
            setLoadingRoomsPercent(0);
            let progress = 0;
            progressInterval = setInterval(() => {
                progress += Math.floor(Math.random() * 20) + 15;
                if (progress >= 95) {
                    progress = 95;
                    if (progressInterval) clearInterval(progressInterval);
                }
                setLoadingRoomsPercent(progress);
            }, 30);

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

    const handleSend = async (textPrompt = inputValue, targetUrls = urls) => {
        if (!selectedHotelId) {
            alert("Please select a target hotel from the dropdown first.");
            return;
        }

        const promptText = textPrompt.trim();
        const activeUrls = targetUrls.map(u => u.trim()).filter(u => u.startsWith('http'));

        if (!promptText && activeUrls.length === 0 && attachedImages.length === 0) return;

        // Collect chat history BEFORE adding the new message
        const chatHistory = messages
            .filter(m => m.id !== "welcome")
            .map(m => ({
                role: m.sender === "ai" ? "model" : "user",
                text: m.text
            }));

        // Reset inputs
        setInputValue("");
        setUrls([""]);
        const currentAttachedImages = [...attachedImages];
        setAttachedImages([]);

        const userMessageId = `user-${Date.now()}`;
        const userMsgParts = [promptText];
        if (activeUrls.length > 0) {
            userMsgParts.push(`URLs:\n${activeUrls.join("\n")}`);
        }
        if (currentAttachedImages.length > 0) {
            userMsgParts.push(`[Attached ${currentAttachedImages.length} Image(s)]`);
        }
        const userMsgText = userMsgParts.filter(Boolean).join("\n");

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

        const isReviewImport = promptText.toLowerCase().trim().startsWith("review import");
        // Select loading steps list based on whether we are scraping a URL or just chatting
        const steps = activeUrls.length > 0 
            ? [
                "Initializing OTA room crawler engine...",
                "Connecting to Booking.com translator proxy...",
                "Scraping room categories, details & images...",
                "Extracting detailed amenities & bed configurations...",
                "Parsing rate plans (EP, CP, MAP, AP) & pricing...",
                "Running Groq Llama-3.3 cognitive structure engine...",
                "Formatting structured response..."
              ]
            : isReviewImport
            ? [
                "Analyzing raw review data...",
                "Initializing Gemini review parser...",
                "Extracting reviewer names, ratings, and comments...",
                "Structuring individual cleanliness, comfort & staff scores...",
                "Creating virtual guest accounts in database...",
                "Recalculating average guest ratings...",
                "Formatting import report..."
              ]
            : [
                "Analyzing instructions & chat history context...",
                "Checking database for existing room configurations...",
                "Running Groq Llama-3.3 reasoning engine...",
                "Formatting structured room recommendations...",
                "Finalizing response..."
              ];

        let stepIndex = 0;
        const buildStepText = (index: number) => {
            let lines = [];
            for (let i = 0; i <= index; i++) {
                if (i < index) {
                    lines.push(`✓ ${steps[i]}`);
                } else {
                    lines.push(`⏳ ${steps[i]}`);
                }
            }
            return lines.join("\n");
        };

        // 2. Add AI Loading Placeholder
        const aiMessageId = `ai-${Date.now()}`;
        setMessages(prev => [
            ...prev,
            {
                id: aiMessageId,
                sender: "ai",
                text: buildStepText(0),
                timestamp: new Date()
            }
        ]);

        const stepInterval = setInterval(() => {
            stepIndex++;
            if (stepIndex < steps.length) {
                setMessages(prev => 
                    prev.map(msg => msg.id === aiMessageId ? { ...msg, text: buildStepText(stepIndex) } : msg)
                );
            } else {
                clearInterval(stepInterval);
            }
        }, 1200);

        setLoading(true);

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 120000);

        try {
            const res = await adminApi.suggestRooms({
                hotelId: Number(selectedHotelId),
                prompt: promptText || undefined,
                urls: activeUrls.length > 0 ? activeUrls : undefined,
                history: chatHistory,
                existingRooms: existingRooms,
                newAttachedImages: currentAttachedImages.length > 0 ? currentAttachedImages : undefined
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
                                status: (Array.isArray(res.data) && res.data.length > 0) || res.clearAllRooms ? "pending" : undefined,
                                searchQueries: Array.isArray(res.searchQueries) ? res.searchQueries : undefined,
                                searchSources: Array.isArray(res.searchSources) ? res.searchSources : undefined,
                                clearAllRooms: res.clearAllRooms || false
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
            clearInterval(stepInterval);
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

    // Real-time sequential download and WebP conversion queue manager
    const handleOptimizeImages = async (messageId: string) => {
        const msg = messages.find(m => m.id === messageId);
        if (!msg || !msg.suggestedRooms || msg.suggestedRooms.length === 0) return;

        const rooms = msg.suggestedRooms;
        
        // Start state
        setMessages(prev => 
            prev.map(m => m.id === messageId ? { 
                ...m, 
                imageProgress: { roomIndex: 0, current: 0, total: 0, status: "converting" } 
            } : m)
        );

        let updatedRooms = [...rooms];
        
        try {
            for (let rIdx = 0; rIdx < rooms.length; rIdx++) {
                const room = rooms[rIdx];
                const rawImages = Array.isArray(room.images) 
                    ? room.images 
                    : (typeof room.images === 'string' ? safeParse(room.images, []) : []);
                
                if (rawImages.length === 0) continue;

                // Update UI state for active room category conversion progress
                setMessages(prev => 
                    prev.map(m => m.id === messageId ? { 
                        ...m, 
                        imageProgress: { 
                            roomIndex: rIdx, 
                            current: 0, 
                            total: rawImages.length, 
                            status: "converting" 
                        } 
                    } : m)
                );

                const localWebPPaths: string[] = [];

                for (let imgIdx = 0; imgIdx < rawImages.length; imgIdx++) {
                    const imgUrl = rawImages[imgIdx];
                    
                    if ((imgUrl.includes('/uploads/') || imgUrl.startsWith('/uploads/')) && imgUrl.endsWith('.webp')) {
                        localWebPPaths.push(imgUrl);
                        continue;
                    }

                    // Call WebP converter endpoint
                    try {
                        const res = await adminApi.convertWebP({ imageUrl: imgUrl });
                        if (res.success && res.localPath) {
                            localWebPPaths.push(res.localPath);
                        } else {
                            localWebPPaths.push(imgUrl);
                        }
                    } catch (err) {
                        console.error("Failed to convert image:", imgUrl, err);
                        localWebPPaths.push(imgUrl);
                    }

                    // Increment progress counter and update image list incrementally!
                    const currentPaths = [
                        ...localWebPPaths,
                        ...rawImages.slice(imgIdx + 1)
                    ];
                    
                    updatedRooms[rIdx] = {
                        ...updatedRooms[rIdx],
                        images: currentPaths
                    };

                    setMessages(prev => 
                        prev.map(m => m.id === messageId ? { 
                            ...m, 
                            imageProgress: { 
                                ...m.imageProgress!, 
                                current: imgIdx + 1 
                            },
                            suggestedRooms: [...updatedRooms]
                        } : m)
                    );
                }
            }

            // Completed
            setMessages(prev => 
                prev.map(m => m.id === messageId ? { 
                    ...m, 
                    imageProgress: { roomIndex: rooms.length - 1, current: 1, total: 1, status: "completed" } 
                } : m)
            );

        } catch (err: any) {
            console.error("WebP converter queue failed:", err);
            setMessages(prev => 
                prev.map(m => m.id === messageId ? { 
                    ...m, 
                    imageProgress: { 
                        roomIndex: 0, 
                        current: 0, 
                        total: 0, 
                        status: "error", 
                        errorMsg: err.message || "Failed to convert images" 
                    } 
                } : m)
            );
        }
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
        { 
            label: "Setup using own data", 
            prompt: "Extract and draft room categories, prices, bed configurations, and amenities using this raw data:\n\n"
        },
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
                        {loadingHotels ? (
                            <span className="text-brand-600 animate-pulse">Loading Hotels...</span>
                        ) : loadingRoomsPercent !== null ? (
                            <span className="text-brand-600 animate-pulse">Loading Rooms ({loadingRoomsPercent}%)...</span>
                        ) : (
                            "Target Hotel:"
                        )}
                    </span>
                    <div className="relative w-64">
                        <select
                            value={selectedHotelId}
                            onChange={(e) => setSelectedHotelId(e.target.value === "" ? "" : Number(e.target.value))}
                            disabled={loadingRoomsPercent !== null || loadingHotels}
                            className="appearance-none w-full pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer disabled:opacity-90"
                        >
                            {loadingHotels ? (
                                <option value="">Loading hotels list...</option>
                            ) : loadingRoomsPercent !== null ? (
                                <option value={selectedHotelId}>
                                    {activeHotel ? activeHotel.name : "Loading..."}
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
                        
                        {/* Pinned progress bar under bottom border of dropdown */}
                        {(loadingRoomsPercent !== null || loadingHotels) && (
                            <div className="absolute bottom-[1px] left-[1px] right-[1px] h-[3px] bg-slate-100 overflow-hidden rounded-b-sm">
                                <div 
                                    className={cn(
                                        "h-full bg-brand-600 transition-all ease-out",
                                        loadingHotels ? "w-full animate-pulse duration-1000" : "duration-75"
                                    )} 
                                    style={loadingHotels ? undefined : { width: `${loadingRoomsPercent}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub Tabs Selector */}
            <div className="px-6 bg-white border-b border-slate-200 flex gap-6">
                <button
                    onClick={() => setActiveSubTab("rooms")}
                    className={cn(
                        "py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                        activeSubTab === "rooms"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                >
                    Rooms Setup (Chat)
                </button>
                <button
                    onClick={() => setActiveSubTab("reviews")}
                    className={cn(
                        "py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                        activeSubTab === "reviews"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                >
                    Import Reviews (AI)
                </button>
            </div>

            {activeSubTab === "rooms" ? (
                <>
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

                                                {/* Image Previews / Thumbnails & Interactive Image Manager */}
                                                {(() => {
                                                    const imgList = Array.isArray(room.images) 
                                                        ? room.images 
                                                        : (typeof room.images === 'string' ? safeParse(room.images, []) : []);
                                                    return (
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Room Images ({imgList.length})</label>
                                                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 items-center">
                                                                {imgList.map((imgUrl: string, imgIdx: number) => {
                                                                    const isWebP = imgUrl.toLowerCase().endsWith('.webp') || imgUrl.includes('.webp');
                                                                    const isCurrentOptimizing = msg.imageProgress && 
                                                                        msg.imageProgress.status === "converting" && 
                                                                        msg.imageProgress.roomIndex === rIdx && 
                                                                        msg.imageProgress.current === imgIdx + 1;
                                                                    return (
                                                                        <div key={imgIdx} className="relative w-24 h-18 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center shadow-xs group/img">
                                                                            <img 
                                                                                src={getResolvedImageUrl(imgUrl)} 
                                                                                alt={`Room image ${imgIdx + 1}`} 
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.style.display = 'none';
                                                                                }}
                                                                            />
                                                                            
                                                                            {/* Primary / Gallery Badge */}
                                                                            <div className={cn(
                                                                                "absolute top-1 left-1 text-[8px] font-black px-1.5 py-0.5 rounded-sm shadow-xs uppercase tracking-tighter text-white",
                                                                                imgIdx === 0 ? "bg-amber-500" : "bg-slate-700/80"
                                                                            )}>
                                                                                {imgIdx === 0 ? "★ Primary" : "Gallery"}
                                                                            </div>

                                                                            {isWebP && (
                                                                                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[7px] font-black px-1 rounded-sm shadow-xs uppercase tracking-tighter">
                                                                                    WebP
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {isCurrentOptimizing && (
                                                                                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                                                                                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                                                                </div>
                                                                            )}

                                                                            {/* Hover Action Overlay */}
                                                                            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                                                                                {imgIdx > 0 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const newImages = [...imgList];
                                                                                            const temp = newImages[0];
                                                                                            newImages[0] = newImages[imgIdx];
                                                                                            newImages[imgIdx] = temp;
                                                                                            handleFieldChange(msg.id, rIdx, "images", newImages);
                                                                                        }}
                                                                                        className="w-full py-0.5 text-center bg-amber-500 text-white text-[8px] font-black rounded-sm hover:bg-amber-600 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                                                                                    >
                                                                                        Make Primary
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const newImages = imgList.filter((_: string, idx: number) => idx !== imgIdx);
                                                                                        handleFieldChange(msg.id, rIdx, "images", newImages);
                                                                                    }}
                                                                                    className="w-full py-0.5 text-center bg-red-600 text-white text-[8px] font-black rounded-sm hover:bg-red-700 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                
                                                                {/* Add Image Card directly on room category card */}
                                                                <label className="relative w-24 h-18 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center shrink-0 cursor-pointer transition-all">
                                                                    <Plus className="w-4 h-4 text-slate-400" />
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Add Image</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*"
                                                                        multiple
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            const files = Array.from(e.target.files || []);
                                                                            if (files.length === 0) return;
                                                                            Promise.all(
                                                                                files.map(file => {
                                                                                    return new Promise<string>((resolve) => {
                                                                                        const reader = new FileReader();
                                                                                        reader.onloadend = () => resolve(reader.result as string);
                                                                                        reader.readAsDataURL(file);
                                                                                    });
                                                                                })
                                                                            ).then(results => {
                                                                                const cleanResults = results.filter(Boolean);
                                                                                handleFieldChange(msg.id, rIdx, "images", [...imgList, ...cleanResults]);
                                                                            });
                                                                            e.target.value = "";
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Image WebP Optimization Live Status */}
                                                {msg.imageProgress && (
                                                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-sm text-[10px] font-bold leading-normal transition-all duration-300">
                                                        {msg.imageProgress.status === "converting" && msg.imageProgress.roomIndex === rIdx && (
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-1.5 text-amber-600">
                                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                    <span>WebP Optimizer: Converting image {msg.imageProgress.current} of {msg.imageProgress.total}...</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="bg-amber-500 h-full transition-all duration-300"
                                                                        style={{ width: `${(msg.imageProgress.current / msg.imageProgress.total) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {msg.imageProgress.status === "converting" && msg.imageProgress.roomIndex > rIdx && (
                                                            <span className="text-emerald-600 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>All images optimized & converted to WebP</span>
                                                            </span>
                                                        )}
                                                        {msg.imageProgress.status === "converting" && msg.imageProgress.roomIndex < rIdx && (
                                                            <span className="text-slate-400 flex items-center gap-1">
                                                                <HelpCircle className="w-3.5 h-3.5" />
                                                                <span>Queued for WebP optimization...</span>
                                                            </span>
                                                        )}
                                                        {msg.imageProgress.status === "completed" && (
                                                            <span className="text-emerald-600 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>All images optimized & converted to WebP (strictly high-res)</span>
                                                            </span>
                                                        )}
                                                        {msg.imageProgress.status === "error" && (
                                                            <span className="text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                <span>Optimization failed: {msg.imageProgress.errorMsg}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

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

                                                    {/* Rate Plans / Variants */}
                                                    {room.variants && room.variants.length > 0 && (
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Scraped Rate Plans (EP, CP, MAP, AP)</label>
                                                            <div className="space-y-1.5 p-2 bg-slate-50 border border-slate-100 rounded-sm">
                                                                {room.variants.map((v: any, vIdx: number) => (
                                                                    <div key={vIdx} className="flex items-center justify-between text-[11px] font-bold text-slate-700 bg-white border border-slate-200/50 p-2 rounded-sm shadow-xs">
                                                                        <div className="flex flex-col min-w-0 pr-2">
                                                                            <span className="text-slate-900 font-extrabold truncate">{v.mealPlan}</span>
                                                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider truncate">{v.policy}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <span className="text-slate-400 text-[10px]">₹</span>
                                                                            <input 
                                                                                type="number"
                                                                                value={v.price}
                                                                                onChange={(e) => {
                                                                                    const updatedVariants = [...room.variants];
                                                                                    updatedVariants[vIdx] = {
                                                                                        ...updatedVariants[vIdx],
                                                                                        price: Number(e.target.value)
                                                                                    };
                                                                                    handleFieldChange(msg.id, rIdx, "variants", updatedVariants);
                                                                                }}
                                                                                className="w-16 px-1.5 py-0.5 border border-slate-200 rounded-sm text-xs font-black text-slate-900 text-right focus:outline-none focus:border-slate-400"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
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
                                    {(() => {
                                        const hasImagesToOptimize = msg.suggestedRooms?.some(room => {
                                            const imgList = Array.isArray(room.images) 
                                                ? room.images 
                                                : (typeof room.images === 'string' ? safeParse(room.images, []) : []);
                                            return imgList.length > 0 && imgList.some((imgUrl: string) => !imgUrl.toLowerCase().endsWith('.webp') && !imgUrl.includes('.webp') && imgUrl.startsWith('http'));
                                        });

                                        return (
                                            <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 max-w-4xl shadow-sm">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Info className="w-4 h-4 text-blue-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Configure all fields, then save directly into active hotel database records</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* WebP Optimizer Action Trigger */}
                                                    {hasImagesToOptimize && msg.status === "pending" && (!msg.imageProgress || msg.imageProgress.status === "idle" || msg.imageProgress.status === "error") && (
                                                        <button
                                                            onClick={() => handleOptimizeImages(msg.id)}
                                                            className="px-4 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-black active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                            Optimize Images (WebP)
                                                        </button>
                                                    )}
                                                    {hasImagesToOptimize && msg.status === "pending" && msg.imageProgress && msg.imageProgress.status === "converting" && (
                                                        <button
                                                            disabled
                                                            className="px-4 py-2.5 bg-amber-500/80 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center gap-2 cursor-not-allowed"
                                                        >
                                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                            Optimizing Room {msg.imageProgress.roomIndex + 1} ({msg.imageProgress.current}/{msg.imageProgress.total})...
                                                        </button>
                                                    )}
                                                    {hasImagesToOptimize && msg.status === "pending" && msg.imageProgress && msg.imageProgress.status === "completed" && (
                                                        <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            WebP Optimized
                                                        </div>
                                                    )}

                                                    {msg.status === "pending" && (
                                                        <button
                                                            onClick={() => handleSaveRooms(msg.id, msg.suggestedRooms || [])}
                                                            className="px-6 py-2.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-brand-700 shadow-md active:scale-95 transition-all cursor-pointer"
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
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Render clear all rooms block if requested */}
                            {isAI && msg.clearAllRooms && (
                                <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-xl max-w-lg shadow-sm space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Trash2 className="w-4 h-4 text-red-600 animate-pulse" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black uppercase text-red-800 tracking-wider">Confirm Delete All Rooms</h4>
                                            <p className="text-[10px] font-bold text-red-600 leading-normal">
                                                This action will delete all existing room categories currently configured in the database for this hotel.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        {msg.status === "pending" && (
                                            <button
                                                onClick={async () => {
                                                    await executeSave(msg.id, [], existingRooms.map(r => r.id));
                                                }}
                                                className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-700 shadow-md active:scale-95 transition-all"
                                            >
                                                Confirm & Delete All Rooms
                                            </button>
                                        )}
                                        {msg.status === "saving" && (
                                            <button
                                                disabled
                                                className="px-6 py-2.5 bg-red-600/50 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                Deleting Rooms...
                                            </button>
                                        )}
                                        {msg.status === "saved" && (
                                            <div className="px-6 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center gap-2 max-w-max">
                                                <CheckCircle2 className="w-4 h-4" />
                                                All Rooms Deleted Successfully
                                            </div>
                                        )}
                                        {msg.status === "error" && (
                                            <button
                                                onClick={async () => {
                                                    await executeSave(msg.id, [], existingRooms.map(r => r.id));
                                                }}
                                                className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-700 flex items-center gap-2"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                Retry Delete
                                            </button>
                                        )}
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
                {/* Chat input box with paperclip button and attachment thumbnails */}
                <div className="flex flex-col gap-2 border border-slate-200 rounded-lg p-2 bg-white focus-within:border-slate-400 transition-colors">
                    {/* Attachment Preview Area */}
                    {attachedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
                            {attachedImages.map((img, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-md border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setAttachedImages(prev => prev.filter((_: string, i: number) => i !== idx))}
                                        className="absolute top-0.5 right-0.5 p-0.5 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full transition-colors cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        {/* Paperclip upload button */}
                        <button
                            type="button"
                            disabled={loading || !selectedHotelId}
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-500 hover:text-brand-600 disabled:text-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                            title="Attach images (converts to WebP)"
                        >
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                        
                        {/* Main Text Input */}
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
                            className="flex-1 py-2 text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400 disabled:bg-transparent disabled:cursor-not-allowed"
                        />
                        
                        {/* Send Button */}
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !selectedHotelId || (!inputValue.trim() && urls.every(u => !u.trim()) && attachedImages.length === 0)}
                            className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* URL Input List */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Optional OTA Links (Multi-scraping):</span>
                        <div className="space-y-2 w-full">
                            {urls.map((url, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input 
                                        type="url"
                                        placeholder="https://www.booking.com/hotel/..."
                                        value={url}
                                        onChange={(e) => {
                                            const newUrls = [...urls];
                                            newUrls[index] = e.target.value;
                                            setUrls(newUrls);
                                        }}
                                        disabled={loading || !selectedHotelId}
                                        className="w-full md:w-80 px-3 py-1.5 border border-slate-200 rounded-sm text-[10px] font-bold text-slate-900 focus:outline-none focus:border-slate-400 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    />
                                    {urls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setUrls(urls.filter((_: string, i: number) => i !== index))}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                            title="Remove URL"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {index === urls.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setUrls([...urls, ""])}
                                            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-md transition-colors cursor-pointer"
                                            title="Add URL"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest self-end">Powered by Gemini 2.5 Flash</span>
                </div>
            </div>
            </>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-6">
                    <AdminReviewImporter 
                        hotels={hotels} 
                        hotelId={selectedHotelId} 
                        onHotelIdChange={(id) => setSelectedHotelId(id)}
                    />
                </div>
            )}
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
                                {/* Option A: Smart Sync Changes */}
                                <button
                                    onClick={async () => {
                                        const { messageId, roomList, existingRoomIds } = confirmModal;
                                        setConfirmModal(null);
                                        // Calculate deleteIds based on smart diff (existing rooms that are missing in the new list)
                                        const currentIds = roomList.map((r: any) => r.id).filter(Boolean);
                                        const deleteIds = existingRoomIds.filter(id => !currentIds.includes(id));
                                        await executeSave(messageId, roomList, deleteIds);
                                    }}
                                    className="w-full p-4 border border-brand-200 bg-brand-50/20 hover:bg-brand-50 text-left rounded-xl transition-all group flex items-start justify-between cursor-pointer"
                                >
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase text-brand-700 tracking-wider">Option A (Recommended): Sync Changes (Smart Diff)</h5>
                                        <p className="text-[9px] text-brand-500 font-bold mt-1 leading-normal">
                                            Update modified rooms, insert new ones, and delete omitted/removed categories.
                                        </p>
                                    </div>
                                    <Sparkles className="w-4 h-4 text-brand-400 group-hover:text-brand-600 transition-colors self-center shrink-0 ml-4" />
                                </button>

                                {/* Option B: Keep & Append */}
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

                                {/* Option C: Clean Overwrite */}
                                <button
                                    onClick={async () => {
                                        const { messageId, roomList, existingRoomIds } = confirmModal;
                                        setConfirmModal(null);
                                        await executeSave(messageId, roomList, existingRoomIds);
                                    }}
                                    className="w-full p-4 border border-red-200 bg-red-50/10 hover:bg-red-50 text-left rounded-xl transition-all group flex items-start justify-between cursor-pointer"
                                >
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase text-red-700 tracking-wider">Option C: Overwrite & Clean Install</h5>
                                        <p className="text-[9px] text-red-500 font-bold mt-1 leading-normal">
                                            Delete all {confirmModal.existingRoomsCount} current room categories and replace them with this newly drafted list.
                                        </p>
                                    </div>
                                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors self-center shrink-0 ml-4" />
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
