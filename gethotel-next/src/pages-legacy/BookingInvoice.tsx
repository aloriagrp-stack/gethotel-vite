'use client';


import { useState, useEffect, useRef } from "react";
import { useNavigate as useRouter, useParams, useSearchParams } from 'react-router-dom';
import { 
    Printer, Download, ShieldCheck, 
    Mail, MapPin, Phone, Globe,
    Building2, Calendar, User, 
    CreditCard, ArrowLeft, Loader2
} from "lucide-react";
import { bookingApi } from "@/lib/api";
import { motion } from "framer-motion";
import { formatPrice, formatDate } from "@/lib/utils";

export default function BookingInvoicePage() {
    const { id } = useParams();
    const router = useRouter();
    const [searchParams] = useSearchParams();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // We'll fetch from my-bookings and find the specific ID
                const res = await bookingApi.getMyBookings();
                if (res.success) {
                    const found = res.data.find((b: any) => b.id === parseInt(id as string));
                    setBooking(found);
                }
            } catch (err) {
                console.error("Failed to fetch invoice data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);
 
    useEffect(() => {
        if (!loading && booking && searchParams.get("print") === "true") {
            const timer = setTimeout(() => {
                window.print();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [loading, booking, searchParams]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    if (!booking) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Invoice Not Found</h2>
            <button onClick={() => router(-1)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold">Go Back</button>
        </div>
    );

    const roomDetails = booking.roomDetails ? JSON.parse(booking.roomDetails) : [];
    const stayNights = (() => {
        try {
            const d1 = new Date(booking.checkIn);
            const d2 = new Date(booking.checkOut);
            const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
            return Math.max(1, Math.round(diff));
        } catch (e) {
            return 1;
        }
    })();
    const totalRoomNights = roomDetails.reduce((sum: number, r: any) => sum + (r.quantity * stayNights), 0) || 1;
    const subtotal18 = booking.totalPrice / 1.18;
    const averagePricePerNight18 = subtotal18 / totalRoomNights;
    
    let subtotal = booking.totalPrice / 1.05;
    let gstRate = 0.05;
    
    if (averagePricePerNight18 > 7500) {
        subtotal = subtotal18;
        gstRate = 0.18;
    } else if (booking.totalPrice / totalRoomNights <= 1000) {
        subtotal = booking.totalPrice;
        gstRate = 0;
    }
    const tax = booking.totalPrice - subtotal;

    return (
        <div className="min-h-screen bg-slate-100/50 py-12 px-4 print:bg-white print:py-0 print:px-0">
            {/* Control Bar */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between print:hidden">
                <button 
                    onClick={() => router(-1)}
                    className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handlePrint}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Printer className="w-4 h-4" /> Print Invoice
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
                    >
                        <Download className="w-4 h-4" /> PDF Download
                    </button>
                </div>
            </div>

            {/* Invoice Main Content */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden border border-slate-100 print:shadow-none print:rounded-none print:border-none"
            >
                {/* Header */}
                <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-blue-600 uppercase">GETHOTEL<span className="text-slate-950">STAYS</span></h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Official Booking Confirmation Receipt</p>
                        
                        <div className="mt-4 space-y-1.5 text-xs text-slate-500 font-medium">
                            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Sector 62, Noida, India</p>
                            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> support@gethotelstays.com</p>
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${
                            booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            booking.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            {booking.paymentStatus === 'paid' ? 'Fully Paid' :
                             booking.paymentStatus === 'partial' ? '12% Deposit Paid' :
                             'Pay At Hotel'}
                        </span>
                        <p className="text-3xl font-black text-slate-950 tracking-tight mt-3 notranslate">{formatPrice(booking.totalPrice)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Invoice #GH-{booking.id + 10000}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-slate-100">
                    {/* Guest Info */}
                    <div className="space-y-4">
                        <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4" /> Guest Information
                        </h3>
                        <div className="space-y-1">
                            <p className="text-base font-black text-slate-900">{booking.guestFirstName} {booking.guestLastName}</p>
                            <p className="text-xs font-bold text-slate-500">{booking.guestEmail}</p>
                            <p className="text-xs font-bold text-slate-500">{booking.guestPhone}</p>
                        </div>
                        {booking.isBusiness && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Business GST Details</p>
                                <p className="font-black text-slate-700">{booking.companyName}</p>
                                <p className="text-slate-500 mt-0.5">GST: {booking.gstNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Stay Info */}
                    <div className="space-y-4">
                        <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Property Details
                        </h3>
                        <div className="space-y-1">
                            <p className="text-base font-black text-slate-900">{booking.hotel.name}</p>
                            <p className="text-xs font-bold text-slate-500">{booking.hotel.address}, {booking.hotel.city}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                                <p className="text-xs font-black text-slate-800">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                                <p className="text-xs font-black text-slate-800">{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Table */}
                <div className="p-8 md:p-12 border-b border-slate-100">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="text-center pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                                <th className="text-right pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {roomDetails.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="py-6">
                                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic mt-0.5">Stay Accommodation</p>
                                    </td>
                                    <td className="py-6 text-center">
                                        <span className="px-3 py-1.5 bg-slate-50 rounded-lg font-black text-slate-700">{item.quantity} Room(s)</span>
                                    </td>
                                    <td className="py-6 text-right font-black text-slate-900 text-sm notranslate">
                                        {formatPrice(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary & Price list */}
                <div className="p-8 md:p-12 bg-slate-50/50 flex justify-end">
                    <div className="w-full max-w-xs space-y-3.5 text-xs">
                        <div className="flex justify-between items-center text-slate-500 font-medium">
                            <span>Room Charges</span>
                            <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                        </div>
                        {gstRate > 0 && (
                            <div className="flex justify-between items-center text-slate-500 font-medium">
                                <span>GST ({Math.round(gstRate * 100)}%)</span>
                                <span className="font-bold text-slate-800">+{formatPrice(tax)}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid Online (12%)</span>
                                <span className="font-black text-emerald-600 italic">{formatPrice(Math.round(booking.totalPrice * 0.12))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payable at Hotel (88%)</span>
                                <span className="font-black text-slate-800 italic">{formatPrice(booking.totalPrice - Math.round(booking.totalPrice * 0.12))}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-950 uppercase tracking-wider">Total Price</span>
                            <span className="text-2xl font-black text-blue-600 tracking-tight italic notranslate">{formatPrice(booking.totalPrice)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer details */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-300" />
                        <span className="font-bold text-slate-500">Secure booking verified via GetHotelStays</span>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="font-bold text-slate-400">Thank you for choosing GetHotelStays.</p>
                        <p className="text-[8px] tracking-wider mt-0.5">Subject to terms & conditions • Present ID at check-in</p>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Branding */}
            <div className="max-w-4xl mx-auto mt-12 text-center opacity-30 print:hidden">
                <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-900">GetHotelStays OTA Platform</p>
            </div>
        </div>
    );
}
