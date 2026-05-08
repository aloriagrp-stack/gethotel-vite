"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    Hotel, MapPin, DollarSign, Star, 
    ArrowLeft, Loader2, User, Mail, 
    Phone, Calendar, Globe, ShieldCheck,
    Image as ImageIcon, Bed, Info,
    TrendingUp, History, UserCheck, 
    CreditCard, CheckCircle2, XCircle, Clock,
    Plus, Edit3, Trash2, Save, Users
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

export default function PartnerHotelPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [dragging, setDragging] = useState<string | null>(null); // 'thumbnail' or 'gallery'

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await hotelApi.getMyHotels();
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
            router.push("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleUpdateHotel = async () => {
        setSaving(true);
        try {
            // Auto-set thumbnail to the first image of the gallery if available
            const currentImages = editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images) : [];
            const updatedData = { ...editData };
            if (currentImages.length > 0) {
                updatedData.thumbnail = currentImages[0];
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
                <Link href="/partner-dashboard" className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold">
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
                        <Link href="/partner-dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{hotel.name}</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {hotel.city}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {editing ? (
                            <>
                                <button 
                                    onClick={() => setEditing(false)}
                                    className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateHotel}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-black text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setEditing(true)}
                                className="px-6 py-2.5 bg-slate-950 text-white font-black text-sm rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Property
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info Section */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 pb-4 border-b border-slate-50 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" /> Basic Information
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hotel Name</label>
                                        <input 
                                            type="text" 
                                            readOnly={!editing}
                                            value={editing ? editData.name : hotel.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-slate-50 rounded-xl text-sm font-bold outline-none border transition-all",
                                                editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                                        <input 
                                            type="text" 
                                            readOnly={!editing}
                                            value={editing ? editData.tagline : hotel.tagline}
                                            onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold outline-none border transition-all",
                                                editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default"
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea 
                                        readOnly={!editing}
                                        value={editing ? editData.description : hotel.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        className={cn(
                                            "w-full px-4 py-3.5 bg-slate-50 rounded-xl text-sm font-bold outline-none border transition-all min-h-[120px] resize-none",
                                            editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default"
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                        <input 
                                            type="text" 
                                            readOnly={!editing}
                                            value={editing ? editData.city : hotel.city}
                                            onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold outline-none border transition-all",
                                                editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                                        <input 
                                            type="text" 
                                            readOnly={!editing}
                                            value={editing ? editData.address : hotel.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-slate-50 rounded-xl text-sm font-bold outline-none border transition-all",
                                                editing ? "border-blue-100 focus:bg-white focus:border-blue-600" : "border-transparent cursor-default"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-blue-600" /> Property Gallery
                                </h3>
                                {editing && (
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                        (editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images).length : 0) < 5 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                    )}>
                                        {editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images).length : 0} / 15 Images
                                    </span>
                                )}
                            </div>

                            {editing ? (
                                <div className="space-y-8">
                                    {/* Live Collage Preview while Editing */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Collage Preview</p>
                                        <div className="grid grid-cols-4 gap-3 h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-100">
                                            {/* Main large image */}
                                            <div className="col-span-2 row-span-2 relative bg-slate-50">
                                                {(editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images) : [])[0] ? (
                                                    <img src={(typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images)[0]} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-200" /></div>
                                                )}
                                            </div>
                                            {/* 4 small images */}
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="relative bg-slate-50">
                                                    {(editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images) : [])[i] ? (
                                                        <img src={(typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images)[i]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-slate-200" /></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div 
                                        onDragOver={(e) => { e.preventDefault(); setDragging('gallery'); }}
                                        onDragLeave={() => setDragging(null)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setDragging(null);
                                            const files = Array.from(e.dataTransfer.files || []);
                                            files.forEach(file => {
                                                if (file.type.startsWith('image/')) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const currentImages = editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images) : [];
                                                        setEditData({ ...editData, images: [...currentImages, reader.result as string] });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            });
                                        }}
                                        className={cn(
                                            "relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all group cursor-pointer",
                                            dragging === 'gallery' ? "border-blue-600 bg-blue-50 scale-[0.99]" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                                        )}
                                    >
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                files.forEach(file => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const currentImages = editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images) : [];
                                                        setEditData({ ...editData, images: [...currentImages, reader.result as string] });
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className={cn(
                                            "w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 transition-transform",
                                            dragging === 'gallery' && "scale-110"
                                        )}>
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs font-black text-slate-900">
                                            {dragging === 'gallery' ? "Drop images here!" : "Click or drag images to upload"}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Min 5 images for collage</p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {(editData.images ? (typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images) : []).map((img: string, i: number) => (
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100">
                                                <img src={img} alt="Hotel" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => {
                                                        const currentImages = typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images;
                                                        setEditData({ ...editData, images: currentImages.filter((_: any, idx: number) => idx !== i) });
                                                    }}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => setEditing(true)}
                                    className="space-y-4 cursor-pointer group"
                                >
                                    {(hotel.images && (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images).length > 0) ? (
                                        <div className="grid grid-cols-4 gap-3 h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-100 relative">
                                            {/* Main image */}
                                            <div className="col-span-2 row-span-2 relative bg-slate-50">
                                                <img src={(typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images)[0]} className="w-full h-full object-cover" />
                                            </div>
                                            {/* 4 small images */}
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="relative bg-slate-50">
                                                    {(typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images)[i] ? (
                                                        <img src={(typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images)[i]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-100/50"><ImageIcon className="w-4 h-4 text-slate-200" /></div>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="px-6 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Plus className="w-4 h-4" /> Add / Manage Gallery
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-64 sm:h-80 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center hover:border-blue-300 transition-all">
                                            <div className="w-16 h-16 bg-white text-slate-300 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                            <p className="text-xs font-black text-slate-400">Your Property Gallery is Empty</p>
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 underline">Click here to add photos</p>
                                        </div>
                                    )}
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                        Total {(hotel.images ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images).length : 0)} images in gallery
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Room Management Section */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Bed className="w-5 h-5 text-blue-600" /> Room Categories
                                </h3>
                                <button className="px-4 py-2 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-blue-100 transition-all flex items-center gap-2">
                                    <Plus className="w-3 h-3" /> Add New Category
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(hotel.rooms || hotel.room) && (hotel.rooms || hotel.room).length > 0 ? (hotel.rooms || hotel.room).map((room: any) => (
                                    <div key={room.id} className="group p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-50 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg tracking-tight">{room.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.bedConfiguration}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400 hover:text-blue-600 shadow-sm"><Edit3 className="w-4 h-4" /></button>
                                                <button className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400 hover:text-red-600 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                                <Users className="w-4 h-4" /> Max {room.maxOccupancy}
                                            </div>
                                            <div className="text-xl font-black text-slate-900">
                                                ₹{room.pricePerNight}<span className="text-[10px] text-slate-400 font-bold uppercase">/night</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-sm font-bold text-slate-400">No rooms added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Stats Overview */}
                        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-slate-200">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 pb-4 border-b border-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Property Insights
                            </h3>
                            
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Guest Rating</p>
                                        <p className="text-2xl font-black flex items-center gap-2">
                                            {hotel.guestRating} <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Price</span>
                                        <span className="text-sm font-black">₹{hotel.pricePerNight}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Revenue</span>
                                        <span className="text-sm font-black text-emerald-500">₹{hotel.totalRevenue?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Reviews</span>
                                        <span className="text-sm font-black">{hotel.reviewCount} Reviews</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                View Public Profile
                            </button>
                        </div>

                        {/* Recent Bookings Snapshot */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" /> Recent Bookings
                            </h3>
                            
                            <div className="space-y-4">
                                {((hotel.booking || hotel.bookings) && (hotel.booking || hotel.bookings).length > 0) ? (hotel.booking || hotel.bookings).slice(0, 3).map((booking: any) => (
                                    <div key={booking.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{booking.user?.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                                                {new Date(booking.checkIn).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900">₹{booking.totalPrice}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                {booking.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">No recent bookings</p>
                                )}
                            </div>
                            
                            <button className="w-full mt-6 text-blue-600 font-bold text-xs hover:underline uppercase tracking-widest">
                                View All Bookings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
