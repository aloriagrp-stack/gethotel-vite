import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Globe, RefreshCw, Copy, Check, Eye, EyeOff, 
    Lock, Settings, Layers, Activity, Info, ShieldCheck,
    CheckCircle2, ArrowRight
} from "lucide-react";
import { hotelApi, otaApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PartnerChannelSync() {
    const activeHotelId = typeof window !== 'undefined' ? sessionStorage.getItem('activeHotelId') : null;
    const [hotel, setHotel] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [otaEnabled, setOtaEnabled] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [isCopiedId, setIsCopiedId] = useState(false);
    const [isCopiedToken, setIsCopiedToken] = useState(false);
    const [copiedRoomId, setCopiedRoomId] = useState<number | null>(null);
    const [savingSettings, setSavingSettings] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: "", type: null });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: null }), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!activeHotelId) return;
                const hotelId = parseInt(activeHotelId);

                // Fetch Hotel & Rooms data
                const res = await hotelApi.getMyHotels({ light: true });
                if (res.success && res.data && res.data.length > 0) {
                    const myHotel = res.data.find((h: any) => h.id === hotelId) || res.data[0];
                    setHotel(myHotel);
                    setRooms(myHotel.rooms || myHotel.room || []);
                }

                // Fetch OTA Settings
                const otaRes = await otaApi.getSettings(hotelId);
                if (otaRes.success && otaRes.data) {
                    setOtaEnabled(otaRes.data.otaEnabled);
                    setApiKey(otaRes.data.otaApiKey || "");
                }
            } catch (err: any) {
                console.error("Failed to load channel sync settings", err);
                showToast(err.message || "Failed to load channel manager settings", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeHotelId]);

    const handleToggleOta = async () => {
        if (!activeHotelId) return;
        setSavingSettings(true);
        try {
            const hotelId = parseInt(activeHotelId);
            const res = await otaApi.generateKey(hotelId, { 
                otaEnabled: !otaEnabled 
            });
            if (res.success) {
                setOtaEnabled(res.data.otaEnabled);
                setApiKey(res.data.otaApiKey || "");
                showToast(res.data.otaEnabled ? "Channel Sync Enabled!" : "Channel Sync Disabled", "success");
            }
        } catch (err: any) {
            showToast(err.message || "Failed to toggle OTA sync", "error");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleRotateKey = async () => {
        if (!activeHotelId) return;
        if (!confirm("Are you sure you want to rotate the API Token? Existing channel manager connections using the old key will stop working immediately.")) return;

        setSavingSettings(true);
        try {
            const hotelId = parseInt(activeHotelId);
            const res = await otaApi.generateKey(hotelId, { 
                rotate: true 
            });
            if (res.success) {
                setApiKey(res.data.otaApiKey);
                showToast("New API Token generated successfully!", "success");
            }
        } catch (err: any) {
            showToast(err.message || "Failed to rotate token", "error");
        } finally {
            setSavingSettings(false);
        }
    };

    const copyToClipboard = (text: string, type: 'id' | 'token' | 'room', roomId?: number) => {
        navigator.clipboard.writeText(text);
        if (type === 'id') {
            setIsCopiedId(true);
            setTimeout(() => setIsCopiedId(false), 2000);
        } else if (type === 'token') {
            setIsCopiedToken(true);
            setTimeout(() => setIsCopiedToken(false), 2000);
        } else if (type === 'room' && roomId !== undefined) {
            setCopiedRoomId(roomId);
            setTimeout(() => setCopiedRoomId(null), 2000);
        }
        showToast("Copied to clipboard!", "success");
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Channel Manager Sync</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Connect third-party channel managers to sync rates & inventory</p>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggleOta}
                        disabled={savingSettings}
                        className={cn(
                            "px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center gap-2",
                            otaEnabled 
                                ? "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700" 
                                : "bg-slate-900 text-white shadow-slate-100 hover:bg-black"
                        )}
                    >
                        {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        {otaEnabled ? "Syncing Live" : "Enable Channel Sync"}
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast.type && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={cn(
                            "fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-none shadow-2xl border flex items-center gap-4 min-w-[300px]",
                            toast.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" : "bg-red-600 border-red-500 text-white"
                        )}
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-none flex items-center justify-center">
                            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">System Message</p>
                            <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Setup & Credentials */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Credentials Card */}
                    <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-none" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">API Connection Credentials</h3>
                        </div>
                        
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                            Use these credentials in your Channel Manager (e.g. AxisRooms, Channex, SiteMinder) to establish a secure bridge with your GetHotelStays listing. Do not share your API Token with unauthorized individuals.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            {/* Hotel ID Field */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GetHotel Hotel ID</label>
                                <div className="relative flex">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={activeHotelId || ""} 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-none text-sm font-black focus:outline-none"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(activeHotelId || "", 'id')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:text-blue-600 transition-colors"
                                    >
                                        {isCopiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Unique property identifier on GetHotelStays</p>
                            </div>

                            {/* API Token Field */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OTA API Token</label>
                                <div className="relative flex">
                                    <input 
                                        type={showKey ? "text" : "password"} 
                                        readOnly 
                                        value={apiKey || "••••••••••••••••••••••••••••••••••••••••••••"} 
                                        className="w-full pl-6 pr-20 py-4 bg-slate-50 border border-slate-100 rounded-none text-sm font-mono font-bold focus:outline-none"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            onClick={() => setShowKey(!showKey)}
                                            className="p-2 hover:text-blue-600 transition-colors text-slate-400"
                                        >
                                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(apiKey, 'token')}
                                            disabled={!apiKey}
                                            className="p-2 hover:text-blue-600 transition-colors text-slate-400 disabled:opacity-30"
                                        >
                                            {isCopiedToken ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Authentication token for external API calls</p>
                            </div>
                        </div>

                        {/* Rotate Action */}
                        {apiKey && (
                            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-none mt-4">
                                <div className="flex gap-3 items-center">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                    <div className="space-y-0.5">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase">Token Rotation</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Revoke key and generate a fresh one</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRotateKey}
                                    disabled={savingSettings}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-100 rounded-none text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    Rotate Key
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Room Mapping ID List */}
                    <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-orange-500 rounded-none" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Room Mapping Identifiers</h3>
                        </div>

                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                            Under the mapping configurations of your Channel Manager portal, align the target room type fields with these specific GetHotelStays Room IDs:
                        </p>

                        <div className="border border-slate-200 rounded-none overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="p-5">Room Category</th>
                                        <th className="p-5 text-center">Room Type ID</th>
                                        <th className="p-5">Base Rate</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                                    {rooms.map((room) => (
                                        <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center"><Layers className="w-4 h-4" /></div>
                                                    <div>
                                                        <p className="text-slate-900 font-bold">{room.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{room.bedConfiguration || "1 King Bed"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center font-mono text-slate-900 font-black text-base">{room.id}</td>
                                            <td className="p-5 text-slate-900 font-bold">₹{room.pricePerNight}</td>
                                            <td className="p-5">
                                                <span className={cn(
                                                    "px-3 py-1 text-[8px] font-black uppercase tracking-widest border",
                                                    room.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                )}>
                                                    {room.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => copyToClipboard(String(room.id), 'room', room.id)}
                                                    className="px-3 py-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ml-auto"
                                                >
                                                    {copiedRoomId === room.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                    Copy ID
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rooms.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 uppercase text-[10px] tracking-widest font-black">No Room Categories Created Yet. Please add rooms in "Manage Rooms" first.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Setup Guide Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-none p-8 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-none" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Setup Instructions</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center font-black text-[10px]">1</div>
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase">Enable Live Sync</h4>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed ml-7">Click the "Enable Channel Sync" button at the top of this page to authorize external API calls.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center font-black text-[10px]">2</div>
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase">Map Channel Menu</h4>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed ml-7">Go to your Channel Manager account (Channex, AxisRooms, etc.), search for "GetHotelStays" in channels, and paste your Hotel ID & API Token.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center font-black text-[10px]">3</div>
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase">Align Room IDs</h4>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed ml-7">Map room categories by copying each individual Room Type ID from the list on the left and pasting them into the mapping inputs.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center font-black text-[10px]">4</div>
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase">Push Initial Sync</h4>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed ml-7">Inside your Channel Manager dashboard, click "Push Full Sync" or "Refresh Rates" to push your active inventory to GetHotelStays.</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-none flex gap-3">
                                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                                <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase">
                                    Need help connecting AxisRooms or Channex? Contact connectivity support at tech@gethotelstays.com.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
