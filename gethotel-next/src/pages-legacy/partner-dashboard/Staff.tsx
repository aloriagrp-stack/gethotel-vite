'use client';


import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    Users, UserPlus, Trash2, Loader2, 
    ShieldCheck, User, Mail, Shield,
    CheckCircle2, XCircle, Plus, Search,
    MoreVertical, ChevronRight, X, Save,
    Smartphone, Lock, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

export default function PartnerStaffPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "receptionist",
        password: ""
    });

    const fetchStaff = async () => {
        try {
            const res = await hotelApi.getMyHotels({ light: true });
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                const staffRes = await hotelApi.getStaff(myHotel.id);
                if (staffRes.success) {
                    setStaff(staffRes.data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch staff", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchStaff();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await hotelApi.addStaff(hotel.id, formData);
            if (res.success) {
                setStaff(prev => [...prev, res.data]);
                setIsModalOpen(false);
                setFormData({ name: "", email: "", role: "receptionist", password: "" });
            }
        } catch (err) {
            alert("Failed to add staff member. They may already be added.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveStaff = async (staffId: number) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        try {
            const res = await hotelApi.removeStaff(hotel.id, staffId);
            if (res.success) {
                setStaff(prev => prev.filter(s => s.id !== staffId));
            }
        } catch (err) {
            alert("Failed to remove staff");
        }
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const roles = [
        { id: 'manager', label: 'Manager', description: 'Full access to property settings', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'receptionist', label: 'Receptionist', description: 'Bookings and Front Desk only', icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'accountant', label: 'Accountant', description: 'Payments and Payouts access', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Management</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage internal team access and assign property roles</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3.5 bg-blue-600 text-white text-xs font-bold rounded-none hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> Add Team Member
                    </button>
                </div>
            </div>

            {/* Role Guide (Quick Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map(role => {
                    const Icon = role.icon;
                    return (
                        <div key={role.id} className="bg-white p-6 rounded-none border border-slate-200 shadow-sm flex items-start gap-4">
                            <div className={cn("w-12 h-12 rounded-none flex items-center justify-center shrink-0", role.bg, role.color)}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{role.label}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed uppercase tracking-widest">{role.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Staff Directory */}
            <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" /> Internal Team Directory
                    </h3>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.length} Active Members</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staff.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-none bg-slate-100 flex items-center justify-center shrink-0">
                                                {member.user.profileImage ? (
                                                    <img src={member.user.profileImage} alt="" className="w-full h-full object-cover rounded-none" />
                                                ) : (
                                                    <User className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{member.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border",
                                            member.role === 'manager' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                            member.role === 'receptionist' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                            "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-slate-500">
                                            {new Date(member.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => handleRemoveStaff(member.id)}
                                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-none border border-slate-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center flex flex-col items-center">
                                        <Users className="w-16 h-16 text-slate-100 mb-4" />
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">No staff members added yet</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-none shadow-2xl overflow-hidden animate-slide-up">
                        <form onSubmit={handleAddStaff}>
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Internal Team</span>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Add Team Member</h2>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-none flex items-center justify-center text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Name</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" required placeholder="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="email" required placeholder="email@hotel.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporary Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="password" required placeholder="Staff@123"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Role</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {['manager', 'receptionist', 'accountant'].map((r) => (
                                            <button
                                                key={r} type="button"
                                                onClick={() => setFormData({...formData, role: r})}
                                                className={cn(
                                                    "py-3 rounded-none text-[9px] font-black uppercase tracking-widest border transition-all",
                                                    formData.role === r ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200"
                                                )}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full py-5 bg-blue-600 text-white rounded-none font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Create Staff Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
