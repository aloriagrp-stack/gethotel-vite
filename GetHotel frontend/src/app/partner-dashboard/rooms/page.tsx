"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    Bed, Plus, Edit3, Trash2, Loader2, 
    Users, Maximize2, Coffee, Wifi, 
    Tv, Wind, Shield, CheckCircle2,
    XCircle, ImageIcon, Info, Save,
    X, ChevronRight, LayoutGrid, List as ListIcon
} from "lucide-react";
import { cn, safeParse } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

export default function PartnerRoomsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        pricePerNight: "",
        maxOccupancy: "2",
        bedConfiguration: "1 King Bed",
        sizeM2: "250",
        amenities: [] as string[],
        images: [] as string[]
    });

    const commonAmenities = [
        "WiFi", "TV", "Air Conditioning", "Coffee Maker", 
        "Mini Bar", "Room Service", "Balcony", "Safe Box",
        "Work Desk", "Bathtub", "Premium Toiletries", "Hair Dryer",
        "Ironing Board", "Electric Kettle", "Soundproofing"
    ];

    const bedOptions = ["1 Single Bed", "2 Single Beds", "1 Double Bed", "1 Queen Bed", "1 King Bed", "1 King + 1 Single", "2 Double Beds", "2 Queen Beds"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await hotelApi.getMyHotels();
                if (res.success && res.data && res.data.length > 0) {
                    const myHotel = res.data[0];
                    setHotel(myHotel);
                    // Prisma returns room[] as 'room' singular in the relation
                    setRooms(myHotel.rooms || myHotel.room || []);
                }
            } catch (err) {
                console.error("Failed to fetch rooms", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchData();
        } else if (!authLoading && !authUser) {
            router.push("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleOpenModal = (room: any = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                name: room.name,
                description: room.description || "",
                pricePerNight: room.pricePerNight.toString(),
                maxOccupancy: room.maxOccupancy.toString(),
                bedConfiguration: room.bedConfiguration || "1 King Bed",
                sizeM2: room.sizeM2?.toString() || "250",
                amenities: safeParse(room.amenities),
                images: safeParse(room.images)
            });
        } else {
            setEditingRoom(null);
            setFormData({
                name: "",
                description: "",
                pricePerNight: "",
                maxOccupancy: "2",
                bedConfiguration: "1 King Bed",
                sizeM2: "250",
                amenities: [],
                images: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // VALIDATION: Min 5, Max 15 images
        if (formData.images.length < 5) {
            alert("Please add at least 5 images of the room.");
            return;
        }
        if (formData.images.length > 15) {
            alert("Maximum 15 images allowed.");
            return;
        }

        setIsSaving(true);
        try {
            // Ensure numbers are handled
            const dataToSave = {
                ...formData,
                pricePerNight: parseFloat(formData.pricePerNight),
                maxOccupancy: parseInt(formData.maxOccupancy),
                sizeM2: parseInt(formData.sizeM2)
            };

            if (editingRoom) {
                const res = await hotelApi.updateRoom(hotel.id, editingRoom.id, dataToSave);
                if (res.success) {
                    setRooms(prev => prev.map(r => r.id === editingRoom.id ? res.data : r));
                }
            } else {
                const res = await hotelApi.addRoom(hotel.id, dataToSave);
                if (res.success) {
                    setRooms(prev => [...prev, res.data]);
                }
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(`Failed to save room details: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        processFiles(Array.from(files));
    };

    const processFiles = (files: File[]) => {
        const remainingSlots = 15 - formData.images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (!confirm("Are you sure you want to delete this room type?")) return;
        try {
            const res = await hotelApi.deleteRoom(hotel.id, roomId);
            if (res.success) {
                setRooms(prev => prev.filter(r => r.id !== roomId));
            }
        } catch (err) {
            alert("Failed to delete room");
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity) 
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Room Management</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Create and manage your property's room categories</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 p-1 rounded-2xl flex items-center shadow-sm">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-6 py-3.5 bg-blue-600 text-white text-xs font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Room Category
                    </button>
                </div>
            </div>

            {/* Rooms Display */}
            {rooms.length === 0 ? (
                <div className="py-32 bg-white rounded-[40px] border border-dashed border-slate-200 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                        <Bed className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">No Room Categories Yet</h2>
                    <p className="text-slate-500 mb-8 max-w-sm font-medium">Add your first room category to start receiving bookings on GetHotel.</p>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    >
                        Create Room Category
                    </button>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-8",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {rooms.map((room) => (
                        <div key={room.id} className={cn(
                            "bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all group overflow-hidden",
                            viewMode === 'grid' ? "rounded-[40px]" : "rounded-[32px] flex flex-col md:flex-row items-center p-6 gap-8"
                        )}>
                            {/* Thumbnail Placeholder */}
                            <div className={cn(
                                "bg-slate-100 flex items-center justify-center relative",
                                viewMode === 'grid' ? "h-56 w-full" : "h-40 w-64 rounded-2xl shrink-0"
                            )}>
                                {(() => {
                                    const roomImages = safeParse(room.images);
                                    return roomImages.length > 0 ? (
                                        <img src={roomImages[0]} alt={room.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-slate-200" />
                                    );
                                })()}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(room)}
                                        className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-blue-600 shadow-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRoom(room.id)}
                                        className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-red-600 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className={cn(
                                "p-8 flex-1",
                                viewMode === 'list' ? "p-0" : ""
                            )}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{room.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{room.bedConfiguration}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-blue-600">₹{room.pricePerNight}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per night</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <Users className="w-4 h-4 text-slate-400" /> {room.maxOccupancy} Max Guests
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <Maximize2 className="w-4 h-4 text-slate-400" /> {room.sizeM2} sq. ft Area
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const amenities = safeParse(room.amenities);
                                        return (
                                            <>
                                                {amenities.slice(0, 4).map((amenity: string) => (
                                                    <span key={amenity} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-lg border border-slate-100">
                                                        {amenity}
                                                    </span>
                                                ))}
                                                {amenities.length > 4 && (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg">
                                                        +{amenities.length - 4} More
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <form onSubmit={handleSaveRoom}>
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Room Category</span>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{editingRoom ? "Edit Room Details" : "Create New Category"}</h2>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="e.g. Deluxe Ocean View"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Per Night (₹)</label>
                                        <input 
                                            type="number" 
                                            required
                                            placeholder="2500"
                                            value={formData.pricePerNight}
                                            onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea 
                                        placeholder="Briefly describe this room type..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Occupancy</label>
                                        <select 
                                            value={formData.maxOccupancy}
                                            onChange={(e) => setFormData({...formData, maxOccupancy: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                        >
                                            {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guests</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bed Configuration</label>
                                        <select 
                                            value={formData.bedConfiguration}
                                            onChange={(e) => setFormData({...formData, bedConfiguration: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                        >
                                            {bedOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Size (sq. ft)</label>
                                        <input 
                                            type="number" 
                                            placeholder="250"
                                            value={formData.sizeM2}
                                            onChange={(e) => setFormData({...formData, sizeM2: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Amenities</label>
                                    <div className="flex flex-wrap gap-3">
                                        {commonAmenities.map((amenity) => (
                                            <button
                                                key={amenity}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity)}
                                                className={cn(
                                                    "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    formData.amenities.includes(amenity)
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                                )}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Image Gallery</label>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                            formData.images.length < 5 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                        )}>
                                            {formData.images.length} / 15 Images (Min 5)
                                        </span>
                                    </div>
                                    
                                    {/* Drag & Drop Zone */}
                                    {formData.images.length < 15 && (
                                        <div 
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={cn(
                                                "relative h-48 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all group cursor-pointer",
                                                isDragging ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                                            )}
                                        >
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">Drop images here or click to upload</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG, WEBP (Max 15 images)</p>
                                        </div>
                                    )}

                                    {/* Preview Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {formData.images.map((url, index) => (
                                            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 animate-scale-in">
                                                <img src={url} alt="Room" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingRoom ? "Update Category" : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
