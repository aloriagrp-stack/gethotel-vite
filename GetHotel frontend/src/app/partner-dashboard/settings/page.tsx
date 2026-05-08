"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    Settings, User, Hotel, Shield, 
    Lock, HelpCircle, Save, Loader2,
    MapPin, Globe, Phone, Mail,
    Clock, Info, LogOut, Trash2,
    CheckCircle2, AlertCircle, Camera, Users, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

export default function PartnerSettingsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'policies' | 'account' | 'support'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Form States
    const [profileForm, setProfileForm] = useState({
        name: "",
        tagline: "",
        description: "",
        address: "",
        city: "",
        pricePerNight: "",
        starRating: "3"
    });

    const [policyForm, setPolicyForm] = useState({
        checkIn: "12:00 PM",
        checkOut: "11:00 AM",
        cancellation: "Free cancellation up to 24 hours before check-in",
        children: "Children below 5 years stay for free"
    });

    const fetchHotelData = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                setProfileForm({
                    name: myHotel.name || "",
                    tagline: myHotel.tagline || "",
                    description: myHotel.description || "",
                    address: myHotel.address || "",
                    city: myHotel.city || "",
                    pricePerNight: myHotel.pricePerNight?.toString() || "",
                    starRating: myHotel.starRating?.toString() || "3"
                });
                if (myHotel.policies) {
                    setPolicyForm({ ...policyForm, ...myHotel.policies });
                }
            }
        } catch (err) {
            console.error("Failed to fetch hotel data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchHotelData();
        } else if (!authLoading && !authUser) {
            router.push("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await hotelApi.updateHotel(hotel.id, {
                ...profileForm,
                pricePerNight: parseFloat(profileForm.pricePerNight),
                starRating: parseInt(profileForm.starRating)
            });
            if (res.success) {
                setSuccessMessage("Profile updated successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            alert("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePolicies = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await hotelApi.updateHotel(hotel.id, {
                policies: policyForm
            });
            if (res.success) {
                setSuccessMessage("Policies updated successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            alert("Failed to update policies");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-100" />
                <h3 className="text-xl font-black text-slate-900">No Property Found</h3>
                <p className="text-slate-500 font-medium">You need to have an active property to access settings.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Property Profile', icon: Hotel },
        { id: 'policies', label: 'Hotel Policies', icon: Shield },
        { id: 'account', label: 'Account Security', icon: Lock },
        { id: 'support', label: 'Support & Help', icon: HelpCircle },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Property Settings</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure your property profile, policies and account preferences</p>
                </div>
                {successMessage && (
                    <div className="px-6 py-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-2xl border border-emerald-100 flex items-center gap-2 animate-bounce">
                        <CheckCircle2 className="w-4 h-4" /> {successMessage}
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <div className="lg:w-80 shrink-0 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all border",
                                    activeTab === tab.id 
                                        ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" 
                                        : "bg-white text-slate-500 border-transparent hover:bg-slate-50"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", activeTab === tab.id ? "text-blue-400" : "text-slate-400")} />
                                {tab.label}
                            </button>
                        );
                    })}
                    
                    <div className="pt-10">
                        <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Property Profile</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">This information is visible to guests on the platform</p>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-32 h-32 bg-slate-100 rounded-[32px] flex flex-col items-center justify-center relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-600 transition-all">
                                        {hotel?.thumbnail ? (
                                            <img src={hotel.thumbnail} alt="" className="w-full h-full object-cover rounded-[30px]" />
                                        ) : (
                                            <Camera className="w-8 h-8 text-slate-300" />
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/60 rounded-[30px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-[8px] font-black text-white uppercase">Change Logo</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-6 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hotel Name</label>
                                                <input 
                                                    type="text" required value={profileForm.name}
                                                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                                                <input 
                                                    type="text" value={profileForm.tagline}
                                                    onChange={(e) => setProfileForm({...profileForm, tagline: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                            <textarea 
                                                required rows={4} value={profileForm.description}
                                                onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                                <input 
                                                    type="text" required value={profileForm.city}
                                                    onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Star Rating</label>
                                                <select 
                                                    value={profileForm.starRating}
                                                    onChange={(e) => setProfileForm({...profileForm, starRating: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                                >
                                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (Per Night)</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input 
                                                        type="number" required value={profileForm.pricePerNight}
                                                        onChange={(e) => setProfileForm({...profileForm, pricePerNight: e.target.value})}
                                                        className="w-full pl-10 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-5 w-4 h-4 text-slate-400" />
                                                <textarea 
                                                    required rows={2} value={profileForm.address}
                                                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Policies Tab */}
                    {activeTab === 'policies' && (
                        <form onSubmit={handleUpdatePolicies}>
                            <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Hotel Policies</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Define check-in rules and cancellation terms</p>
                            </div>
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Standard Check-In
                                        </label>
                                        <input 
                                            type="text" value={policyForm.checkIn}
                                            onChange={(e) => setPolicyForm({...policyForm, checkIn: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Standard Check-Out
                                        </label>
                                        <input 
                                            type="text" value={policyForm.checkOut}
                                            onChange={(e) => setPolicyForm({...policyForm, checkOut: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Cancellation Policy
                                    </label>
                                    <textarea 
                                        rows={3} value={policyForm.cancellation}
                                        onChange={(e) => setPolicyForm({...policyForm, cancellation: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Children & Extra Bed Policy
                                    </label>
                                    <textarea 
                                        rows={3} value={policyForm.children}
                                        onChange={(e) => setPolicyForm({...policyForm, children: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Update Policies
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="p-10 space-y-10 animate-fade-in">
                            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Change Password</h3>
                                <div className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-white border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 transition-all" />
                                    </div>
                                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            <div className="bg-red-50 p-8 rounded-[32px] border border-red-100">
                                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4">Danger Zone</h3>
                                <p className="text-xs text-red-500 font-medium mb-6">Permanently remove your property from the GetHotel platform. This action cannot be undone.</p>
                                <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Deactivate Property
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Support Tab */}
                    {activeTab === 'support' && (
                        <div className="p-10 space-y-10 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                                        <Mail className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Email Support</h4>
                                    <p className="text-xs text-slate-500 font-medium mb-6">Response within 24 hours</p>
                                    <a href="mailto:support@gethotel.com" className="text-blue-600 font-black text-sm hover:underline">support@gethotel.com</a>
                                </div>
                                <div className="p-8 bg-purple-50 rounded-[32px] border border-purple-100 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                                        <Phone className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Phone Support</h4>
                                    <p className="text-xs text-slate-500 font-medium mb-6">Available 10 AM - 6 PM</p>
                                    <a href="tel:+919876543210" className="text-purple-600 font-black text-sm hover:underline">+91 98765 43210</a>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Frequently Asked Questions</h3>
                                <div className="space-y-6">
                                    {[
                                        "How do I update my bank details?",
                                        "Can I add more than one property?",
                                        "How is the 10% commission calculated?",
                                        "What documents are needed for verification?"
                                    ].map((q, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{q}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
