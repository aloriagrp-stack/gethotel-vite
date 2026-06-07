import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    Hotel, MapPin, DollarSign, Star, 
    ArrowLeft, Loader2, User, Mail, 
    Phone, Calendar, Globe, ShieldCheck,
    Image as ImageIcon, Bed, Info,
    TrendingUp, History, UserCheck, 
    CreditCard, CheckCircle2, XCircle, Clock,
    Plus, Edit3, Trash2, Save, Users,
    Shield, AlertCircle, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn, amenityIcon, amenityLabel, safeParse } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

const ALL_AMENITIES = [
    'wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar', 'parking', 
    'airport_shuttle', 'pet_friendly', 'air_conditioning', 'room_service', 
    'laundry', 'conference_room', 'ev_charging', 'beach_access', 'kids_club',
    'cctv', 'balcony', 'terrace', 'breakfast', 'geyser'
];

const MAIN_AMENITY_PRESETS = [
    { id: 'wifi', label: 'Free Wi-Fi', icon: '📶' },
    { id: 'cctv', label: 'CCTV Camera', icon: '📹' },
    { id: 'air_conditioning', label: 'Air Conditioning', icon: '❄️' },
    { id: 'parking', label: 'Free Parking', icon: '🅿️' },
    { id: 'breakfast', label: 'Free Breakfast', icon: '🍳' },
    { id: 'geyser', label: 'Geyser / Hot Water', icon: '🚿' }
];

export default function PartnerHotelPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [dragging, setDragging] = useState<string | null>(null); // 'thumbnail' or 'gallery'
    const [customAmenity, setCustomAmenity] = useState("");

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await hotelApi.getMyHotels({ light: true });
                if (res.success && res.data && res.data.length > 0) {
                    const myHotel = res.data[0];
                    setHotel(myHotel);
                    setEditData(myHotel);
                }
            } catch (err) {
                console.error("Failed to fetch hotel details", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchHotel();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleUpdateHotel = async () => {
        const currentImages = editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images) : [];
        if (currentImages.length < 5) {
            alert(`A minimum of 5 images is required for the hotel. You have uploaded ${currentImages.length} images.`);
            return;
        }
        setSaving(true);
        try {
            const updatedData = { ...editData };
            
            if (currentImages.length > 0) {
                updatedData.thumbnail = currentImages[0];
                updatedData.images = JSON.stringify(currentImages);
            }

            if (Array.isArray(updatedData.amenities)) {
                updatedData.amenities = JSON.stringify(updatedData.amenities);
            }

            if (updatedData.policies && typeof updatedData.policies !== 'string') {
                updatedData.policies = JSON.stringify(updatedData.policies);
            }

            if (updatedData.mainAmenities && Array.isArray(updatedData.mainAmenities)) {
                updatedData.mainAmenities = JSON.stringify(updatedData.mainAmenities);
            }

            const res = await hotelApi.updateHotel(hotel.id, updatedData);
            if (res.success) {
                setHotel(res.data);
                setEditing(false);
                alert("Hotel updated successfully!");
            }
        } catch (err: any) {
            alert(`Failed to update hotel: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <Hotel className="w-16 h-16 text-slate-200 mb-6" />
                <h1 className="text-2xl font-black text-slate-900 mb-2">No Hotel Found</h1>
                <p className="text-slate-500 mb-8">You haven't added a hotel yet or it's still being processed.</p>
                <Link to="/partner-dashboard" className="px-8 py-4 bg-slate-950 text-white rounded-none font-bold">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/partner-dashboard" className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-[300px] md:max-w-none" title={hotel.name}>{hotel.name}</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {hotel.city}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {editing ? (
                            <>
                                <button onClick={() => setEditing(false)} className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-none">Cancel</button>
                                <button onClick={handleUpdateHotel} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white font-black text-sm rounded-none shadow-lg shadow-blue-100 flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setEditing(true)} className="px-6 py-2.5 bg-slate-950 text-white font-black text-sm rounded-none flex items-center gap-2">
                                <Edit3 className="w-4 h-4" /> Edit Property
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-none p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" /> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Hotel Name</label>
                                    <input type="text" readOnly={!editing} value={editing ? editData.name : hotel.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className={cn("w-full px-4 py-3 bg-slate-50 rounded-none text-sm font-bold border", editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default")} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Tagline</label>
                                    <input type="text" readOnly={!editing} value={editing ? editData.tagline : hotel.tagline} onChange={(e) => setEditData({ ...editData, tagline: e.target.value })} className={cn("w-full px-4 py-3 bg-slate-50 rounded-none text-sm font-bold border", editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default")} />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                                    <textarea readOnly={!editing} value={editing ? editData.description : hotel.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className={cn("w-full px-4 py-3 bg-slate-50 rounded-none text-sm font-bold border min-h-[100px]", editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default")} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">City</label>
                                    <input type="text" readOnly={!editing} value={editing ? editData.city : hotel.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })} className={cn("w-full px-4 py-3 bg-slate-50 rounded-none text-sm font-bold border", editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default")} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Address</label>
                                    <input type="text" readOnly={!editing} value={editing ? editData.address : hotel.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className={cn("w-full px-4 py-3 bg-slate-50 rounded-none text-sm font-bold border", editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default")} />
                                </div>
                            </div>
                        </div>

                        {/* Main Amenities (Top 6) */}
                        <div className="bg-white rounded-none p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-none blur-3xl -mr-16 -mt-16" />
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-blue-600" /> Main Amenities (Top 6)
                                </h3>
                                <span className={cn(
                                    "text-[10px] font-black uppercase px-3 py-1 rounded-none",
                                    (safeParse(editing ? editData.mainAmenities : (hotel.mainAmenities || hotel.main_amenities), [])).length >= 6 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {(safeParse(editing ? editData.mainAmenities : (hotel.mainAmenities || hotel.main_amenities), [])).length}/6 Selected
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {MAIN_AMENITY_PRESETS.map((preset) => {
                                    const currentMain = safeParse(editing ? editData.mainAmenities : (hotel.mainAmenities || hotel.main_amenities), []);
                                    const isSelected = currentMain.some((m: any) => m.id === preset.id);
                                    return (
                                        <button key={preset.id} disabled={!editing} onClick={() => {
                                            let updated = [...currentMain];
                                            if (isSelected) updated = updated.filter((m: any) => m.id !== preset.id);
                                            else if (updated.length < 6) updated.push(preset);
                                            setEditData({ ...editData, mainAmenities: JSON.stringify(updated) });
                                        }} className={cn("flex items-center gap-3 p-4 rounded-none border text-left transition-all", isSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-50 border-transparent text-slate-600", editing && "hover:border-slate-200")}>
                                            <span className="text-xl">{preset.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-tight">{preset.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {editing && (
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Custom Amenity</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="e.g. Private Pool" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 rounded-none text-sm font-bold border border-transparent focus:bg-white focus:border-blue-600 outline-none" />
                                        <button onClick={() => {
                                            if (!customAmenity) return;
                                            const currentMain = safeParse(editData.mainAmenities, []);
                                            if (currentMain.length >= 6) return alert("Bhai, sirf 6 allowed hain!");
                                            setEditData({ ...editData, mainAmenities: JSON.stringify([...currentMain, { id: `custom_${Date.now()}`, label: customAmenity, icon: '✨' }]) });
                                            setCustomAmenity("");
                                        }} className="px-6 py-3 bg-slate-900 text-white rounded-none text-[10px] font-black uppercase tracking-widest">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {safeParse(editData.mainAmenities, []).filter((m: any) => m.id.startsWith('custom_')).map((m: any) => (
                                            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-none border border-blue-100 text-[9px] font-black uppercase">
                                                {m.label}
                                                <button onClick={() => setEditData({ ...editData, mainAmenities: JSON.stringify(safeParse(editData.mainAmenities, []).filter((item: any) => item.id !== m.id)) })}><XCircle className="w-3 h-3 hover:text-red-500" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* All Facilities */}
                        <div className="bg-white rounded-none p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-600" /> All Facilities
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {ALL_AMENITIES.map((a) => {
                                    const currentList = Array.isArray(editing ? editData.amenities : (hotel.amenities || hotel.hotel_amenities)) ? (editing ? editData.amenities : (hotel.amenities || hotel.hotel_amenities)) : safeParse(editing ? editData.amenities : (hotel.amenities || hotel.hotel_amenities), []);
                                    const isSelected = currentList.includes(a);
                                    return (
                                        <button key={a} disabled={!editing} onClick={() => {
                                            const updated = isSelected ? currentList.filter((item: string) => item !== a) : [...currentList, a];
                                            setEditData({ ...editData, amenities: updated });
                                        }} className={cn("flex items-center gap-3 p-4 rounded-none border text-left transition-all", isSelected ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-transparent text-slate-600", editing && "hover:border-blue-400 cursor-pointer")}>
                                            <span className="text-xl">{amenityIcon(a)}</span>
                                            <span className="text-[10px] font-black uppercase tracking-tight">{amenityLabel(a)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="bg-white rounded-none p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-600" /> Property Gallery
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {(safeParse(editing ? editData.images : hotel.images, [])).map((img: string, i: number) => (
                                    <div key={i} className="relative aspect-square rounded-none overflow-hidden border border-slate-100 group">
                                        <img src={img} className="w-full h-full object-cover" />
                                        {editing && (
                                            <button onClick={() => {
                                                const current = safeParse(editData.images, []);
                                                setEditData({ ...editData, images: JSON.stringify(current.filter((_: any, idx: number) => idx !== i)) });
                                            }} className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-none flex items-center justify-center opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                                        )}
                                    </div>
                                ))}
                                {editing && (
                                    <label className="relative aspect-square rounded-none border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-300">
                                        <input type="file" multiple accept="image/*" onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            files.forEach(file => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    const current = safeParse(editData.images, []);
                                                    setEditData({ ...editData, images: JSON.stringify([...current, reader.result as string]) });
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                        }} className="hidden" />
                                        <Plus className="w-6 h-6 text-slate-300" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-none p-8 border border-slate-200 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-blue-600 fill-blue-600" /> Property Rating
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select the official star rating of this hotel</p>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Star Rating</label>
                                {editing ? (
                                    <div className="grid grid-cols-5 gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const isSelected = (editData?.starRating === star) || (!editData?.starRating && star === 5);
                                            return (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setEditData({ ...editData, starRating: star })}
                                                    className={cn(
                                                        "py-3 border text-xs font-black uppercase tracking-widest transition-all rounded-none text-center flex flex-col items-center justify-center gap-1 cursor-pointer",
                                                        isSelected 
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                                                            : "bg-slate-50 border-transparent text-slate-600 hover:border-slate-200"
                                                    )}
                                                >
                                                    <span className="text-sm">{star}</span>
                                                    <Star className={cn("w-3.5 h-3.5", isSelected ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5 p-4 bg-slate-50 border border-slate-100 rounded-none">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(hotel.starRating || 5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider ml-1">
                                            {hotel.starRating || 5} Star Property
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-100" />

                            {/* Property Stats */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Performance Summary</h4>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Guest Rating</span>
                                    <span className="font-black text-slate-900 flex items-center gap-1.5">{hotel.guestRating || '0'} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /></span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Reviews</span>
                                    <span className="font-black text-slate-900">{hotel.reviewCount || '0'} Reviews</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Base Price</span>
                                    <span className="font-black text-slate-900">₹{hotel.pricePerNight || '0'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-none p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> Policies</h3>
                            <div className="space-y-4">
                                {Object.entries(safeParse(hotel.policies || hotel.hotel_policies || hotel.policies, {})).map(([key, value]: any) => (
                                    <div key={key}>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                                        <p className="text-xs font-bold text-slate-600 italic">"{value || 'Not defined'}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
