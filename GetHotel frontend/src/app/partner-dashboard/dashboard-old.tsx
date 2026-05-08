"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { hotelApi, bookingApi, dailyRateApi } from "@/lib/api";
import { 
    LayoutDashboard, BookOpen, Bed, 
    MessageSquare, Settings, LogOut, 
    Bell, Search, UserCheck, Calendar,
    CreditCard, Clock,
    Hotel, Filter, Star, Plus, Mail, Phone, Edit3, Save,
    ChevronDown, ChevronRight, CheckCircle2, X, Loader2,
    TrendingUp, Percent, Wallet, BarChart3, Mailbox, Camera, Check,
    HelpCircle, LifeBuoy, ShieldCheck, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "home" | "rates" | "promotions" | "reservations" | "property" | "performance" | "inbox" | "reviews" | "finance" | "analytics" | "settings" | "onboarding";

export default function HotelPartnerDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>("home");
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const [hotels, setHotels] = useState<any[]>([]);
    const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<any>(null);
    const [dailyRates, setDailyRates] = useState<any[]>([]);
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [roomFormData, setRoomFormData] = useState({
        name: "",
        bedConfiguration: "King Bed",
        pricePerNight: "",
        maxOccupancy: "2",
        sizeM2: "30",
        amenities: ["wifi", "ac"]
    });

    const myHotel = hotels[selectedHotelIndex];

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const hotelRes = await hotelApi.getMyHotels();
            setHotels(hotelRes.data);
            
            if (hotelRes.data.length === 0) {
                setActiveTab("onboarding");
            }

            const bookingRes = await bookingApi.getBookings(); 
            setBookings(bookingRes.data || []);
        } catch (err) {
            console.error("Dashboard fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    // Fetch Daily Rates for Calendar
    const fetchRates = async () => {
        if (!myHotel || !myHotel.rooms || myHotel.rooms.length === 0) return;
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            
            const allRates = [];
            for (const room of myHotel.rooms) {
                const res = await dailyRateApi.getRates(room.id, startDate.toISOString(), endDate.toISOString());
                allRates.push(...res.data);
            }
            setDailyRates(allRates);
        } catch (err) {
            console.error("Failed to fetch rates", err);
        }
    };

    useEffect(() => {
        if (activeTab === 'rates' && myHotel) {
            fetchRates();
        }
    }, [activeTab, myHotel]);

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'hotel_admin' && user.role !== 'super_admin'))) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const totalRooms = 20;

    const myReservations = useMemo(() => {
        if (!myHotel) return [];
        return bookings.filter((b: any) => b.hotelId === myHotel.id);
    }, [bookings, myHotel]);

    const dashboardStats = useMemo(() => {
        if (!myHotel) return null;
        const today = new Date().toDateString();
        
        const todayBookings = myReservations.filter((b: any) => new Date(b.createdAt).toDateString() === today);
        const checkInsToday = myReservations.filter((b: any) => new Date(b.checkIn).toDateString() === today);
        const checkOutsToday = myReservations.filter((b: any) => new Date(b.checkOut).toDateString() === today);
        
        const checkedInCount = myReservations.filter((b: any) => b.status === "Checked-in" || b.status === "Confirmed").length;
        const occupancy = Math.round((checkedInCount / totalRooms) * 100);
        
        const revenueToday = todayBookings.reduce((acc: number, b: any) => acc + (b.totalPrice || 0), 0);
        const revenueMonth = myReservations.reduce((acc: number, b: any) => acc + (b.totalPrice || 0), 0);

        return {
            occupancy,
            revenueToday,
            revenueMonth,
            activeCount: myReservations.filter(b => b.status === "Confirmed" || b.status === "Checked-in").length,
            checkInsToday: checkInsToday.length,
            checkOutsToday: checkOutsToday.length
        };
    }, [myReservations, myHotel, totalRooms]);

    const revenueGraphData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            const dailyRevenue = myReservations
                .filter(b => new Date(b.createdAt).toDateString() === date.toDateString())
                .reduce((acc, b) => acc + (b.totalPrice || 0), 0);
            data.push({ day: dayName, revenue: dailyRevenue });
        }
        return data;
    }, [myReservations]);

    const handleCheckIn = async (bookingId: number) => {
        try {
            setActionLoading(bookingId);
            await bookingApi.updateBooking(bookingId, { status: "Checked-in" });
            await fetchData();
        } catch (err) {
            alert("Check-in failed: " + err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRateUpdate = async (roomId: number, date: string, price: string) => {
        const newPrice = parseFloat(price);
        if (isNaN(newPrice)) return;
        
        try {
            setActionLoading(`${roomId}-${date}`);
            await dailyRateApi.updateRate({
                roomId,
                date,
                price: newPrice
            });
            await fetchRates(); // Refresh calendar
        } catch (err) {
            alert("Failed to update price");
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!myHotel) return;
        try {
            setLoading(true);
            await hotelApi.addRoom(myHotel.id, roomFormData);
            setIsAddRoomModalOpen(false);
            setRoomFormData({
                name: "",
                bedConfiguration: "King Bed",
                pricePerNight: "",
                maxOccupancy: "2",
                sizeM2: "30",
                amenities: ["wifi", "ac"]
            });
            await fetchData();
        } catch (err) {
            alert("Failed to add room: " + err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (!myHotel || !confirm("Bhai, pakka delete karna hai? Ye wapas nahi aayega.")) return;
        try {
            setActionLoading(roomId);
            await hotelApi.deleteRoom(myHotel.id, roomId);
            await fetchData();
        } catch (err) {
            alert("Failed to delete room: " + err);
        } finally {
            setActionLoading(null);
        }
    };

    if (authLoading || (loading && !hotels.length)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const navItems: { id: TabType; label: string; icon: any }[] = [
        { id: "home", label: "Dashboard", icon: LayoutDashboard },
        { id: "rates", label: "Rates & Availability", icon: Calendar },
        { id: "promotions", label: "Discounts & Offers", icon: Percent },
        { id: "reservations", label: "Bookings", icon: BookOpen },
        { id: "property", label: "Hotel Info", icon: Hotel },
        { id: "performance", label: "Sales Report", icon: TrendingUp },
        { id: "inbox", label: "Messages", icon: Mailbox },
        { id: "reviews", label: "Guest Reviews", icon: MessageSquare },
        { id: "finance", label: "Earnings", icon: Wallet },
        { id: "analytics", label: "Stats", icon: BarChart3 },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const renderContent = () => {
        if (!dashboardStats) return null;

        switch(activeTab) {
            case "home":
                return (
                    <div className="space-y-8 animate-in fade-in duration-500 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Today's Occupancy</p>
                                <h3 className="text-3xl font-black text-blue-600">{dashboardStats.occupancy}%</h3>
                                <div className="mt-4 w-full bg-blue-50 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${dashboardStats.occupancy}%` }} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Revenue Today</p>
                                <h3 className="text-3xl font-black text-black">₹{dashboardStats.revenueToday.toLocaleString()}</h3>
                                <p className="text-[11px] font-black text-emerald-600 mt-2">This Month: ₹{dashboardStats.revenueMonth.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Active Bookings</p>
                                <h3 className="text-3xl font-black text-black">{dashboardStats.activeCount}</h3>
                                <p className="text-[11px] font-black text-black mt-2">Current or upcoming</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Check-ins</p>
                                        <h3 className="text-xl font-black text-blue-600">{dashboardStats.checkInsToday}</h3>
                                    </div>
                                    <div className="border-l border-blue-100 pl-4">
                                        <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Check-outs</p>
                                        <h3 className="text-xl font-black text-amber-600">{dashboardStats.checkOutsToday}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-blue-100 flex items-center justify-between">
                                <h3 className="text-lg font-black text-black tracking-tight uppercase italic">Today's Arrivals</h3>
                                <button onClick={() => setActiveTab("reservations")} className="text-xs font-black text-blue-600 border-b border-blue-600">VIEW FULL LIST</button>
                            </div>
                            <table className="w-full">
                                <thead className="bg-blue-50/30">
                                    <tr>
                                        <th className="px-8 py-4 text-[11px] font-black uppercase text-black text-left">Guest Name</th>
                                        <th className="px-8 py-4 text-[11px] font-black uppercase text-black text-left">Room Type</th>
                                        <th className="px-8 py-4 text-[11px] font-black uppercase text-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-50">
                                    {myReservations.filter((b: any) => b.status === "Confirmed").map((res: any) => (
                                        <tr key={res.id}>
                                            <td className="px-8 py-5">
                                                <p className="font-black text-black">{res.guestName}</p>
                                                <p className="text-[10px] font-black text-black opacity-50 uppercase tracking-widest">ID: {res.id}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-black text-black">{res.roomType}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => handleCheckIn(res.id)}
                                                    disabled={actionLoading === res.id}
                                                    className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-700 transition-colors tracking-widest disabled:opacity-50"
                                                >
                                                    {actionLoading === res.id ? "PROCESSING..." : "CHECK-IN NOW"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {myReservations.filter(b => b.status === "Confirmed").length === 0 && (
                                        <tr><td colSpan={3} className="py-20 text-center text-black opacity-30 font-black uppercase text-[11px] tracking-widest">No more arrivals for today</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 pb-10">
                            <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-md font-black text-black uppercase italic">Active Promotions</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm"><Percent className="w-5 h-5" /></div>
                                            <div>
                                                <p className="font-black text-black text-sm">Long Stay Discount</p>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase">20% OFF • Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-md font-black text-black uppercase italic">Revenue Insight</h3>
                                    <BarChart3 className="w-5 h-5 text-black opacity-20" />
                                </div>
                                <div className="flex items-end gap-3 h-32 justify-between px-2">
                                    {revenueGraphData.map((data, i) => {
                                        const maxRevenue = Math.max(...revenueGraphData.map(d => d.revenue), 1000);
                                        const height = (data.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={i} className="flex-1 group relative flex flex-col items-center gap-2">
                                                <div className="bg-blue-50 group-hover:bg-blue-600 transition-all rounded-t-lg w-full" style={{ height: `${Math.max(height, 5)}%` }} />
                                                <span className="text-[8px] font-black text-black opacity-30 uppercase">{data.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "rates":
                return (
                    <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden text-left animate-in fade-in">
                        <div className="px-8 py-6 border-b border-blue-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-black uppercase italic tracking-tighter">Calendar & Rates</h3>
                                <p className="text-[11px] font-black text-black opacity-50 uppercase tracking-widest">Update your prices for the next 7 days</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-blue-50/30">
                                    <tr>
                                        <th className="px-8 py-5 text-[11px] font-black uppercase text-black border-r border-blue-100 sticky left-0 bg-[#F8F9FA] z-10">Room Type</th>
                                        {[...Array(7)].map((_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + i);
                                            return (
                                                <th key={i} className="px-8 py-5 text-[11px] font-black uppercase text-black text-center border-r border-blue-100 min-w-[140px]">
                                                    {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-50">
                                    {myHotel?.rooms?.length > 0 ? myHotel.rooms.map((room: any) => (
                                        <tr key={room.id}>
                                            <td className="px-8 py-8 border-r border-blue-100 sticky left-0 bg-white z-10 font-black text-black text-sm">
                                                {room.name}
                                                <p className="text-[10px] opacity-30 mt-1 uppercase">Base: ₹{room.pricePerNight}</p>
                                            </td>
                                            {[...Array(7)].map((_, i) => {
                                                const date = new Date();
                                                date.setDate(date.getDate() + i);
                                                const dateStr = date.toISOString().split('T')[0];
                                                const existingRate = dailyRates.find(r => r.roomId === room.id && r.date.split('T')[0] === dateStr);
                                                const isUpdating = actionLoading === `${room.id}-${dateStr}`;

                                                return (
                                                    <td key={i} className="px-4 py-8 border-r border-blue-50 hover:bg-blue-50 transition-colors">
                                                        <div className="space-y-3">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-black opacity-30 italic">₹</span>
                                                                <input 
                                                                    className={cn(
                                                                        "w-full pl-6 pr-3 py-2 bg-white border border-blue-200 rounded-xl font-black text-[12px] text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all",
                                                                        isUpdating && "opacity-50"
                                                                    )}
                                                                    defaultValue={existingRate?.price || room.pricePerNight}
                                                                    onBlur={(e) => handleRateUpdate(room.id, dateStr, e.target.value)}
                                                                    disabled={isUpdating}
                                                                />
                                                            </div>
                                                            {isUpdating && <p className="text-[8px] font-black text-blue-600 uppercase animate-pulse text-center">Saving...</p>}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="py-20 text-center font-black text-black opacity-30 uppercase tracking-widest">No rooms found. Please add rooms in Hotel Info.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "settings":
                return (
                    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 text-left">
                        <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm space-y-10">
                            <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">Settings & Configuration</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center gap-4 hover:bg-blue-100 transition-all group text-left w-full">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                        <LifeBuoy className="w-7 h-7" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-black uppercase text-xs tracking-widest">Help Center</p>
                                        <p className="text-[10px] font-black text-black opacity-40 mt-1">Contact Support & FAQs</p>
                                    </div>
                                </button>
                                
                                <button className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-4 hover:bg-slate-100 transition-all group text-left w-full">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-black uppercase text-xs tracking-widest">Security</p>
                                        <p className="text-[10px] font-black text-black opacity-40 mt-1">Change Password & Keys</p>
                                    </div>
                                </button>
                            </div>

                            <div className="pt-10 border-t border-blue-50">
                                <button 
                                    onClick={() => logout()}
                                    className="w-full p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center justify-center gap-4 hover:bg-red-100 transition-all group"
                                >
                                    <LogOut className="w-6 h-6 text-red-500 group-hover:translate-x-1 transition-transform" />
                                    <span className="font-black text-red-600 uppercase text-sm tracking-widest">Terminate Session (Logout)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "reservations":
                return (
                    <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden text-left animate-in slide-in-from-bottom-4">
                        <div className="px-8 py-6 border-b border-blue-100 text-left">
                            <h3 className="text-lg font-black text-black tracking-tight uppercase italic">All Bookings</h3>
                        </div>
                        <table className="w-full">
                            <thead className="bg-blue-50/30">
                                <tr>
                                    <th className="px-8 py-4 text-[11px] font-black uppercase text-black text-left">Guest & Room</th>
                                    <th className="px-8 py-4 text-[11px] font-black uppercase text-black text-left">Stay Dates</th>
                                    <th className="px-8 py-4 text-[11px] font-black uppercase text-black text-left">Status</th>
                                    <th className="px-8 py-4 text-[11px] font-black uppercase text-black text-right">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {myReservations.map((res: any) => (
                                    <tr key={res.id}>
                                        <td className="px-8 py-5">
                                            <p className="font-black text-black">{res.guestName}</p>
                                            <p className="text-[10px] font-black text-black opacity-50 uppercase tracking-widest">{res.roomType}</p>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-black">
                                            {new Date(res.checkIn).toLocaleDateString()} - {new Date(res.checkOut).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 bg-blue-50 text-blue-600"
                                            )}>{res.status}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <p className="font-black text-black">₹{res.totalPrice.toLocaleString()}</p>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase">Paid</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case "property":
                return (
                    <div className="space-y-8 animate-in fade-in pb-20">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                            <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm space-y-8">
                                <h3 className="text-xl font-black text-black uppercase italic tracking-tighter">Hotel Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-2">Hotel Name</label>
                                        <input className="w-full px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-black focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all" defaultValue={myHotel?.name} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-2">Full Address</label>
                                        <textarea className="w-full px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-black focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all min-h-[100px]" defaultValue={`${myHotel?.address || ""}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm space-y-8">
                                <h3 className="text-xl font-black text-black uppercase italic tracking-tighter">Pricing & Rating</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-2">Base Price (₹)</label>
                                        <input type="number" className="w-full px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-black focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all" defaultValue={myHotel?.pricePerNight} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-2">Star Rating</label>
                                        <select className="w-full px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-black focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none" defaultValue={myHotel?.starRating}>
                                            <option value={3}>3 Stars</option>
                                            <option value={4}>4 Stars</option>
                                            <option value={5}>5 Stars</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features & Sections Management */}
                        <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm text-left">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">Features & Sections</h3>
                                    <p className="text-[11px] font-black text-black opacity-30 uppercase tracking-widest mt-1">Enable or disable premium sections on your public page</p>
                                </div>
                                <button className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    SAVE CHANGES
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {/* Dining Section */}
                                <div className="p-6 rounded-3xl border border-blue-50 bg-blue-50/20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">🍽️</div>
                                            <span className="font-black text-black uppercase text-xs">Dining & Buffet</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={myHotel?.dining?.enabled} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Show your in-house restaurants, menus, and dining hours to guests.</p>
                                </div>

                                {/* Wellness Section */}
                                <div className="p-6 rounded-3xl border border-blue-50 bg-blue-50/20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">🧘</div>
                                            <span className="font-black text-black uppercase text-xs">Wellness & Spa</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={myHotel?.wellness?.enabled} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Highlight your gym, spa, pool, and other relaxation facilities.</p>
                                </div>

                                {/* FAQ Section */}
                                <div className="p-6 rounded-3xl border border-blue-50 bg-blue-50/20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">❓</div>
                                            <span className="font-black text-black uppercase text-xs">Guest FAQs</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={myHotel?.faqs?.length > 0} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Answer common questions about parking, pets, and airport transfers.</p>
                                </div>

                                {/* Safety Section */}
                                <div className="p-6 rounded-3xl border border-blue-50 bg-blue-50/20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">🛡️</div>
                                            <span className="font-black text-black uppercase text-xs">Safety & Security</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={myHotel?.safety?.length > 0} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Inform guests about your safety protocols and 24/7 security.</p>
                                </div>
                            </div>
                        </div>

                        {/* Room Management Section */}
                        <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm text-left">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">Room Inventory</h3>
                                    <p className="text-[11px] font-black text-black opacity-30 uppercase tracking-widest mt-1">Manage types, pricing, and details for each room</p>
                                </div>
                                <button 
                                    onClick={() => setIsAddRoomModalOpen(true)}
                                    className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    ADD NEW ROOM
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myHotel?.rooms?.length > 0 ? myHotel.rooms.map((room: any) => (
                                    <div key={room.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-black text-black text-lg">{room.name}</h4>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{room.bedConfiguration} • {room.sizeM2}m²</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-black">₹{room.pricePerNight}</p>
                                                <p className="text-[9px] font-black text-black opacity-30 uppercase">per night</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {room.amenities?.map((a: string) => (
                                                <span key={a} className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-black opacity-50 uppercase border border-slate-100">{a}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="flex-1 py-3 bg-white border border-slate-200 text-black font-black text-[10px] uppercase rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all">EDIT INFO</button>
                                            <button 
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="w-12 h-12 bg-white border border-slate-200 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all"
                                            >
                                                {actionLoading === room.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                                        <Bed className="w-10 h-10 text-slate-300 mb-3" />
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">No rooms added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Room Modal */}
                        <AnimatePresence>
                            {isAddRoomModalOpen && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsAddRoomModalOpen(false)}
                                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                    />
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                                    >
                                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <div>
                                                <h3 className="text-2xl font-black text-black italic tracking-tighter uppercase">New Room Type</h3>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Configure inventory</p>
                                            </div>
                                            <button onClick={() => setIsAddRoomModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddRoom} className="p-10 space-y-6">
                                            <div className="space-y-2 text-left">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Name</label>
                                                <input 
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-black outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                                                    placeholder="e.g. Presidential Suite"
                                                    value={roomFormData.name}
                                                    onChange={e => setRoomFormData({...roomFormData, name: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                                    <input 
                                                        type="number"
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-black outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                                                        placeholder="8500"
                                                        value={roomFormData.pricePerNight}
                                                        onChange={e => setRoomFormData({...roomFormData, pricePerNight: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Guests</label>
                                                    <input 
                                                        type="number"
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-black outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                                                        placeholder="2"
                                                        value={roomFormData.maxOccupancy}
                                                        onChange={e => setRoomFormData({...roomFormData, maxOccupancy: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Size (m²)</label>
                                                    <input 
                                                        type="number"
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-black outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                                                        placeholder="45"
                                                        value={roomFormData.sizeM2}
                                                        onChange={e => setRoomFormData({...roomFormData, sizeM2: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Beds</label>
                                                    <select 
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-black outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all appearance-none"
                                                        value={roomFormData.bedConfiguration}
                                                        onChange={e => setRoomFormData({...roomFormData, bedConfiguration: e.target.value})}
                                                    >
                                                        <option>King Bed</option>
                                                        <option>Queen Bed</option>
                                                        <option>Twin Beds</option>
                                                        <option>Single Bed</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                                                SAVE ROOM TYPE <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case "onboarding":
                return <OnboardingForm onComplete={fetchData} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-blue-100 shadow-sm">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                        <p className="text-black font-black uppercase text-[11px] tracking-[0.5em]">Loading {activeTab}...</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] font-sans" style={{ zoom: '90%' }}>
            {/* Sidebar */}
            <aside className="w-80 bg-blue-50 border-r border-blue-100 flex flex-col sticky top-0 h-screen z-50">
                <div className="p-8 border-b border-blue-100">
                    <h1 className="text-2xl font-black tracking-tighter text-black italic">GetHotel<span className="text-blue-600">.Partner</span></h1>
                </div>

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                                    isActive 
                                        ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30" 
                                        : "text-black opacity-40 hover:bg-white hover:opacity-100"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "opacity-100")} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-blue-100 text-center">
                    <p className="text-[9px] font-black text-black opacity-20 uppercase tracking-widest">© 2026 GetHotel Extranet</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 py-8 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10 text-left">
                    <div className="flex-1">
                        {activeTab === 'home' && (
                            <div className="animate-in slide-in-from-top-4 duration-500">
                                <h2 className="text-4xl font-black text-black tracking-tight italic">Welcome, {myHotel?.name}</h2>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-black font-black text-[11px] uppercase tracking-widest opacity-30">Today's Summary • System Online</p>
                                </div>
                            </div>
                        )}
                        {activeTab !== 'home' && (
                            <h2 className="text-2xl font-black text-black tracking-tight uppercase italic">{activeTab.replace('-', ' ')}</h2>
                        )}
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                        <div className="relative group hidden xl:block">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-20 group-focus-within:opacity-100 transition-opacity" />
                            <input type="text" placeholder="Search bookings..." className="pl-14 pr-8 py-4 bg-white border border-blue-100 rounded-3xl w-80 focus:outline-none focus:ring-4 focus:ring-blue-100 font-black text-xs shadow-sm transition-all" />
                        </div>
                        <button className="p-4 bg-white border border-blue-100 rounded-3xl text-black shadow-sm hover:bg-blue-50 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button className="flex items-center gap-3 pl-2 pr-6 py-2 bg-white border border-blue-100 rounded-3xl shadow-sm hover:border-blue-300 transition-all">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">SA</div>
                            <div className="text-left hidden lg:block">
                                <p className="text-[9px] font-black text-black opacity-30 uppercase leading-none mb-1">User Profile</p>
                                <p className="text-[11px] font-black text-black leading-none">{user?.name}</p>
                            </div>
                        </button>
                    </div>
                </header>

                <div className="animate-in slide-in-from-bottom-4 duration-700">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

function OnboardingForm({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        tagline: "",
        description: "",
        city: "",
        address: "",
        pricePerNight: "",
        starRating: "3",
        thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"],
        amenities: ["wifi", "pool"]
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await hotelApi.createHotel(formData);
            onComplete();
        } catch (err) {
            alert("Failed to create hotel: " + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-left">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Property Onboarding
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Register your <span className="text-blue-600">Property</span></h2>
                <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">Step {step} of 3 • {step === 1 ? 'Basic Details' : step === 2 ? 'Location & Value' : 'Final Review'}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-50">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Property Name</label>
                            <input 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                placeholder="e.g. The Grand Palace"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Short Tagline</label>
                            <input 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                placeholder="e.g. Luxury redefined in Mumbai"
                                value={formData.tagline}
                                onChange={e => setFormData({...formData, tagline: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
                            <textarea 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none min-h-[120px]"
                                placeholder="Describe your property's unique charm..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                required
                            />
                        </div>
                        <button type="button" onClick={() => setStep(2)} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                            CONTINUE TO LOCATION <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">City</label>
                                <input 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                    placeholder="Mumbai"
                                    value={formData.city}
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Star Rating</label>
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none appearance-none"
                                    value={formData.starRating}
                                    onChange={e => setFormData({...formData, starRating: e.target.value})}
                                >
                                    <option value="3">3 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="5">5 Stars</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Address</label>
                            <input 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                placeholder="123 Marine Drive, Mumbai"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Starting Price (₹/night)</label>
                            <input 
                                type="number"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                placeholder="5000"
                                value={formData.pricePerNight}
                                onChange={e => setFormData({...formData, pricePerNight: e.target.value})}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">BACK</button>
                            <button type="button" onClick={() => setStep(3)} className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">REVIEW & SUBMIT <ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><CheckCircle2 className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Ready to Launch</p>
                                    <p className="font-black text-slate-900 text-lg">{formData.name}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-bold italic">By clicking "Register Property", you agree to our terms for elite hotel partners. Your property will be live instantly.</p>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">EDIT</button>
                            <button type="submit" disabled={loading} className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>REGISTER PROPERTY <Check className="w-5 h-5" /></>}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

