

import { useState, useEffect, useRef } from "react";
import { useNavigate as useRouter, useParams } from 'react-router-dom';;
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
                className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[48px] overflow-hidden border border-slate-200 print:shadow-none print:rounded-none print:border-none"
            >
                {/* Header */}
                <div className="p-12 md:p-16 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start gap-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
                    
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase mb-2">GetHotel<span className="text-blue-500">Stays</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Official Booking Receipt</p>
                        
                        <div className="mt-12 space-y-2 opacity-80">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                <MapPin className="w-3 h-3 text-blue-400" /> Sector 62, Noida, India
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                <Globe className="w-3 h-3 text-blue-400" /> support@gethotelstays.com
                            </div>
                        </div>
                    </div>

                    <div className="text-right relative z-10">
                        <div className="inline-block px-4 py-2 bg-white/10 rounded-xl border border-white/10 mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest">Invoice #GH-{booking.id + 10000}</p>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter mb-2 italic">₹{booking.totalPrice.toLocaleString()}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-end gap-2">
                            <ShieldCheck className="w-4 h-4" /> {booking.paymentStatus === 'paid' ? 'Fully Paid' : 'Payment Verified'}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-12 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-16 border-b border-slate-100">
                    {/* Guest Info */}
                    <div>
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User className="w-4 h-4" /> Guest Information
                        </h3>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900">{booking.guestFirstName} {booking.guestLastName}</p>
                            <p className="text-sm font-bold text-slate-500">{booking.guestEmail}</p>
                            <p className="text-sm font-bold text-slate-500">{booking.guestPhone}</p>
                        </div>
                        {booking.isBusiness && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Business GST Details</p>
                                <p className="text-xs font-black text-slate-700">{booking.companyName}</p>
                                <p className="text-[10px] font-bold text-slate-500">GST: {booking.gstNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Stay Info */}
                    <div>
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Property Details
                        </h3>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900">{booking.hotel.name}</p>
                            <p className="text-sm font-bold text-slate-500">{booking.hotel.address}, {booking.hotel.city}</p>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                                <p className="text-xs font-black text-slate-700">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                                <p className="text-xs font-black text-slate-700">{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Table */}
                <div className="p-12 md:p-16">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="text-center py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                                <th className="text-right py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {roomDetails.map((item: any, idx: number) => (
                                <tr key={idx} className="group">
                                    <td className="py-8">
                                        <p className="text-base font-black text-slate-900 mb-1">{item.name}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Luxury Suite Accommodation</p>
                                    </td>
                                    <td className="py-8 text-center">
                                        <span className="px-4 py-2 bg-slate-50 rounded-xl font-black text-sm text-slate-700">{item.quantity} Rooms</span>
                                    </td>
                                    <td className="py-8 text-right font-black text-slate-900 text-lg">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div className="mt-12 ml-auto max-w-sm space-y-4">
                        <div className="flex justify-between items-center text-slate-500 font-bold text-sm">
                            <span>{booking.couponCode ? "Promo Stay Amount" : "Room Charges"}</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {gstRate > 0 && (
                            <div className="flex justify-between items-center text-slate-500 font-bold text-sm">
                                <span>GST ({Math.round(gstRate * 100)}%)</span>
                                <span>+{formatPrice(tax)}</span>
                            </div>
                        )}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Online (12%)</span>
                                </div>
                                <span className="text-sm font-black text-emerald-600 italic">{formatPrice(Math.round(booking.totalPrice * 0.12))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payable at Hotel (88%)</span>
                                </div>
                                <span className="text-base font-black text-slate-900 italic">{formatPrice(booking.totalPrice - Math.round(booking.totalPrice * 0.12))}</span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Total Price</span>
                            <span className="text-3xl font-black text-blue-600 tracking-tighter italic">₹{booking.totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-12 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                            <CreditCard className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                            <p className="text-xs font-black text-slate-700">Razorpay Secure Online</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">Thank you for choosing GetHotelStays.</p>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Terms & Conditions Apply • Non-Refundable within 24h of check-in</p>
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
