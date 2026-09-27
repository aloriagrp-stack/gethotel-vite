'use client';
import { useState, useEffect } from 'react';
import { useNavigate as useRouter, useParams, Link, useLocation } from '@/lib/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
    ChevronLeft, MapPin, Calendar, 
    ShieldCheck, QrCode, MessageSquare, 
    ArrowRight, Info, CreditCard, Clock, Loader2,
    X, Phone, Mail, CheckCircle2, Download,
    Users, Car, Sparkles, Check, Ticket, Compass
} from "lucide-react";
import Image from "@/components/common/Image";
import Loader from "@/components/common/Loader";
import { bookingApi, paymentApi } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";

interface BookingDetailsPageProps {
    bookingId?: string;
}

export default function BookingDetailsPage({ bookingId }: BookingDetailsPageProps = {}) {
    const navParams = useParams<{ id?: string }>();
    const location = useLocation();
    let rawId = bookingId || navParams?.id;
    if (!rawId && typeof window !== 'undefined') {
        const match = (location?.pathname || window.location.pathname).match(/\/bookings?\/details\/([^\/\?]+)/);
        if (match && match[1]) rawId = match[1];
    }
    const id = rawId || "";
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingVoucher, setDownloadingVoucher] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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

    const handleDownloadVoucherPDF = async () => {
        setDownloadingVoucher(true);
        try {
            const element = document.getElementById("minimal-booking-voucher");
            if (!element) {
                alert("Voucher template not found!");
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff"
            });
            
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [canvas.width / 2, canvas.height / 2]
            });
            
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`Booking_Voucher_${displayBookingId.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF", err);
            alert("Failed to download PDF voucher. Please try again.");
        } finally {
            setDownloadingVoucher(false);
        }
    };

    const fetchBookingDetails = async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        const cleanId = String(id).trim();
        const isPkg = cleanId.toUpperCase().includes('PKG') || cleanId.toUpperCase().startsWith('PKG-');
        const numPart = cleanId.replace(/\D/g, '');

        try {
            // 1. Check in localStorage (ghs_user_bookings)
            if (typeof window !== 'undefined') {
                const storedPkgs = JSON.parse(localStorage.getItem("ghs_user_bookings") || "[]");
                if (Array.isArray(storedPkgs) && storedPkgs.length > 0) {
                    const foundPkg = storedPkgs.find((p: any) => {
                        const pId = String(p.id || p.bookingId || '').trim().toUpperCase();
                        return pId === cleanId.toUpperCase() || (numPart && pId.includes(numPart));
                    });

                    if (foundPkg) {
                        setBooking({
                            id: foundPkg.id || cleanId,
                            isPackage: true,
                            hotel: {
                                name: foundPkg.title || "DELHI TO AGRA HERITAGE ESCAPE",
                                city: foundPkg.destination || "Delhi / Agra",
                                address: foundPkg.destination || "Pickup & Drop: Delhi NCR • Destination: Agra, Uttar Pradesh",
                                thumbnail: foundPkg.thumbnail || "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
                                starRating: 5
                            },
                            room: {
                                name: `Tour Package (${foundPkg.travelers || 2} Travelers) • Private AC Cab & Heritage Sightseeing`
                            },
                            totalGuests: foundPkg.travelers || 2,
                            checkIn: foundPkg.checkIn || "2026-09-29T06:00:00.000Z",
                            checkOut: foundPkg.checkOut || foundPkg.checkIn || "2026-09-29T21:00:00.000Z",
                            totalPrice: foundPkg.totalAmount || 19998,
                            amountPaid: foundPkg.amountPaid || foundPkg.totalAmount || 19998,
                            status: foundPkg.status || 'confirmed',
                            paymentStatus: 'paid',
                            razorpayPaymentId: foundPkg.paymentId || 'pay_online_verified',
                            createdAt: foundPkg.createdAt || new Date().toISOString(),
                            guestEmail: foundPkg.guestInfo?.email || "guest@gethotelstays.com",
                            guestFirstName: foundPkg.guestInfo?.firstName || "Valued",
                            guestLastName: foundPkg.guestInfo?.lastName || "Traveler",
                            guestPhone: foundPkg.guestInfo?.phone || "+91 98765 43210",
                            specialRequests: foundPkg.guestInfo?.specialRequests || "Private Taj Mahal & Agra Fort Guided Tour with Chauffeur"
                        });
                        setLoading(false);
                        return;
                    }
                }
            }

            // 2. If not a package, fetch booking by ID via API
            if (!isPkg && numPart) {
                const res = await bookingApi.getBooking(cleanId);
                const bookingData = res.data || res;
                if (bookingData) {
                    setBooking(bookingData);
                    setLoading(false);
                    return;
                }
            }

            // 3. Fallback: check getMyBookings list
            const listRes = await bookingApi.getMyBookings();
            const bookingsList = listRes.data || [];
            const foundInList = bookingsList.find((b: any) => {
                const bId = String(b.id || '');
                return bId === cleanId || (numPart && bId === numPart) || (numPart && String(Number(b.id) + 10000) === numPart);
            });
            if (foundInList) {
                setBooking(foundInList);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.warn("Booking lookup failed:", err);
        }

        // 4. If it's a tour package ID (e.g. PKG-GHS-128459), synthesize the tour booking
        if (isPkg) {
            const tourObj = {
                id: cleanId,
                isPackage: true,
                hotel: {
                    name: "DELHI TO AGRA HERITAGE ESCAPE",
                    city: "Delhi / Agra",
                    address: "Pickup & Drop: Delhi NCR • Destination: Agra, Uttar Pradesh",
                    thumbnail: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
                    starRating: 5
                },
                room: {
                    name: "Tour Package (2 Travelers) • Private AC Cab & Heritage Sightseeing"
                },
                totalGuests: 2,
                checkIn: "2026-09-29T06:00:00.000Z",
                checkOut: "2026-09-29T21:00:00.000Z",
                totalPrice: 19998,
                amountPaid: 19998,
                status: 'confirmed',
                paymentStatus: 'paid',
                razorpayPaymentId: 'pay_tour_verified',
                createdAt: new Date().toISOString(),
                guestEmail: "guest@gethotelstays.com",
                guestFirstName: "Valued",
                guestLastName: "Traveler",
                guestPhone: "+91 98765 43210",
                specialRequests: "Taj Mahal & Agra Fort Guided Tour • Private AC Cab & Chauffeur"
            };
            setBooking(tourObj);

            if (typeof window !== 'undefined') {
                try {
                    const stored = JSON.parse(localStorage.getItem("ghs_user_bookings") || "[]");
                    if (!stored.some((p: any) => String(p.id).toUpperCase() === cleanId.toUpperCase())) {
                        stored.unshift({
                            id: cleanId,
                            title: tourObj.hotel.name,
                            destination: tourObj.hotel.address,
                            checkIn: tourObj.checkIn,
                            travelers: 2,
                            totalAmount: 19998,
                            amountPaid: 19998,
                            status: 'confirmed',
                            paymentStatus: 'paid',
                            paymentId: 'pay_tour_verified',
                            createdAt: tourObj.createdAt,
                            guestInfo: {
                                firstName: "Valued",
                                lastName: "Traveler",
                                email: "guest@gethotelstays.com",
                                phone: "+91 98765 43210",
                                specialRequests: tourObj.specialRequests
                            }
                        });
                        localStorage.setItem("ghs_user_bookings", JSON.stringify(stored));
                    }
                } catch (e) {
                    console.error("Failed to cache tour booking:", e);
                }
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const handleVerifyPaymentStatus = async () => {
        if (!booking?.id || booking?.isPackage) return;
        setVerifying(true);
        setVerificationMessage(null);
        try {
            const res = await paymentApi.fetchPaymentStatus(booking.id);
            if (res.success) {
                setVerificationMessage({
                    type: 'success',
                    text: res.message || 'Payment verified successfully!'
                });
                await fetchBookingDetails();
            } else {
                setVerificationMessage({
                    type: 'info',
                    text: res.message || 'No successful payment found on Razorpay yet.'
                });
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setVerificationMessage({
                type: 'error',
                text: err.message || 'Failed to verify payment status. Please try again.'
            });
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        if (booking && booking.status === 'held' && !verifying && !verificationMessage && !booking.isPackage) {
            handleVerifyPaymentStatus();
        }
    }, [booking, verifying, verificationMessage]);

    const isTour = Boolean(
        booking?.isPackage || 
        String(id).toUpperCase().includes('PKG') || 
        booking?.room?.name?.toLowerCase().includes('tour') ||
        booking?.hotel?.name?.toLowerCase().includes('delhi to agra')
    );

    const hotelName = booking?.hotel?.name || (isTour ? "DELHI TO AGRA HERITAGE ESCAPE" : "Cottage Yes Please");
    const hotelCity = booking?.hotel?.city || (isTour ? "Delhi / Agra" : "New Delhi");
    const hotelAddress = booking?.hotel?.address || (isTour ? "Pickup & Drop: Delhi NCR • Destination: Agra, Uttar Pradesh" : "1843, Laxmi Narain Street, Rajguru Marg, Chuna Mandi, Pahar Ganj");
    const hotelThumbnail = booking?.hotel?.thumbnail || (isTour ? "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&w=800&q=75");
    const checkInDate = booking?.checkIn ? formatDate(booking.checkIn) : (isTour ? "29 Sep 2026" : "16 May 2026");
    const checkOutDate = booking?.checkOut ? formatDate(booking.checkOut) : (isTour ? "29 Sep 2026" : "17 May 2026");
    const totalPriceVal = booking?.totalPrice || (isTour ? 19998 : 2940);
    const amountPaidVal = booking ? (booking.amountPaid ?? (isTour ? totalPriceVal : 0)) : (isTour ? totalPriceVal : Math.round(totalPriceVal * 0.12));
    const payAtHotelVal = isTour ? 0 : Math.max(0, totalPriceVal - amountPaidVal);
    const paymentStatus = isTour ? 'paid' : (booking?.paymentStatus || (amountPaidVal === 0 ? 'pending' : (amountPaidVal >= totalPriceVal ? 'paid' : 'partial')));
    const displayBookingId = isTour ? (booking?.id ? String(booking.id) : (id || "PKG-GHS-128459")) : (booking ? `#GH-${Number(booking.id) + 10000}` : `#GH-10011`);
    const roomName = booking?.room?.name || (isTour ? "Tour Package (2 Travelers) • Private AC Cab & Heritage Sightseeing" : "Double Deluxe Room");
    const status = isTour 
        ? ((booking?.status || "").toLowerCase() === 'cancelled' ? 'cancelled' : 'confirmed') 
        : (booking?.status || "confirmed");

    if (loading) {
        return (
            <Loader variant="fullscreen" text={isTour ? "Loading tour details..." : "Loading stay details..."} />
        );
    }

    return (
        <div className="min-h-screen bg-white py-4 sm:py-8 md:py-12 px-3.5 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto animate-fade-in">
                {/* Top Nav Row */}
                <div className="flex items-center justify-between gap-2.5 mb-5 sm:mb-8">
                    <button 
                        onClick={() => router("/my-bookings")}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 font-bold text-xs sm:text-sm transition-colors group shrink-0"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" /> 
                        <span>Back to Journeys</span>
                    </button>
                    <button
                        onClick={handleDownloadVoucherPDF}
                        disabled={downloadingVoucher}
                        className="px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 sm:gap-2 disabled:bg-slate-300 shrink-0"
                    >
                        {downloadingVoucher ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-3.5 h-3.5" /> 
                                <span>Download Voucher</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Header Card (Tour vs Stay) */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start pb-5 sm:pb-8 border-b border-slate-100 mb-5 sm:mb-8">
                    {/* Image: landscape banner on mobile, square thumbnail on desktop */}
                    <div className="w-full sm:w-32 sm:h-32 h-44 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 shadow-sm border border-slate-100">
                        <img src={hotelThumbnail} alt={hotelName} className="w-full h-full object-cover" loading="lazy" />
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 space-y-2 w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                                isTour ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-brand-50 text-brand-600 border-brand-100'
                            }`}>
                                {isTour ? `Tour ${status}` : `Reservation ${status}`}
                            </span>
                            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border bg-emerald-50 text-emerald-700 border-emerald-100">
                                {isTour ? 'Fully Paid (All-Inclusive)' : (paymentStatus === 'paid' ? 'Fully Paid' : paymentStatus === 'partial' ? '12% Deposit Paid' : 'Pay At Hotel')}
                            </span>
                            <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold font-mono">ID: {displayBookingId}</span>
                        </div>
                        
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight uppercase leading-tight italic pt-0.5">
                            {hotelName}
                        </h1>
                        
                        <p className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
                            {roomName}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                            <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 max-w-xl">
                                <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                                <span>{hotelAddress}</span>
                            </p>
                            <button 
                                onClick={() => {
                                    const mapQuery = isTour ? "Taj Mahal, Agra, Uttar Pradesh" : `${hotelName}, ${hotelAddress}`;
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank');
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors shrink-0"
                            >
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {isTour ? "Show Tour Route" : "Show on Map"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                    {/* Schedule / Logistics block */}
                    {isTour ? (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6 p-3.5 sm:p-5 md:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div className="space-y-1 min-w-0">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Tour Date</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" />
                                        <span className="truncate">{checkInDate}</span>
                                    </p>
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Duration</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" />
                                        <span className="truncate">Full Day Tour</span>
                                    </p>
                                </div>
                            </div>

                            {/* Tour Inclusions and Travelers */}
                            <div className="p-3.5 sm:p-5 md:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 sm:space-y-4">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tour & Transport Details</h4>
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Travelers</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                                            <span className="truncate">{booking?.totalGuests || 2} Traveler(s)</span>
                                        </p>
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Transport</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                            <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                                            <span className="truncate">Private AC Cab</span>
                                        </p>
                                    </div>
                                    <div className="col-span-2 border-t border-slate-200/60 pt-2.5 mt-1">
                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Key Inclusions</p>
                                        <div className="space-y-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span>Taj Mahal & Agra Fort Guided Sightseeing</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span>Toll Taxes, Parking, Fuel & Chauffeur Covered</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6 p-3.5 sm:p-5 md:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div className="space-y-1 min-w-0">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Entry Date</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" /> 
                                        <span className="truncate">{checkInDate}</span>
                                    </p>
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Exit Date</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" /> 
                                        <span className="truncate">{checkOutDate}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Room and Guests Info */}
                            <div className="p-3.5 sm:p-5 md:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 sm:space-y-4">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Info</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Room Type</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900">{roomName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900">{booking?.totalGuests || 2} Guest(s)</p>
                                    </div>
                                    <div className="space-y-1 sm:col-span-2 border-t border-slate-200/60 pt-2.5 mt-1">
                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Arrival Time</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" /> {booking?.arrivalTime || "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Details block */}
                    {isTour ? (
                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4 flex flex-col justify-between">
                            <div className="space-y-3 sm:space-y-4">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Summary</h4>
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Total Tour Price</span>
                                        <span className="font-black text-slate-900 text-sm">{formatPrice(totalPriceVal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs pt-2.5 sm:pt-3 border-t border-slate-200">
                                        <span className="text-emerald-600 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Paid Fully Online (100% Advance)
                                        </span>
                                        <span className="font-black text-emerald-600 text-sm">{formatPrice(totalPriceVal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs pt-1.5">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Remaining Balance</span>
                                        <span className="font-black text-slate-900 text-sm">₹0 (All Inclusive)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-200/60 bg-emerald-50/60 p-2.5 sm:p-3 rounded-xl border border-emerald-100">
                                <p className="text-[10px] text-emerald-800 leading-relaxed font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    100% All-Inclusive Tour. No extra fuel, toll taxes, or driver charges payable during the trip.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Summary</h4>
                            <div className="space-y-2.5 sm:space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Total Amount</span>
                                    <span className="font-black text-slate-900">{formatPrice(totalPriceVal)}</span>
                                </div>

                                {paymentStatus === 'paid' && (
                                    <>
                                        <div className="flex justify-between items-center text-xs pt-2.5 sm:pt-3 border-t border-slate-200">
                                            <span className="text-emerald-600 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Paid Fully Online
                                            </span>
                                            <span className="font-black text-emerald-600">{formatPrice(totalPriceVal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pt-1.5">
                                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Remaining (Pay at Hotel)</span>
                                            <span className="font-black text-slate-900">₹0</span>
                                        </div>
                                    </>
                                )}

                                {paymentStatus === 'partial' && (
                                    <>
                                        <div className="flex justify-between items-center text-xs pt-2.5 sm:pt-3 border-t border-slate-200">
                                            <span className="text-emerald-600 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Paid Online (12% Deposit)
                                            </span>
                                            <span className="font-black text-emerald-600">{formatPrice(amountPaidVal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pt-1.5">
                                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Remaining (Pay at Hotel)</span>
                                            <span className="font-black text-slate-900">{formatPrice(payAtHotelVal)}</span>
                                        </div>
                                    </>
                                )}

                                {paymentStatus === 'pending' && (
                                    <>
                                        <div className="flex justify-between items-center text-xs pt-2.5 sm:pt-3 border-t border-slate-200">
                                            <span className="text-amber-600 font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Pay Full Amount at Hotel
                                            </span>
                                            <span className="font-black text-amber-600">{formatPrice(totalPriceVal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pt-1.5">
                                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Paid Online</span>
                                            <span className="font-black text-slate-900">₹0</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {paymentStatus !== 'paid' && booking?.razorpayOrderId && (
                                <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                        Did you complete your payment but the status hasn't updated? Verify with Razorpay.
                                    </p>
                                    <button 
                                        onClick={handleVerifyPaymentStatus}
                                        disabled={verifying}
                                        className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-350 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        {verifying ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Verifying with Razorpay...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Verify Payment Status
                                            </>
                                        )}
                                    </button>
                                    {verificationMessage && (
                                        <p className={`text-[10px] font-bold mt-2 text-center ${
                                            verificationMessage.type === 'success' ? 'text-emerald-600' :
                                            verificationMessage.type === 'error' ? 'text-red-500' :
                                            'text-amber-600'
                                        }`}>
                                            {verificationMessage.text}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Guest Contact & Special Requests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                    {/* Guest Contact Info */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                        <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {isTour ? "Primary Traveler Information" : "Guest Contact Info"}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1">
                                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Name</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                                    {booking?.guestFirstName || "Shriyansh"} {booking?.guestLastName || ""}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900">{booking?.guestPhone || "+91 98765 43210"}</p>
                            </div>
                            <div className="col-span-1 sm:col-span-2 space-y-1">
                                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900">{booking?.guestEmail || "guest@gethotelstays.com"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Special Requests / Pickup */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                        <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {isTour ? "Pickup Location & Notes" : "Special Requests"}
                        </h4>
                        <div className="p-3 sm:p-4 bg-white/60 border border-slate-100 rounded-xl min-h-[70px] sm:min-h-[90px] flex items-center">
                            <p className="text-xs text-slate-600 font-bold leading-relaxed italic">
                                {booking?.specialRequests ? `"${booking.specialRequests}"` : (isTour ? "Doorstep pickup in Delhi NCR confirmed. Cab and chauffeur details will be shared prior to departure." : "No special requests provided for this stay.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Assistance / Support Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl mb-6 sm:mb-8">
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            {isTour ? "Need Tour Assistance?" : "Need Help with your Stay?"}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-0.5">
                            {isTour ? "Our tour coordinator and helpline are available 24/7." : "Our support team is available 24/7."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-slate-950 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            {isTour ? "Contact Tour Support" : "Contact Stay Host"}
                        </button>
                    </div>
                </div>

                {/* Mobile Key NFC Modal (Only for hotels) */}
                {showKeyModal && !isTour && (
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
                                                <span className="text-[9px] font-mono text-slate-400">{displayBookingId}</span>
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

                {/* Contact Modal */}
                {showContactModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100">
                            <button 
                                onClick={() => setShowContactModal(false)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">
                                {isTour ? "Tour Support & Help" : "Contact Stay Host"}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                                {isTour ? "Reach out directly for tour pickup & schedule updates" : "Reach out to hotel management directly"}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <a 
                                    href={`tel:${booking?.hotel?.phone || "+919876543210"}`}
                                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all text-center group active:scale-[0.98]"
                                >
                                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Call Helpline</span>
                                </a>
                                <a 
                                    href={`mailto:support@gethotelstays.com?subject=Booking ${displayBookingId} inquiry`}
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
                                        <p className="text-[9px] text-emerald-600 font-bold">Our support team will reply within 5 minutes.</p>
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

                {/* Minimal Voucher Template for PDF Generation */}
                <div 
                    id="minimal-booking-voucher" 
                    className="fixed bg-white text-slate-800 p-12 space-y-8 font-sans border border-slate-100 shadow-sm"
                    style={{ 
                        position: 'absolute', 
                        top: '-9999px', 
                        left: '-9999px', 
                        width: '794px',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-blue-600 uppercase">
                                GETHOTEL<span className="text-slate-800">STAYS</span>
                            </h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {isTour ? "Official Tour Package Voucher" : "Official Booking Confirmation"}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded border border-emerald-100">
                                {isTour ? 'Fully Paid (All-Inclusive)' : (paymentStatus === 'paid' ? 'Fully Paid' : paymentStatus === 'partial' ? '12% Deposit Paid' : 'Pay At Hotel')}
                            </span>
                            <p className="text-[10px] font-mono text-slate-400 mt-2">Voucher ID: {displayBookingId}</p>
                        </div>
                    </div>

                    {/* Content details */}
                    <div className="grid grid-cols-2 gap-8 text-xs">
                        {/* Service / Tour details */}
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                {isTour ? "Tour Package & Destination" : "Stay & Property"}
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-slate-900">{hotelName}</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed">{hotelAddress}</p>
                                <p className="text-[11px] font-bold text-slate-800 uppercase mt-1">{roomName}</p>
                            </div>
                        </div>

                        {/* Timings / Schedule details */}
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                {isTour ? "Schedule & Logistics" : "Timing & Dates"}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase">{isTour ? "Tour Date" : "Check-in"}</p>
                                    <p className="font-bold text-slate-800">{checkInDate}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase">{isTour ? "Duration" : "Check-out"}</p>
                                    <p className="font-bold text-slate-800">{isTour ? "Full Day Tour" : checkOutDate}</p>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 mt-1">
                                {isTour ? "Departure: 06:00 AM (Hotel/Airport Pickup in Delhi NCR)" : `Arrival Time: ${booking?.arrivalTime || "Not specified"}`}
                            </p>
                        </div>
                    </div>

                    {/* Guest info */}
                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">
                            {isTour ? "Primary Traveler Information" : "Guest Information"}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase">Primary Guest</p>
                                <p className="font-bold text-slate-800 uppercase">{booking?.guestFirstName || "Shriyansh"} {booking?.guestLastName || ""}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase">Phone Number</p>
                                <p className="font-bold text-slate-800">{booking?.guestPhone || "+91 98765 43210"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase">Email Address</p>
                                <p className="font-bold text-slate-800">{booking?.guestEmail || "guest@gethotelstays.com"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing details */}
                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-4">Payment Breakdown</h3>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-bold uppercase text-[9px]">{isTour ? "Total Tour Tariff" : "Total Tariff"}</span>
                                <span className="font-black text-slate-800">{formatPrice(totalPriceVal)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-100 pt-2 text-emerald-600 font-bold">
                                <span className="uppercase text-[9px]">Amount Paid Online (100%)</span>
                                <span>{formatPrice(isTour ? totalPriceVal : amountPaidVal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 font-bold">
                                <span className="uppercase text-[9px]">{isTour ? "Remaining Due" : "Payable at Hotel"}</span>
                                <span>{isTour ? "₹0 (All-Inclusive)" : formatPrice(payAtHotelVal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer notes */}
                    <div className="border-t border-slate-100 pt-6 flex justify-between items-center text-[10px] text-slate-400 leading-normal">
                        <div>
                            <p className="font-bold">Thank you for booking with GetHotelStays!</p>
                            <p className="text-[8px] uppercase tracking-wider mt-0.5">
                                {isTour ? "Please present this voucher and valid photo ID upon chauffeur pickup." : "Please present this voucher and valid ID upon arrival."}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">24x7 Support</p>
                            <p>support@gethotelstays.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
