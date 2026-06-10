import { useState, useEffect } from 'react';
import { useNavigate as useRouter, useParams } from 'react-router-dom';
import { 
    ChevronLeft, MapPin, Calendar, 
    ShieldCheck, QrCode, MessageSquare, 
    ArrowRight, Info, CreditCard, Clock, Loader2,
    X, Phone, Mail, CheckCircle2
} from "lucide-react";
import Image from "@/components/common/Image";
import Loader from "@/components/common/Loader";
import { Link } from "react-router-dom";
import { bookingApi } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";

export default function BookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [messageText, setMessageText] = useState("");

    const handleGetMobileKey = () => {
        setShowKeyModal(true);
        setScanning(true);
        setScanSuccess(false);
        setTimeout(() => {
            setScanning(false);
            setScanSuccess(true);
        }, 3000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        setMessageSent(true);
        setMessageText("");
        setTimeout(() => {
            setMessageSent(false);
            setShowContactModal(false);
        }, 2200);
    };

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!params.id) return;
            try {
                const res = await bookingApi.getBooking(params.id);
                const bookingData = res.data || res;
                if (bookingData) {
                    setBooking(bookingData);
                }
            } catch (err) {
                console.error("Failed to load booking details via getBooking, trying list fallback:", err);
                try {
                    const listRes = await bookingApi.getMyBookings();
                    const bookingsList = listRes.data || [];
                    const found = bookingsList.find((b: any) => String(b.id) === String(params.id));
                    if (found) {
                        setBooking(found);
                    }
                } catch (fallbackErr) {
                    console.error("Fallback lookup failed:", fallbackErr);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBookingDetails();
    }, [params.id]);

    const hotelName = booking?.hotel?.name || "Cottage Yes Please";
    const hotelCity = booking?.hotel?.city || "New Delhi";
    const hotelAddress = booking?.hotel?.address || "1843, Laxmi Narain Street, Rajguru Marg, Chuna Mandi, Pahar Ganj";
    const hotelThumbnail = booking?.hotel?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&w=800&q=75";
    const checkInDate = booking ? formatDate(booking.checkIn) : "16 May 2026";
    const checkOutDate = booking ? formatDate(booking.checkOut) : "17 May 2026";
    const totalPrice = booking ? formatPrice(booking.totalPrice) : "₹2,940";
    const bookingId = booking ? `#GH-${booking.id + 10000}` : `#GH-10011`;
    const roomName = booking?.room?.name || "Double Deluxe Room";
    const status = booking?.status || "confirmed";
    const totalPriceVal = booking?.totalPrice || 2940;
    const amountPaidVal = booking ? (booking.amountPaid ?? 0) : Math.round(totalPriceVal * 0.12);
    const payAtHotelVal = Math.max(0, totalPriceVal - amountPaidVal);
    const paymentStatus = booking?.paymentStatus || (booking ? (amountPaidVal === 0 ? 'pending' : (amountPaidVal >= totalPriceVal ? 'paid' : 'partial')) : 'partial');

    if (loading) {
        return (
            <Loader variant="fullscreen" text="Loading stay details..." />
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto animate-fade-in">
                <button 
                    onClick={() => router("/my-bookings")}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Journeys
                </button>

                {/* Stay Header Card */}
                <div className="flex flex-col sm:flex-row gap-6 items-start pb-8 border-b border-slate-100 mb-8">
                    {/* Small Image Box */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 shadow-sm border border-slate-100">
                        <img src={hotelThumbnail} alt={hotelName} className="w-full h-full object-cover" />
                    </div>

                    {/* Stay Info Column */}
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-2.5 py-0.5 bg-brand-50 text-brand-600 text-[9px] font-black uppercase tracking-widest rounded border border-brand-100">
                                Reservation {status}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                                paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                paymentStatus === 'partial' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                                {paymentStatus === 'paid' ? 'Fully Paid' :
                                 paymentStatus === 'partial' ? '12% Deposit Paid' :
                                 'Pay At Hotel'}
                            </span>
                            <span className="text-slate-400 text-[10px] font-bold font-mono">ID: {bookingId}</span>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight uppercase leading-tight italic">
                            {hotelName}
                        </h1>
                        
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            {roomName}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                            <p className="text-xs text-slate-500 font-bold flex items-start gap-1 max-w-xl">
                                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                                <span>{hotelAddress}</span>
                            </p>
                            <button 
                                onClick={() => {
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelName + ", " + hotelAddress)}`, '_blank');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors shrink-0"
                            >
                                <MapPin className="w-3 h-3 text-slate-500" />
                                Show on Map
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stay Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Dates & Quick Actions block */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Date</p>
                                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-brand-600" /> {checkInDate}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exit Date</p>
                                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-brand-600" /> {checkOutDate}
                                </p>
                            </div>
                        </div>

                        {/* Room and Guests Info */}
                        <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Info</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room Type</p>
                                    <p className="text-sm font-bold text-slate-900">{roomName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                                    <p className="text-sm font-bold text-slate-900">{booking?.totalGuests || 2} Guest(s)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details block */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Total Amount</span>
                                <span className="font-black text-slate-900">{formatPrice(totalPriceVal)}</span>
                            </div>

                            {paymentStatus === 'paid' && (
                                <>
                                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200">
                                        <span className="text-emerald-600 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Paid Fully Online
                                        </span>
                                        <span className="font-black text-emerald-600">{formatPrice(totalPriceVal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-2">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Remaining (Pay at Hotel)</span>
                                        <span className="font-black text-slate-900">₹0</span>
                                    </div>
                                </>
                            )}

                            {paymentStatus === 'partial' && (
                                <>
                                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200">
                                        <span className="text-emerald-600 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Paid Online (12% Deposit)
                                        </span>
                                        <span className="font-black text-emerald-600">{formatPrice(amountPaidVal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-2">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Remaining (Pay at Hotel)</span>
                                        <span className="font-black text-slate-900">{formatPrice(payAtHotelVal)}</span>
                                    </div>
                                </>
                            )}

                            {paymentStatus === 'pending' && (
                                <>
                                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200">
                                        <span className="text-amber-600 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                            Pay Full Amount at Hotel
                                        </span>
                                        <span className="font-black text-amber-600">{formatPrice(totalPriceVal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-2">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Paid Online</span>
                                        <span className="font-black text-slate-900">₹0</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Guest Contact & Special Requests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Guest Contact Info */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Contact Info</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guest Name</p>
                                <p className="text-sm font-bold text-slate-900 uppercase">
                                    {booking?.guestFirstName || "Not Provided"} {booking?.guestLastName || ""}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                                <p className="text-sm font-bold text-slate-900">{booking?.guestPhone || "Not Provided"}</p>
                            </div>
                            <div className="col-span-1 sm:col-span-2 space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                <p className="text-sm font-bold text-slate-900">{booking?.guestEmail || "Not Provided"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Special Requests */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special Requests</h4>
                        <div className="p-4 bg-white/60 border border-slate-100 rounded-xl min-h-[90px]">
                            <p className="text-xs text-slate-600 font-bold leading-relaxed italic">
                                {booking?.specialRequests ? `"${booking.specialRequests}"` : "No special requests provided for this stay."}
                            </p>
                        </div>
                    </div>
                </div>

            {/* Mobile Key NFC Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-100 overflow-hidden">
                        <button 
                            onClick={() => setShowKeyModal(false)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Digital Keyring</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Smart NFC Access Card</p>

                        {scanning ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-6">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75 animate-ping"></span>
                                    <span className="absolute inline-flex h-24 w-24 rounded-full bg-blue-200 opacity-50 animate-ping"></span>
                                    <div className="relative w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                        <Clock className="w-7 h-7 animate-spin" />
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 animate-pulse">Syncing Lock...</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Stand close to {roomName}</p>
                                </div>
                            </div>
                        ) : scanSuccess ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-6">
                                <div className="w-64 h-96 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden border border-slate-700/50 animate-scale-up">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-7 rounded bg-gradient-to-r from-amber-400 to-yellow-200 opacity-80 border border-amber-300"></div>
                                        <QrCode className="w-5 h-5 text-slate-400" />
                                    </div>
                                    
                                    <div className="flex flex-col items-center my-6 space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-pulse">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">NFC Active • Tap Door</span>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-slate-800">
                                        <div>
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Hotel Room</span>
                                            <p className="text-xs font-bold tracking-wide">{roomName}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Guest Key</span>
                                                <p className="text-[10px] font-bold tracking-wide uppercase">{booking?.guestFirstName || "Shriyansh"} {booking?.guestLastName || ""}</p>
                                            </div>
                                            <span className="text-[9px] font-mono text-slate-400">{bookingId}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setShowKeyModal(false)}
                                    className="w-full py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 active:scale-[0.98] transition-all"
                                >
                                    Close Wallet
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Contact Host Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100">
                        <button 
                            onClick={() => setShowContactModal(false)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Contact Stay Host</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Reach out to hotel management directly</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <a 
                                href={`tel:${booking?.hotel?.phone || "9000000000"}`}
                                className="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all text-center group active:scale-[0.98]"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Call Helpline</span>
                            </a>
                            <a 
                                href={`mailto:reservations@gethotelstays.com?subject=Booking ${bookingId} inquiry`}
                                className="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all text-center group active:scale-[0.98]"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Email Support</span>
                            </a>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Send a Direct Message</h4>
                            
                            {messageSent ? (
                                <div className="flex flex-col items-center justify-center py-6 space-y-3 bg-emerald-50 rounded-2xl border border-emerald-100 animate-scale-up">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Message Sent Successfully!</p>
                                    <p className="text-[9px] text-emerald-600 font-bold">The host will reply within 5 minutes.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="space-y-4">
                                    <textarea 
                                        rows={3}
                                        placeholder="Write your request or question here..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all text-xs font-bold"
                                    />
                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4.5 h-4.5" />
                                        Send Instantly
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
}
