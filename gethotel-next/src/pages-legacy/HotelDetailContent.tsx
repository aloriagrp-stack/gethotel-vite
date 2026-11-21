'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "@/components/common/Image";
import { Link, useSearchParams } from "react-router-dom";
import {
    MapPin, ChevronRight, ChevronLeft, Check, Loader2, Shield, Zap, TrendingUp, ShieldCheck,
    Plus, Minus, Clock, Users, X, Calendar, Phone, Mail, Star, Award, Coffee, Wifi, MessageSquare,
    Send, Share2, Search, Heart, Info, AlertCircle, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Bed,
    BedDouble, Maximize2, Edit3, CreditCard, Tag, Copy, ExternalLink,
    Sparkles, Utensils, Bath, CheckCircle2
} from "lucide-react";
import { useNavigate as useRouter } from "react-router-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import ImageGallery from "@/components/hotels/ImageGallery";
import PriceBox from "@/components/hotels/PriceBox";
import { cn, ratingLabel, amenityIcon, amenityLabel, formatDate, formatPrice, safeParse, formatDateLocal, getHotelUrl } from "@/lib/utils";
import { hotelApi, messageApi, couponApi } from "@/lib/api";
import GuestHotelChatModal from "@/components/chat/GuestHotelChatModal";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import SmartSearchBar from "@/components/search/SmartSearchBar";
import Loader from "@/components/common/Loader";
import { useStayMode } from "@/context/StayModeContext";
import { validateCoupon, isMobileDevice } from "@/lib/promoUtils";

const formatDateLabel = (ci: string, co: string) => {
    if (!ci || ci === "Dates") return "Add dates";
    const d1 = new Date(ci);
    const d2 = new Date(co);
    if (isNaN(d1.getTime())) return "Add dates";
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (isNaN(d2.getTime())) return d1.toLocaleDateString('en-US', options);
    return `${d1.toLocaleDateString('en-US', options)} - ${d2.toLocaleDateString('en-US', options)}`;
};

const parseComment = (commentStr: string) => {
    if (!commentStr) return "";
    const overallMatch = commentStr.match(/Overall:\s*([\s\S]*?)$/i);
    if (overallMatch) {
        return overallMatch[1].trim();
    }
    if (commentStr.includes("Likes:") || commentStr.includes("Dislikes:") || commentStr.includes("Overall:")) {
        const clean = commentStr.replace(/Likes:.*?\n/gi, '').replace(/Dislikes:.*?\n/gi, '').replace(/Overall:/gi, '').trim();
        return clean;
    }
    return commentStr;
};

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const PolicyAccordionItem = ({ item }: { item: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0 transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group transition-all"
            >
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-50 text-brand-600 rounded-full flex items-center justify-center transition-colors group-hover:bg-brand-50">
                        {item.icon}
                    </div>
                    <span className="text-sm font-black text-slate-950 uppercase tracking-[0.15em]">{item.title}</span>
                </div>
                <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="pl-17 pr-10 pb-8">
                            <p className="text-[13px] font-bold text-slate-500 leading-relaxed italic opacity-80">
                                {item.content}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const FAQItem = ({ faq }: { faq: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0 transition-colors">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 sm:py-4.5 flex items-center justify-between text-left group transition-all cursor-pointer gap-4"
            >
                <span className="text-sm sm:text-[15px] font-semibold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                    {faq.question}
                </span>
                <div className={cn(
                    "w-7 h-7 rounded-full bg-slate-50 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 flex items-center justify-center shrink-0 transition-transform duration-300",
                    isOpen && "rotate-180 bg-brand-50 text-brand-600"
                )}>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <div className="pb-5 pt-0.5 pr-4 sm:pr-8">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                {faq.answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function HotelDetailContent({ id, initialHotel }: { id: string, initialHotel?: any }) {
    const router = useRouter();
    const { user } = useAuth();
    const { toggle, isWishlisted } = useWishlist();
    const [searchParams, setSearchParams] = useSearchParams();
    const [hotel, setHotel] = useState<any>(initialHotel || null);

    const handleBack = () => {
        try {
            const savedUrl = sessionStorage.getItem("last_hotel_listing_url");
            if (savedUrl && savedUrl !== window.location.pathname && savedUrl !== window.location.href) {
                router(savedUrl);
                return;
            }
        } catch (_) {}

        if (document.referrer && document.referrer.includes(window.location.host) && !document.referrer.includes(window.location.pathname)) {
            window.history.back();
            return;
        }

        if (window.history.length > 1) {
            router(-1);
        } else {
            const parts = window.location.pathname.split("/");
            const langCode = ["en", "hi", "de", "ja", "fr", "es", "zh", "ar", "ru", "pt"].includes(parts[1]) ? parts[1] : "en";
            if (hotel?.city && hotel.city.toLowerCase().trim() === "delhi") {
                router(`/${langCode}/hotels-in-delhi`);
            } else if (hotel?.city) {
                router(`/${langCode}/hotels?city=${encodeURIComponent(hotel.city)}`);
            } else {
                router(`/${langCode}/hotels`);
            }
        }
    };
    const [rooms, setRooms] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(!initialHotel);
    const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<any>(null);
    const [currentRoomImage, setCurrentRoomImage] = useState(0);
    const [slideDirection, setSlideDirection] = useState(0); // 1 for next, -1 for prev
    const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});
    const [scrolled, setScrolled] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showStayDetailsModal, setShowStayDetailsModal] = useState(false);
    const [modalCalendarMode, setModalCalendarMode] = useState<"checkIn" | "checkOut">("checkIn");
    const [showFacilitiesDrawer, setShowFacilitiesDrawer] = useState(false);
    const [facilitySearchQuery, setFacilitySearchQuery] = useState("");
    const facilitiesDragControls = useDragControls();
    const roomDetailsDragControls = useDragControls();
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
    const [showGuestsPicker, setShowGuestsPicker] = useState(false);
    const [tempCheckIn, setTempCheckIn] = useState<Date | undefined>(searchParams.get("checkIn") ? new Date(searchParams.get("checkIn") as string) : undefined);
    const [tempCheckOut, setTempCheckOut] = useState<Date | undefined>(searchParams.get("checkOut") ? new Date(searchParams.get("checkOut") as string) : undefined);
    const [tempArrivalTime, setTempArrivalTime] = useState(searchParams.get("arrivalTime") || "12:00");
    const [tempDuration, setTempDuration] = useState(searchParams.get("duration") || "3");
    const [modalView, setModalView] = useState<"checkin" | "checkout">("checkin");
    const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
    const [actionPopup, setActionPopup] = useState<{type: 'login' | 'date', message: string, isOpen: boolean}>({ type: 'login', message: '', isOpen: false });
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState(false);

    // Lock background scroll when facilities drawer or room details drawer is open
    useEffect(() => {
        if (showFacilitiesDrawer || selectedRoomForDetails) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [showFacilitiesDrawer, selectedRoomForDetails]);

    const nameLength = hotel?.name?.length || 0;
    const titleSizeClass = useMemo(() => {
        if (nameLength > 55) {
            return "text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug";
        }
        if (nameLength > 35) {
            return "text-2xl sm:text-3xl md:text-4xl leading-tight";
        }
        return "text-3xl md:text-5xl leading-tight";
    }, [nameLength]);

    const realStarRating = useMemo(() => {
        const rawStars = Number(hotel?.starRating) || 0;
        if (rawStars >= 1 && rawStars <= 5) return rawStars;
        const price = Number(hotel?.bookingPrice || hotel?.pricePerNight) || 0;
        const nameLower = (hotel?.name || '').toLowerCase();
        if (/crowne plaza|taj|oberoi|itc|leela|marriott|hyatt|radisson|hilton|novotel|pullman|sofitel|sheraton|westin/i.test(nameLower)) return 5;
        if (price >= 8500) return 5;
        if (price >= 4000) return 4;
        return 3;
    }, [hotel?.starRating, hotel?.bookingPrice, hotel?.pricePerNight, hotel?.name]);

    const handleCopyPhone = (phoneNumber: string) => {
        if (!phoneNumber) return;
        try {
            navigator.clipboard.writeText(phoneNumber);
            setCopiedPhone(true);
            setTimeout(() => setCopiedPhone(false), 2500);
            try {
                const url = `/api/hotels/${hotel?.id}/track-lead`;
                const payload = JSON.stringify({ action: 'copy_phone' });
                if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                    navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
                }
            } catch (_) {}
        } catch (_) {}
    };

    const cleanBookingUrl = useMemo(() => {
        const raw = hotel?.bookingUrl;
        if (!raw) {
            return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent((hotel?.name || '') + ' ' + (hotel?.city || ''))}`;
        }
        const match = raw.match(/^(https?:\/\/[^/]*booking\.com\/hotel\/[^?#]+\.html)/i);
        return match ? match[1] : raw;
    }, [hotel?.bookingUrl, hotel?.name, hotel?.city]);

    const checkInRef = useRef<HTMLDivElement>(null);
    const checkOutRef = useRef<HTMLDivElement>(null);
    const guestsRef = useRef<HTMLDivElement>(null);

    const amenitiesScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollAmenitiesLeft, setCanScrollAmenitiesLeft] = useState(false);
    const [canScrollAmenitiesRight, setCanScrollAmenitiesRight] = useState(true);

    const checkAmenitiesScroll = () => {
        const el = amenitiesScrollRef.current;
        if (!el) return;
        setCanScrollAmenitiesLeft(el.scrollLeft > 8);
        setCanScrollAmenitiesRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    const handleScrollAmenities = (direction: 'left' | 'right') => {
        const el = amenitiesScrollRef.current;
        if (!el) return;
        const amount = direction === 'left' ? -220 : 220;
        el.scrollBy({ left: amount, behavior: 'smooth' });
    };

    useEffect(() => {
        const timer = setTimeout(checkAmenitiesScroll, 300);
        const handleResize = () => checkAmenitiesScroll();
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (checkInRef.current && !checkInRef.current.contains(event.target as Node)) {
                setShowCheckInPicker(false);
            }
            if (checkOutRef.current && !checkOutRef.current.contains(event.target as Node)) {
                setShowCheckOutPicker(false);
            }
            if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
                setShowGuestsPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const triggerCheckInDropdown = () => {
        const element = document.getElementById("booking-bar");
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setModalCalendarMode("checkIn");
        setShowStayDetailsModal(true);
    };

    const playTannSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Generate a 'ding/tannn' bell sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 Note
            
            gain.gain.setValueAtTime(1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.5);
        } catch (e) {
            console.error(e);
        }
    };

    const { mode: globalMode } = useStayMode();
    const handleBook = (e: React.MouseEvent, roomId: string, variantIdx?: string) => {
        e.stopPropagation();
        const checkInParam = searchParams.get("checkIn");
        const checkOutParam = searchParams.get("checkOut");
        const mode = searchParams.get("stayType") || globalMode || "nightly";
        
        if (!checkInParam || (mode === "nightly" && !checkOutParam)) {
            playTannSound();
            setActionPopup({ type: 'date', message: 'Please select your check-in and check-out dates first.', isOpen: true });
            return;
        }

        if (!user) {
            playTannSound();
            setActionPopup({ type: 'login', message: 'Please log in first to continue booking.', isOpen: true });
            return;
        }

        // Add to Cart with variant awareness
        const cartKey = variantIdx !== undefined ? `${roomId}_${variantIdx}` : roomId.toString();
        setSelectedRooms(prev => ({
            ...prev,
            [cartKey]: (prev[cartKey] || 0) + 1
        }));
        setSelectedRoomForDetails(null);
    };

    const handleCartQuantity = (e: React.MouseEvent, roomId: string, variantIdx: string | undefined, delta: number, maxInventory: number) => {
        e.stopPropagation();
        const cartKey = variantIdx !== undefined ? `${roomId}_${variantIdx}` : roomId.toString();
        setSelectedRooms(prev => {
            const current = prev[cartKey] || 0;
            const next = current + delta;
            if (next <= 0) {
                const newCart = { ...prev };
                delete newCart[cartKey];
                return newCart;
            }
            if (next > maxInventory) {
                alert(`Only ${maxInventory} rooms available of this type!`);
                return prev;
            }
            return { ...prev, [cartKey]: next };
        });
    };

    const handleCheckout = () => {
        const params = new URLSearchParams(window.location.search);
        Object.entries(selectedRooms).forEach(([rId, qty]) => {
            params.set(`room_${rId}`, qty.toString());
        });
        params.set("hotelId", hotel.id.toString());
        params.delete("room");
        params.delete("variant");
        router(`/booking?${params.toString()}`);
    };
    const [fetchingRooms, setFetchingRooms] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedDetailedReview, setSelectedDetailedReview] = useState<any | null>(null);
    const [showMoreCategories, setShowMoreCategories] = useState(false);
    const [viewers, setViewers] = useState(4);
    const [trendingHotels, setTrendingHotels] = useState<any[]>([]);
    const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (hotel?.city) {
            const fetchTrending = async () => {
                try {
                    const res = await hotelApi.getHotels();
                    const filtered = (res.data || []).filter((h: any) =>
                        h.city?.toLowerCase() === hotel.city?.toLowerCase() &&
                        h.id !== hotel.id &&
                        (Number(h.guestRating) >= 4 || h.isPremium)
                    ).slice(0, 4);
                    setTrendingHotels(filtered);
                } catch (err) {
                    console.error("Failed to fetch trending hotels", err);
                }
            };
            fetchTrending();
        }
    }, [hotel?.id]); // Only run when hotel ID changes

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await hotelApi.getHotel(id);
                const hotelData = res.data || res;
                if (hotelData) {
                    setHotel(hotelData);
                    const hotelCoupons = hotelData.coupon || hotelData.coupons;
                    if (Array.isArray(hotelCoupons) && hotelCoupons.length > 0) {
                        setCoupons(hotelCoupons);
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchHotel();
    }, [id]);

    // Track real organic guest page views with session deduplication
    useEffect(() => {
        if (!hotel?.id) return;
        try {
            const sessionKey = `viewed_lead_h_${hotel.id}`;
            if (!sessionStorage.getItem(sessionKey)) {
                sessionStorage.setItem(sessionKey, "1");
                const url = `/api/hotels/${hotel.id}/track-lead`;
                const payload = JSON.stringify({ action: "view" });
                if (typeof navigator !== "undefined" && navigator.sendBeacon) {
                    const blob = new Blob([payload], { type: "application/json" });
                    navigator.sendBeacon(url, blob);
                } else {
                    fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: payload,
                        keepalive: true
                    }).catch(() => {});
                }
            }
        } catch (_) {}
    }, [hotel?.id]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setFetchingRooms(true);
                const params: any = {};
                const checkInParam = searchParams.get("checkIn");
                const checkOutParam = searchParams.get("checkOut");
                if (checkInParam) params.checkIn = checkInParam;
                if (checkOutParam) params.checkOut = checkOutParam;

                const targetId = hotel?.id?.toString() || id;
                const res = await hotelApi.getRooms(targetId, params);
                setRooms(res.data || []);
            } catch (err) { console.error(err); }
            finally { 
                setLoading(false);
                setFetchingRooms(false);
            }
        };

        const fetchCoupons = async () => {
            try {
                const targetHotelId = hotel?.id || (typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : null);
                if (!targetHotelId) return;
                const res = await couponApi.getCoupons(targetHotelId);
                const rawData = res.data?.coupons || res.data || res;
                const couponList = Array.isArray(rawData) ? rawData : [];
                
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                const activeCoupons = couponList.filter((c: any) => {
                    const isActive = c.isActive !== false && c.is_active !== false;
                    if (!isActive) return false;
                    const startStr = typeof c.startDate === 'string' ? c.startDate.split('T')[0] : '';
                    const endStr = typeof c.endDate === 'string' ? c.endDate.split('T')[0] : '';
                    if (startStr && endStr && (todayStr < startStr || todayStr > endStr)) return false;
                    return true;
                });

                if (activeCoupons.length > 0) {
                    setCoupons(prev => {
                        const map = new Map();
                        [...prev, ...activeCoupons].forEach((c: any) => {
                            if (c && (c.id || c.code)) map.set(c.id || c.code, c);
                        });
                        return Array.from(map.values());
                    });
                }
            } catch (err) { console.error("Failed to fetch coupons", err); }
        };

        fetchRooms();
        fetchCoupons();
    }, [id, hotel?.id, searchParams]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setViewers(prev => Math.max(2, Math.min(12, prev + (Math.random() > 0.5 ? 1 : -1))));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async () => {
        if (!user) { router("/login"); return; }
        if (!messageContent.trim()) return;
        setIsSendingMessage(true);
        try {
            const res = await messageApi.sendMessage({ hotelId: hotel?.id || Number(id), content: messageContent });
            if (res.success) {
                alert("Message sent successfully!");
                setMessageContent("");
                setIsMessageModalOpen(false);
            }
        } catch (err: any) {
            alert(err.message || "Failed to send message");
        } finally { setIsSendingMessage(false); }
    };

    const dynamicPolicies = useMemo(() => {
        const globalPolicies = safeParse(hotel?.policies || hotel?.hotel_policies, {});
        const roomPolicies = selectedRoomForDetails ? safeParse(selectedRoomForDetails.roomPolicies || selectedRoomForDetails.room_policies || selectedRoomForDetails.policies, {}) : {};
        
        // Ensure we merge objects correctly
        const g = Array.isArray(globalPolicies) ? (globalPolicies[0] || {}) : globalPolicies;
        const r = Array.isArray(roomPolicies) ? (roomPolicies[0] || {}) : roomPolicies;
        
        return { ...g, ...r };
    }, [hotel?.policies, selectedRoomForDetails]);

    const hotelFaqs = useMemo(() => {
        if (!hotel?.faqs) return [];
        return safeParse(hotel.faqs, []);
    }, [hotel?.faqs]);

    const allAvailableCoupons = useMemo(() => {
        const fromHotel = (hotel?.coupon || hotel?.coupons || []);
        const rawList = [...(Array.isArray(fromHotel) ? fromHotel : []), ...(Array.isArray(coupons) ? coupons : [])];
        const map = new Map();
        rawList.forEach((c: any) => {
            if (c && (c.id || c.code)) {
                map.set(c.id || c.code, c);
            }
        });
        return Array.from(map.values());
    }, [hotel?.coupon, hotel?.coupons, coupons]);

    if (loading || !hotel) return <Loader variant="fullscreen" text="Loading hotel details..." />;

    const checkIn = searchParams.get("checkIn") || "Dates";
    const checkOut = searchParams.get("checkOut") || "Dates";
    const adults = searchParams.get("adults") || "2";
    const stayType = searchParams.get("stayType") || globalMode || "nightly";
    const duration = searchParams.get("duration") || "3";
    const arrivalTime = searchParams.get("arrivalTime") || "12:00";
    const searchedGuests = parseInt(adults);

    const calculateStayPrice = (basePrice: any, room: any, activePromos?: any[]) => {
        const promoList = Array.isArray(activePromos) && activePromos.length > 0 ? activePromos : allAvailableCoupons;
        const priceDiff = room?.dynamicPricePerNight ? (room.dynamicPricePerNight - room.pricePerNight) : 0;
        const parsedBase = room?.selectedVariant?.price ? parseFloat(room.selectedVariant.price) : parseFloat(basePrice);
        const actualPrice = parsedBase + priceDiff;

        // Helper to apply discount with safety
        const applyDiscount = (price: number, val: number, type: string) => {
            const safeVal = type === 'percentage' ? Math.min(val, 100) : val;
            const discounted = type === 'percentage' 
                ? Math.round(price * (1 - safeVal / 100)) 
                : Math.round(price - safeVal);
            return Math.max(0, discounted); // Never go below zero
        };

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // Resolve check-in / check-out dates and nights
        const hasDates = checkIn && checkOut && checkIn !== "Dates" && checkOut !== "Dates";
        const stayCheckIn = hasDates ? checkIn : todayStr;
        const stayCheckOut = hasDates ? checkOut : new Date(today.getTime() + 86400000).toISOString().split('T')[0];
        
        let stayNights = 1;
        if (hasDates) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            stayNights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        }

        const stayDetails = {
            checkIn: stayCheckIn,
            checkOut: stayCheckOut,
            basePrice: actualPrice,
            nights: stayNights,
            roomId: room?.id
        };

        const isMobile = isMobileDevice();

        const getPromoTypeLabel = (type: string) => {
            switch (type) {
                case 'standard':
                    return 'Basic Deal';
                case 'mobile_only':
                    return 'Mobile Only';
                case 'last_minute':
                    return 'Last Minute';
                case 'early_bird':
                    return 'Early Bird';
                case 'weekend':
                    return 'Weekend Getaway';
                case 'long_stay':
                    return 'Long Stay';
                default:
                    return 'Special Offer';
            }
        };

        // 1. Separate promos into fully valid vs mobile-restricted-only
        const fullyValidPromos: any[] = [];
        let mobileRestrictedPromo: any = null;

        promoList.forEach(p => {
            if (!p || p.isActive === false || p.is_active === false) return;
            // Check basic constraints bypassing the mobile check
            const copyPromo = { ...p, promoType: p.promoType === 'mobile_only' ? 'standard' : p.promoType };
            const basicCheck = validateCoupon(copyPromo, stayDetails);
            if (!basicCheck.valid) return;

            // Check full validity
            const fullCheck = validateCoupon(p, stayDetails);
            if (fullCheck.valid) {
                fullyValidPromos.push(p);
            } else if (p.promoType === 'mobile_only' && !isMobile) {
                if (!mobileRestrictedPromo || Number(p.discountValue) > Number(mobileRestrictedPromo.discountValue)) {
                    mobileRestrictedPromo = p;
                }
            }
        });

        // 2. Sort fully valid promos to find the best applicable one (fallback to promoList if dates not strictly validated)
        if (fullyValidPromos.length === 0 && promoList.length > 0) {
            promoList.forEach(p => {
                if (p && p.isActive !== false && p.is_active !== false) {
                    fullyValidPromos.push(p);
                }
            });
        }

        fullyValidPromos.sort((a: any, b: any) => Number(b.discountValue) - Number(a.discountValue));
        const bestPromo = fullyValidPromos[0];

        // 3. Calculate final display results
        if (mobileRestrictedPromo && !isMobile) {
            const title = `MOBILE ONLY: ${mobileRestrictedPromo.discountValue}${mobileRestrictedPromo.discountType === 'percentage' ? '%' : '₹'} OFF`;
            
            if (bestPromo) {
                const fPrice = applyDiscount(actualPrice, Number(bestPromo.discountValue), bestPromo.discountType);
                return {
                    finalPrice: fPrice,
                    originalPrice: actualPrice,
                    discountLabel: title,
                    isMobileOnly: true,
                    promoType: 'mobile_only',
                    promoTypeLabel: 'Mobile Only Deal'
                };
            }
            return {
                finalPrice: actualPrice,
                originalPrice: null,
                discountLabel: title,
                isMobileOnly: true,
                promoType: 'mobile_only',
                promoTypeLabel: 'Mobile Only Deal'
            };
        }

        if (bestPromo) {
            const isMobilePromo = bestPromo.promoType === 'mobile_only';
            const fPrice = applyDiscount(actualPrice, Number(bestPromo.discountValue), bestPromo.discountType);
            const label = isMobilePromo 
                ? `MOBILE ONLY: ${bestPromo.discountValue}${bestPromo.discountType === 'percentage' ? '%' : '₹'} OFF` 
                : `${bestPromo.discountValue}${bestPromo.discountType === 'percentage' ? '%' : '₹'} OFF (${bestPromo.code || 'PROMO'})`;
            
            return { 
                finalPrice: fPrice, 
                originalPrice: actualPrice, 
                discountLabel: label, 
                isMobileOnly: isMobilePromo,
                promoType: bestPromo.promoType,
                promoTypeLabel: getPromoTypeLabel(bestPromo.promoType)
            };
        }

        // 4. Default to Weekly/Monthly potential room discounts if no promo coupon applies
        const mDisc = Number(room?.monthlyDiscount || room?.monthly_discount || 0);
        const wDisc = Number(room?.weeklyDiscount || room?.weekly_discount || 0);

        if (mDisc > 0) {
            return { 
                finalPrice: applyDiscount(actualPrice, mDisc, 'percentage'), 
                originalPrice: actualPrice, 
                discountLabel: `${mDisc}% SPECIAL SAVINGS`, 
                isMobileOnly: false,
                promoType: 'standard',
                promoTypeLabel: 'Special Deal'
            };
        } else if (wDisc > 0) {
            return { 
                finalPrice: applyDiscount(actualPrice, wDisc, 'percentage'), 
                originalPrice: actualPrice, 
                discountLabel: `${wDisc}% SPECIAL DEAL`, 
                isMobileOnly: false,
                promoType: 'standard',
                promoTypeLabel: 'Special Deal'
            };
        }

        return { 
            finalPrice: actualPrice, 
            originalPrice: null, 
            discountLabel: null, 
            isMobileOnly: false,
            promoType: null,
            promoTypeLabel: null
        };
    };

    // Resilient Image Extraction
    const getImages = (data: any) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                // If not JSON, check if it's comma-separated
                if (data.includes(',')) return data.split(',').map(s => s.trim());
                // Otherwise treat as single image
                return [data.trim()];
            }
        }
        return [];
    };

    const hotelImages = getImages(hotel.images).filter((img: any) => typeof img === 'string' && img.trim() !== "");
    if (hotelImages.length === 0 && hotel.thumbnail) hotelImages.push(hotel.thumbnail);
    if (hotelImages.length === 0) hotelImages.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80");

    const hotelAmenities = safeParse(hotel.amenities || hotel.hotel_amenities, []);
    const mainAmenities = safeParse(hotel.mainAmenities || hotel.main_amenities, []);
    const displayAmenitiesList = (mainAmenities.length > 0 ? mainAmenities : (hotelAmenities.length > 0 ? hotelAmenities : [
        'wifi', 'pool', 'spa', 'air_conditioning', 'parking', 'restaurant'
    ]));

    const getCleanAmenityLabel = (a: any) => {
        if (typeof a === 'object' && a !== null) {
            return a.label || a.name || String(a.id || '');
        }
        const str = String(a || '').trim();
        const lower = str.toLowerCase();
        if (lower === 'ac' || lower === 'air_conditioning' || lower === 'air conditioning') return 'Air Conditioning';
        if (lower === 'wifi' || lower === 'wi-fi') return 'Free Wi-Fi';
        if (lower === 'pool') return 'Swimming Pool';
        if (lower === 'spa') return 'Spa & Wellness';
        if (lower === 'dining') return 'Dining';
        if (lower === 'parking') return 'Free Parking';
        const mapped = amenityLabel(lower);
        if (mapped && mapped !== lower) return mapped;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Dynamically extract all verified amenities set by partner admin / backend database for this hotel
    const actualHotelAmenities = useMemo(() => {
        const fromAmenities = safeParse(hotel?.amenities || hotel?.hotel_amenities, []);
        const fromMain = safeParse(hotel?.mainAmenities || hotel?.main_amenities, []);
        const fromRooms = (hotel?.rooms || []).flatMap((r: any) => safeParse(r?.amenities, []));
        
        const map = new Map<string, string>(); // lowerKey -> Clean Label

        const addItem = (item: any) => {
            const label = getCleanAmenityLabel(item);
            if (label && label.trim()) {
                const key = label.toLowerCase().trim();
                if (!map.has(key)) {
                    map.set(key, label.trim());
                }
            }
        };

        (Array.isArray(fromMain) ? fromMain : []).forEach(addItem);
        (Array.isArray(fromAmenities) ? fromAmenities : []).forEach(addItem);
        (Array.isArray(fromRooms) ? fromRooms : []).forEach(addItem);

        return Array.from(map.values());
    }, [hotel?.amenities, hotel?.hotel_amenities, hotel?.mainAmenities, hotel?.main_amenities, hotel?.rooms]);

    const allFacilitiesCategories = useMemo(() => {
        if (actualHotelAmenities.length === 0) {
            return [];
        }

        const categories: {
            title: string;
            iconType: 'sparkles' | 'bed' | 'bath' | 'utensils' | 'shield' | 'services';
            items: string[];
        }[] = [
            {
                title: "Popular Amenities",
                iconType: 'sparkles',
                items: []
            },
            {
                title: "Room Features & Comfort",
                iconType: 'bed',
                items: []
            },
            {
                title: "Bathroom & Personal Care",
                iconType: 'bath',
                items: []
            },
            {
                title: "Food, Drinks & Dining",
                iconType: 'utensils',
                items: []
            },
            {
                title: "Safety, Security & Hygiene",
                iconType: 'shield',
                items: []
            },
            {
                title: "Hotel Facilities & Services",
                iconType: 'services',
                items: []
            }
        ];

        actualHotelAmenities.forEach((label) => {
            const lower = label.toLowerCase();
            if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('pool') || lower.includes('parking') || lower.includes('gym') || lower.includes('spa')) {
                categories[0].items.push(label);
            } else if (lower.includes('bed') || lower.includes('room') || lower.includes('kettle') || lower.includes('ac') || lower.includes('air conditioning') || lower.includes('balcony') || lower.includes('terrace') || lower.includes('desk') || lower.includes('wardrobe') || lower.includes('tv')) {
                categories[1].items.push(label);
            } else if (lower.includes('bath') || lower.includes('geyser') || lower.includes('shower') || lower.includes('toilet') || lower.includes('towel') || lower.includes('hairdryer')) {
                categories[2].items.push(label);
            } else if (lower.includes('breakfast') || lower.includes('restaurant') || lower.includes('bar') || lower.includes('dining') || lower.includes('coffee') || lower.includes('tea') || lower.includes('food')) {
                categories[3].items.push(label);
            } else if (lower.includes('cctv') || lower.includes('security') || lower.includes('fire') || lower.includes('smoke') || lower.includes('hygiene') || lower.includes('sanitiz')) {
                categories[4].items.push(label);
            } else {
                categories[5].items.push(label);
            }
        });

        // Strictly show only categories that have actual hotel amenities configured in partner admin
        return categories.filter(cat => cat.items.length > 0);
    }, [actualHotelAmenities]);

    const filteredFacilitiesCategories = useMemo(() => {
        if (!facilitySearchQuery.trim()) return allFacilitiesCategories;
        const q = facilitySearchQuery.toLowerCase().trim();
        return allFacilitiesCategories
            .map(cat => ({
                ...cat,
                items: cat.items.filter(item => item.toLowerCase().includes(q))
            }))
            .filter(cat => cat.items.length > 0);
    }, [allFacilitiesCategories, facilitySearchQuery]);
    const reviews = hotel.reviews || hotel.review || [];
    const wellness = safeParse(hotel.wellness || hotel.hotel_wellness, { enabled: false, list: [] });
    const faqs = safeParse(hotel.faqs || hotel.hotel_faqs, []);
    const safety = safeParse(hotel.safety || hotel.hotel_safety, []);
    const policies = safeParse(hotel.policies || hotel.hotel_policies, {});


    // Pre-compute filtered rooms outside JSX to avoid IIFE parser issues
    // searchedGuests is derived from 'adults' (defined above near line 193)
    const displayRooms = rooms
        .filter((r: any) => {
            if (stayType === 'hourly' && !(r.isHourlyEnabled || r.is_hourly_enabled)) return false;
            
            // Filter out rooms that cannot accommodate the searched number of guests ONLY if guest count is explicitly searched
            if (searchParams.has("adults") || searchParams.has("guests")) {
                const maxOcc = r.maxOccupancy || r.max_occupancy || r.capacityAdults || 2;
                if (searchedGuests > maxOcc) return false;
            }
            
            return true;
        })
        .sort((a: any, b: any) => {
            if (stayType === 'hourly') {
                const rA = typeof a.hourlyRates === 'string' ? safeParse(a.hourlyRates, {}) : (a.hourlyRates || safeParse(a.hourly_rates, {}));
                const rB = typeof b.hourlyRates === 'string' ? safeParse(b.hourlyRates, {}) : (b.hourlyRates || safeParse(b.hourly_rates, {}));
                const pA = Number(rA[duration] || rA[String(duration)] || a.pricePerNight / 2);
                const pB = Number(rB[duration] || rB[String(duration)] || b.pricePerNight / 2);
                return pA - pB;
            }
            return (a.pricePerNight || 0) - (b.pricePerNight || 0);
        });

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-4">
            {/* 1. Static Rounded Search Pill (Same as Hotels page) */}
            <div className="w-full bg-white py-2 px-4 border-b border-slate-50 flex flex-col items-center gap-4">
                <div className="w-full max-w-7xl flex items-center justify-between">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBack();
                        }}
                        aria-label="Go Back to Listings"
                        className="p-2.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 rounded-full transition-all active:scale-90 cursor-pointer shrink-0 z-20 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>

                    <button
                        onClick={() => triggerCheckInDropdown()}
                        className="w-full md:w-[450px] flex items-center justify-between p-1 md:p-1.5 bg-white border border-slate-200 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all hover:bg-slate-50 group/pill"
                    >
                        <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 py-1.5 md:py-2">
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-[7px] md:text-[10px] font-black uppercase text-brand-600 tracking-wider">Where to?</span>
                                <span className="text-[10px] md:text-sm font-bold text-slate-900 truncate max-w-[80px] md:max-w-[120px]">{hotel.city}</span>
                            </div>
                            <div className="w-px h-5 md:h-6 bg-slate-200 mx-0.5 md:mx-1" />
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-[7px] md:text-[10px] font-black uppercase text-slate-400 tracking-wider">Dates & Guests</span>
                                <span className="text-[8px] md:text-[11px] font-bold text-slate-700 truncate max-w-[100px] md:max-w-none">
                                    {formatDateLabel(checkIn, checkOut)} • {adults}G
                                </span>
                            </div>
                        </div>
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-lg shrink-0 group-hover/pill:scale-105 transition-transform">
                            <Search className="w-3 h-3 md:w-5 md:h-5" />
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!user) {
                                setActionPopup({
                                    type: 'login',
                                    message: 'Please sign in or create an account to save hotels to your wishlist.',
                                    isOpen: true
                                });
                                return;
                            }
                            if (hotel) toggle(hotel.id || id, hotel);
                        }}
                        aria-label={user && hotel && isWishlisted(hotel.id || id) ? "Remove from wishlist" : "Save to wishlist"}
                        className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-red-500 rounded-full hover:bg-slate-100 active:scale-90 transition-all shrink-0 z-20 cursor-pointer"
                    >
                        <Heart className={cn("w-5 h-5 transition-colors", user && hotel && isWishlisted(hotel.id || id) ? "fill-red-500 text-red-500" : "text-slate-600")} />
                    </button>
                </div>
            </div>

            {/* 2. Top Property Info */}
            <div className="max-w-7xl mx-auto px-5 pt-4 pb-6">
                {/* Visual Breadcrumbs (Strictly Single Line) */}
                <nav className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 overflow-hidden whitespace-nowrap">
                    <Link to="/" className="hover:text-brand-600 transition-colors shrink-0">Home</Link>
                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                    <Link to="/hotels" className="hover:text-brand-600 transition-colors shrink-0">Hotels</Link>
                    {hotel.city && (
                        <>
                            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                            {["goa", "jaipur", "manali", "shimla", "udaipur", "delhi"].includes(hotel.city.toLowerCase().trim()) ? (
                                <Link to={`/${hotel.city.toLowerCase().trim()}-hotels`} className="hover:text-brand-600 transition-colors shrink-0 truncate max-w-[120px] sm:max-w-none">
                                    {hotel.city} Hotels
                                </Link>
                            ) : (
                                <Link to={`/hotels?city=${encodeURIComponent(hotel.city)}`} className="hover:text-brand-600 transition-colors shrink-0 truncate max-w-[120px] sm:max-w-none">
                                    {hotel.city} Hotels
                                </Link>
                            )}
                        </>
                    )}
                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="text-slate-600 truncate min-w-0 flex-1">{hotel.name}</span>
                </nav>

                <div className="space-y-2 mb-4">
                    {/* Top Row: Stars */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {[...Array(realStarRating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {realStarRating}-Star Hotel
                        </span>
                    </div>

                    {/* Hotel Name */}
                    <h1 
                        className={cn(
                            titleSizeClass,
                            "font-bold text-slate-950 tracking-tight line-clamp-2 md:line-clamp-3"
                        )}
                        title={hotel.name}
                    >
                        {hotel.name}
                    </h1>

                    {/* Address & Show on Map */}
                    <div className="flex items-start gap-2 text-slate-500 pt-0.5">
                        <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p 
                                onClick={() => setShowAddressModal(true)}
                                className="text-xs sm:text-sm font-semibold text-slate-700 line-clamp-2 cursor-pointer hover:text-slate-950 transition-colors group"
                                title="Click to view full address"
                            >
                                {hotel.address || hotel.city || 'Address not listed'}
                                <span className="text-brand-600 font-bold ml-1.5 whitespace-nowrap group-hover:underline">
                                    — Great location
                                </span>
                            </p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowAddressModal(true)}
                            className="text-brand-600 hover:text-brand-700 font-bold text-xs sm:text-sm underline shrink-0 whitespace-nowrap cursor-pointer ml-1 self-start"
                        >
                            Show on map
                        </button>
                    </div>
                </div>

                {/* 3. Image Gallery / Hero Section */}
                <div className="w-full md:px-0">
                    <ImageGallery images={hotelImages} hotelName={hotel.name} />

                    {/* Horizontally Scrollable Amenities Tabs Directly Under Property Photos */}
                    {displayAmenitiesList.length > 0 && (
                        <div className="w-full mt-3 sm:mt-4 relative group">
                            {/* Left gradient fade & navigation arrow */}
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 z-20 flex items-center pr-4 bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-300 pointer-events-none",
                                canScrollAmenitiesLeft ? "opacity-100" : "opacity-0"
                            )}>
                                <button
                                    type="button"
                                    onClick={() => handleScrollAmenities('left')}
                                    aria-label="Scroll amenities left"
                                    className="w-7 h-7 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-brand-600 hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Scroll container */}
                            <div
                                ref={amenitiesScrollRef}
                                onScroll={checkAmenitiesScroll}
                                className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-4 px-4 sm:mx-0 sm:px-0"
                            >
                                {displayAmenitiesList.map((a: any, idx: number) => {
                                    const label = getCleanAmenityLabel(a);
                                    if (!label) return null;
                                    return (
                                        <div
                                            key={`amenity-tab-${idx}`}
                                            className="shrink-0 px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 border border-slate-200/60 text-xs font-semibold whitespace-nowrap transition-colors select-none"
                                        >
                                            {label}
                                        </div>
                                    );
                                })}

                                {/* View All Amenities Button at End of Scroll */}
                                <button
                                    type="button"
                                    onClick={() => setShowFacilitiesDrawer(true)}
                                    className="shrink-0 px-4 py-1.5 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm mr-3 sm:mr-0"
                                >
                                    <span>View all</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Right gradient fade & navigation indicator arrow */}
                            <div className={cn(
                                "absolute right-0 top-0 bottom-0 z-20 flex items-center pl-4 bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity duration-300 pointer-events-none",
                                canScrollAmenitiesRight ? "opacity-100" : "opacity-0"
                            )}>
                                <button
                                    type="button"
                                    onClick={() => handleScrollAmenities('right')}
                                    aria-label="Scroll amenities right"
                                    className="w-7 h-7 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-brand-600 hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side-by-Side Check-in & Check-out Bar (Above About Property) */}
                {hotel?.listingType !== 'directory' && (
                    <div id="booking-bar" className="mt-5 mb-2 relative">
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:border-slate-300 transition-colors">
                            <div className="grid grid-cols-2 divide-x divide-slate-100">
                                {/* Left: Check-in / Arrival */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalCalendarMode("checkIn");
                                        setShowStayDetailsModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-all text-left group focus:outline-none cursor-pointer"
                                >
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-brand-50 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mb-0.5">
                                            {stayType === 'hourly' ? 'Arrival Date' : 'Check-in Date'}
                                        </p>
                                        <p className="text-xs sm:text-base font-black text-slate-900 truncate">
                                            {tempCheckIn ? tempCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Select Date"}
                                        </p>
                                        {stayType === 'hourly' && (
                                            <p className="text-[10px] font-bold text-brand-600 truncate mt-0.5">
                                                @ {tempArrivalTime}
                                            </p>
                                        )}
                                    </div>
                                </button>

                                {/* Right: Check-out / Duration */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalCalendarMode("checkOut");
                                        setShowStayDetailsModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-all text-left group focus:outline-none cursor-pointer"
                                >
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-amber-50 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        {stayType === 'hourly' ? <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" /> : <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mb-0.5">
                                            {stayType === 'hourly' ? 'Stay Duration' : 'Check-out Date'}
                                        </p>
                                        <p className="text-xs sm:text-base font-black text-slate-900 truncate">
                                            {stayType === 'hourly' ? `${tempDuration} Hours Stay` : (tempCheckOut ? tempCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Select Date")}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area (Full Width) */}
                <div className="space-y-12 mt-6 sm:mt-8">
                    {hotel?.listingType === 'directory' ? (
                        /* Frameless Minimal Directory Reception & Online Rate Section */
                        <section id="directory-hub" className="py-8 border-t border-slate-100">
                            {/* Minimal Clean Header */}
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                        Direct Front Desk & Online Rates
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Connect directly with reception for zero-commission quotes, or check verified live rates online.
                                    </p>
                                </div>
                                
                                <a 
                                    href="/list-property" 
                                    className="text-xs text-slate-400 hover:text-slate-800 font-medium inline-flex items-center gap-1 self-start sm:self-auto hover:underline"
                                >
                                    Hotel Manager? Claim Listing →
                                </a>
                            </div>

                            {/* Completely Frameless & Minimal 2-Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 pt-2">
                                {/* Left: Direct Reception Contact (Frameless & Normal BG) */}
                                <div className="space-y-4">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Direct Front Desk
                                    </div>

                                    <div className="space-y-3">
                                        {(hotel.contactPhone || hotel.phone) ? (
                                            <div className="flex flex-wrap items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyPhone(hotel.contactPhone || hotel.phone)}
                                                    className="group inline-flex items-center gap-3 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] text-slate-800 rounded-xl transition-all cursor-pointer text-left"
                                                    title="Click to copy number"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
                                                        {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Phone className="w-4 h-4 text-slate-600" />}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] block uppercase tracking-wider text-slate-400 font-semibold leading-none">
                                                            {copiedPhone ? 'Copied!' : 'Reception Phone (Click to copy)'}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-900 tracking-wide mt-0.5 block">
                                                            {hotel.contactPhone || hotel.phone}
                                                        </span>
                                                    </div>
                                                    <div className="pl-2 border-l border-slate-200 ml-1">
                                                        {copiedPhone ? (
                                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                                <Check className="w-3.5 h-3.5" /> Copied!
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 flex items-center gap-1">
                                                                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" /> Copy
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>

                                                <a
                                                    href={`tel:${hotel.contactPhone || hotel.phone}`}
                                                    onClick={() => {
                                                        try {
                                                            const url = `/api/hotels/${hotel.id}/track-lead`;
                                                            const payload = JSON.stringify({ action: 'call' });
                                                            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                                                                navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
                                                            } else {
                                                                fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
                                                            }
                                                        } catch (_) {}
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                    title="Direct call"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <span>Call Now ↗</span>
                                                </a>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No direct phone listed yet.</p>
                                        )}

                                        {hotel.contactEmail && (
                                            <div className="pt-1">
                                                <a
                                                    href={`mailto:${hotel.contactEmail}?subject=Reservation Enquiry for ${hotel.name} via GetHotelStays`}
                                                    onClick={() => {
                                                        try {
                                                            const url = `/api/hotels/${hotel.id}/track-lead`;
                                                            const payload = JSON.stringify({ action: 'email' });
                                                            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                                                                navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
                                                            } else {
                                                                fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
                                                            }
                                                        } catch (_) {}
                                                    }}
                                                    className="inline-flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
                                                >
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span>Email: <span className="font-semibold underline">{hotel.contactEmail}</span></span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Booking.com Rates (Frameless) */}
                                <div className="space-y-4 md:border-l md:border-slate-100 md:pl-8 lg:pl-12">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Online Travel Partner
                                        </div>
                                        <span className="text-[11px] font-medium text-emerald-600">
                                            Live Booking.com inventory
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#003580] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                                                B.
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 leading-tight">
                                                    Booking.com Official
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Verified guest ratings & reviews
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-left sm:text-right">
                                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Starting from</div>
                                                <div className="text-lg font-black text-slate-900">
                                                    {hotel.bookingPrice ? `₹${Number(hotel.bookingPrice).toLocaleString('en-IN')}` : (hotel.pricePerNight ? `₹${Number(hotel.pricePerNight).toLocaleString('en-IN')}` : 'Check Live')}
                                                    {(hotel.bookingPrice || hotel.pricePerNight) && <span className="text-xs font-normal text-slate-500"> /night</span>}
                                                </div>
                                            </div>

                                            <a
                                                href={cleanBookingUrl}
                                                target="_blank"
                                                rel="nofollow noopener noreferrer"
                                                onClick={() => {
                                                    try {
                                                        const url = `/api/hotels/${hotel.id}/track-lead`;
                                                        const payload = JSON.stringify({ action: 'ota_booking' });
                                                        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                                                            navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
                                                        } else {
                                                            fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
                                                        }
                                                    } catch (_) {}
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white text-xs font-bold transition-all shadow-xs hover:shadow active:scale-[0.99] shrink-0"
                                            >
                                                <span>Check Deal</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-2">
                                        <span>Free cancellation options available</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        /* 2. Rooms Inventory */
                        <section id="rooms" className="space-y-6 pt-6 sm:pt-8 border-t border-slate-200/80">
                        {stayType === 'hourly' && (
                            <div className="bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tighter leading-none">Hourly Stays Active</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Select your preferred time slot</p>
                                    </div>
                                </div>
                                <div className="relative group w-full md:w-auto">
                                    <select 
                                        value={duration}
                                        onChange={(e) => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.set("duration", e.target.value);
                                            setSearchParams(newParams);
                                        }}
                                        className="w-full md:w-auto appearance-none pl-8 pr-12 py-3.5 bg-white border-2 border-blue-100 text-slate-900 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm hover:border-blue-400 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="3">3 Hours Stay</option>
                                        <option value="6">6 Hours Stay</option>
                                        <option value="12">12 Hours Stay</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none group-hover:text-blue-600 transition-colors" />
                                </div>
                            </div>
                        )}

                        <div id="rooms-section" className="flex items-center justify-between mb-4">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                                Available Rooms
                            </h2>
                        </div>
                        <div className="space-y-8">
                            {fetchingRooms ? (
                                <div className="space-y-6">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-150 animate-pulse flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-1/3 h-44 bg-slate-200/70 rounded-2xl shrink-0" />
                                            <div className="flex-1 space-y-3.5 py-2">
                                                <div className="h-5 bg-slate-200/70 rounded-full w-2/5" />
                                                <div className="h-3 bg-slate-200/70 rounded-full w-4/5" />
                                                <div className="flex gap-2.5 pt-2">
                                                    <div className="h-6 w-20 bg-slate-200/70 rounded-full" />
                                                    <div className="h-6 w-24 bg-slate-200/70 rounded-full" />
                                                </div>
                                                <div className="h-9 bg-slate-200/70 rounded-xl w-32 mt-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : displayRooms.length === 0 ? (
                                <div className="py-12 sm:py-16 text-center space-y-4 flex flex-col items-center justify-center">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                                        No Rooms Available
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setModalCalendarMode("checkIn");
                                            setShowStayDetailsModal(true);
                                        }}
                                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer"
                                    >
                                        Modify Search
                                    </button>
                                </div>
                            ) : displayRooms.map((room: any) => {
                                    const variants = safeParse(room.variants || room.room_variants, []);
                                    const rPol = (() => {
                                        const p = safeParse(room.roomPolicies || room.room_policies || room.policies, {});
                                        return Array.isArray(p) ? (p[0] || {}) : p;
                                    })();
                                    
                                    const displayItems = stayType === 'hourly'
                                        ? [{ 
                                            mealPlan: `${duration} Hours Stay`, 
                                            price: room.pricePerNight, 
                                            isHourly: true,
                                            policy: rPol.cancellation || "Standard Policy"
                                          }]
                                        : (variants.length > 0 ? variants.map((v: any) => {
                                            const nameLower = (v.mealPlan || "").toLowerCase();
                                            if ((nameLower.includes("room only") || nameLower === "ep") && (!v.price || Number(v.price) === 0)) {
                                                return { ...v, price: room.pricePerNight };
                                            }
                                            return v;
                                          }) : [
                                            { mealPlan: "Room Only (EP)", price: room.pricePerNight, policy: rPol.cancellation || "Standard Policy" }
                                        ]);

                                    return (
                                        <div key={room.id} className="space-y-6">
                                            {/* Room Type Header */}
                                            <div className="flex items-center gap-3 px-2">
                                                <div className="w-1 h-4 bg-brand-600 rounded-full" />
                                                <h3 className="text-sm sm:text-base font-medium text-slate-700 capitalize tracking-normal">
                                                    {room.name}
                                                </h3>
                                            </div>

                                            {/* Desktop View: Individual Variant Cards */}
                                            <div className="hidden md:grid grid-cols-1 gap-6">
                                                {displayItems.map((variant: any, vIdx: number) => {
                                                    const rates = typeof room.hourlyRates === 'string' ? safeParse(room.hourlyRates, {}) : (room.hourlyRates || safeParse(room.hourly_rates, {}));
                                                    const isHourly = stayType === 'hourly';
                                                    const hourlyPrice = isHourly ? Number(rates[duration] || rates[String(duration)] || room.pricePerNight / 2) : 0;
                                                    const stayInfo = calculateStayPrice(isHourly ? hourlyPrice : variant.price, room, allAvailableCoupons);
                                                    const finalDisplayPrice = stayInfo.finalPrice;

                                                    return (
                                                        <div
                                                            key={vIdx}
                                                            onClick={() => setSelectedRoomForDetails({ ...room, selectedVariant: variant })}
                                                            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group flex h-52 cursor-pointer"
                                                        >
                                                            <div className="w-1/3 relative overflow-hidden">
                                                                <Image
                                                                    src={getImages(room.images)[0] || room.thumbnail || hotel.thumbnail}
                                                                    alt={room.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                                                                    {!isHourly && (variant.mealPlan?.toLowerCase().includes('breakfast') || variant.mealPlan?.toLowerCase().includes('cp')) && (
                                                                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                                                                            <Coffee className="w-3 h-3" /> Breakfast Included
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 p-6 flex flex-col justify-between border-r border-slate-100">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="text-base font-semibold text-slate-900 tracking-normal capitalize flex items-center gap-2">
                                                                            <span>{room.name}</span>
                                                                            {variant.mealPlan && (
                                                                                <span className="text-xs font-normal text-slate-500 normal-case">({variant.mealPlan})</span>
                                                                            )}
                                                                        </h4>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedRoomForDetails({ ...room, selectedVariant: variant });
                                                                            }}
                                                                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                                                        >
                                                                            <Info className="w-3 h-3 text-slate-500" /> Details
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                                                                        <div className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-slate-400" /> {room.sizeM2 || 250} sq.ft</div>
                                                                        <span>•</span>
                                                                        <div className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-slate-400" /> {room.bedConfiguration || "Double Bed"}</div>
                                                                        <span>•</span>
                                                                        <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {room.maxOccupancy || room.capacityAdults || 2} Guests</div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 pt-2">
                                                                    {(variant.policy?.toLowerCase().includes('free') || rPol.cancellation?.toLowerCase().includes('free')) && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200/60">
                                                                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Free Cancellation
                                                                        </span>
                                                                    )}
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                                                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Instant Confirmation
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="w-60 p-6 bg-slate-50/60 flex flex-col justify-center items-center text-center gap-3">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                                        {stayType === 'hourly' ? `Price for ${duration} Hours` : 'Price per night'}
                                                                    </p>
                                                                    <div className="flex flex-col items-center">
                                                                        {stayInfo.originalPrice && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-xs font-semibold text-slate-400 line-through">{formatPrice(stayInfo.originalPrice)}</span>
                                                                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold">
                                                                                    {Math.round((1 - stayInfo.finalPrice / stayInfo.originalPrice) * 100)}% OFF
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <span className="text-2xl font-bold text-slate-900">{formatPrice(finalDisplayPrice)}</span>
                                                                        <span className="text-[10px] text-slate-400">+ taxes & fees</span>
                                                                    </div>
                                                                </div>
                                                                {selectedRooms[`${room.id}_${vIdx}`] ? (
                                                                    <div className="w-full flex items-center justify-between bg-brand-50 rounded-xl p-1 shadow-inner border border-brand-100">
                                                                        <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), -1, room.inventory || 5)} className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                            <Minus className="w-4 h-4" />
                                                                        </button>
                                                                        <span className="text-xs font-bold text-brand-700">{selectedRooms[`${room.id}_${vIdx}`]} Selected</span>
                                                                        <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), 1, room.inventory || 5)} className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                            <Plus className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => handleBook(e, room.id, vIdx.toString())}
                                                                        className="w-full py-2.5 bg-brand-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-700 active:scale-98 transition-all shadow-sm"
                                                                    >
                                                                        Book Room
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Mobile View: Horizontal Scroll */}
                                            <div className="md:hidden flex gap-4 overflow-x-auto pb-10 no-scrollbar px-1 snap-x">
                                                {displayItems.map((variant: any, vIdx: number) => {
                                                    const isBreakfast = variant.mealPlan?.toLowerCase().includes('breakfast') || 
                                                                      variant.mealPlan?.toLowerCase().includes('cp') || 
                                                                      variant.mealPlan?.toLowerCase().includes('map') || 
                                                                      variant.mealPlan?.toLowerCase().includes('ap') ||
                                                                      variant.mealPlan?.toLowerCase().includes("b'fast") ||
                                                                      room.name?.toLowerCase().includes('breakfast') ||
                                                                      safeParse(room.amenities, []).some((a: string) => a.toLowerCase().includes('breakfast'));
                                                    const rPolMob = (() => {
                                                        const p = safeParse(room.roomPolicies || room.room_policies || room.policies, {});
                                                        return Array.isArray(p) ? (p[0] || {}) : p;
                                                    })();
                                                    const isFreeCancel = variant.policy?.toLowerCase().includes('free') || rPolMob.cancellation?.toLowerCase().includes('free');
                                                    const rates = typeof room.hourlyRates === 'string' ? safeParse(room.hourlyRates, {}) : (room.hourlyRates || safeParse(room.hourly_rates, {}));
                                                    const bPrice = stayType === 'hourly' ? (rates[duration] || rates[String(duration)] || room.pricePerNight / 2) : variant.price;
                                                    const sInfo = calculateStayPrice(bPrice, room, allAvailableCoupons);

                                                    return (
                                                        <div
                                                            key={`${room.id}-${vIdx}`}
                                                            onClick={() => setSelectedRoomForDetails({ ...room, selectedVariant: variant })}
                                                            className="min-w-[285px] sm:min-w-[320px] max-w-[340px] snap-start bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                                                        >
                                                            <div className="h-44 relative overflow-hidden">
                                                                <Image
                                                                    src={getImages(room.images)[0] || room.thumbnail || hotel.thumbnail}
                                                                    alt={room.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                                                                    {stayType !== 'hourly' && isBreakfast && (
                                                                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                                            <Coffee className="w-3 h-3" /> Breakfast Included
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="p-4 space-y-3 flex-1 flex flex-col">
                                                                <div>
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <h4 className="text-sm sm:text-base font-semibold text-slate-900 tracking-normal capitalize line-clamp-1">
                                                                            {room.name}
                                                                        </h4>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedRoomForDetails({ ...room, selectedVariant: variant });
                                                                            }}
                                                                            className="shrink-0 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-md border border-slate-200/60 flex items-center gap-1"
                                                                        >
                                                                            <Info className="w-2.5 h-2.5" /> Details
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px] font-medium">
                                                                        <span>{room.sizeM2 || 250} sq.ft</span>
                                                                        <span>•</span>
                                                                        <span>{room.maxOccupancy || room.capacityAdults || 2} Guests</span>
                                                                        <span>•</span>
                                                                        <span>{room.bedConfiguration || "1 Bed"}</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                                        {isBreakfast ? (
                                                                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">Breakfast Included</span>
                                                                        ) : (
                                                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">Room Only</span>
                                                                        )}
                                                                        {isFreeCancel && (
                                                                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold">Free Cancellation</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex-1 flex flex-col justify-end pt-3 border-t border-slate-100 gap-3">
                                                                    <div className="flex items-baseline justify-between">
                                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                                            {stayType === 'hourly' ? `Price for ${duration}h` : 'Per night'}
                                                                        </span>
                                                                        <div className="flex items-baseline gap-1.5">
                                                                            {sInfo.originalPrice && (
                                                                                <span className="text-xs font-medium text-slate-400 line-through">{formatPrice(sInfo.originalPrice)}</span>
                                                                            )}
                                                                            <span className="text-xl font-bold text-slate-900 leading-none">
                                                                                {formatPrice(sInfo.finalPrice)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {selectedRooms[`${room.id}_${vIdx}`] ? (
                                                                        <div className="w-full flex items-center justify-between bg-brand-50 rounded-xl p-1 shadow-inner border border-brand-100">
                                                                            <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), -1, room.inventory || 5)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                                <Minus className="w-3 h-3" />
                                                                            </button>
                                                                            <span className="text-xs font-bold text-brand-700">{selectedRooms[`${room.id}_${vIdx}`]} Selected</span>
                                                                            <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), 1, room.inventory || 5)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                                <Plus className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={(e) => handleBook(e, room.id, vIdx.toString())}
                                                                            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs active:scale-[0.98] transition-all"
                                                                        >
                                                                            Book Room
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                )}

                    {/* 3. Wellness & Facilities */}
                    {wellness.enabled && (
                        <section className="space-y-6 pt-4 border-t border-slate-100">
                            <h2 className="text-2xl font-black italic tracking-tight uppercase border-l-4 border-blue-600 pl-4">Wellness & Spa</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {wellness.list.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-6 p-8 bg-slate-50/50 rounded-[40px]">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                            {item.icon || "✨"}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.title}</p>
                                            <p className="text-[10px] font-bold text-slate-500 italic mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 4. Guest Reviews */}
                    <section id="reviews-section" className="space-y-4 pt-6 sm:pt-8 border-t border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                                Reviews
                            </h2>
                            {Array.isArray(reviews) && reviews.length > 0 && (
                                <span className="text-xs font-semibold text-slate-500">
                                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                </span>
                            )}
                        </div>

                        {Array.isArray(reviews) && reviews.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                                    {reviews.map((rev: any) => (
                                        <div 
                                            key={rev.id} 
                                            onClick={() => setSelectedDetailedReview(rev)}
                                            className="w-[260px] sm:w-[280px] min-h-[130px] max-h-[210px] shrink-0 snap-start p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                                        >
                                            <div className="space-y-2.5">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-slate-900 leading-snug truncate">{rev.user?.name || "Verified Guest"}</p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(rev.createdAt)}</p>
                                                    </div>
                                                    <div className="px-2 py-0.5 bg-brand-50 text-brand-600 border border-brand-200/70 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0">
                                                        <Star className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
                                                        {rev.rating || "5.0"}
                                                    </div>
                                                </div>
                                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                                                    {parseComment(rev.comment) || "Exceptional stay, everything was perfect!"}
                                                </p>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-3">
                                                <span className="font-medium text-slate-500">Verified Stay</span>
                                                <span className="text-brand-600 font-semibold hover:underline">Read review</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {reviews.length > 4 && (
                                    <button
                                        onClick={() => setShowReviewsModal(true)}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all block mx-auto text-center cursor-pointer mt-2"
                                    >
                                        View All {reviews.length} Reviews
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                                <p className="text-xs sm:text-sm font-medium text-slate-500">No reviews yet for this stay.</p>
                            </div>
                        )}
                    </section>

                    {/* About Property */}
                    <section className="space-y-4 pt-6 sm:pt-8 border-t border-slate-200/80">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                            About this property
                        </h2>
                        <div className="relative">
                            <p className={cn(
                                "text-slate-600 leading-relaxed text-sm md:text-base font-normal whitespace-pre-line transition-all duration-300",
                                !isDescriptionExpanded && "line-clamp-6"
                            )}>
                                {hotel.description}
                            </p>
                            {hotel.description && (hotel.description.length > 250 || hotel.description.split('\n').length > 6) && (
                                <button
                                    onClick={() => setIsDescriptionExpanded(prev => !prev)}
                                    className="mt-3 text-brand-600 hover:text-brand-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    {isDescriptionExpanded ? (
                                        <>View Less <ChevronUp className="w-3.5 h-3.5" /></>
                                    ) : (
                                        <>View More <ChevronDown className="w-3.5 h-3.5" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </section>

                    {/* 5. Policies & Safety */}
                    {(() => {
                        const dynamicPolicies = safeParse(hotel.policies, {});
                        const appleEmoji = (code: string) => `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${code}.png`;

                        const formatTime = (val: string, fallback: string) => {
                            if (!val) return fallback;
                            const clean = val.trim();
                            if (clean.includes(":") && clean.length <= 5) {
                                const [h, m] = clean.split(":").map(Number);
                                if (!isNaN(h)) {
                                    const period = h >= 12 ? "PM" : "AM";
                                    const hour12 = h % 12 === 0 ? 12 : (h > 12 ? h - 12 : h);
                                    const minStr = isNaN(m) ? "00" : String(m).padStart(2, "0");
                                    return `${hour12}:${minStr} ${period}`;
                                }
                            }
                            return clean;
                        };

                        return (
                            <section id="policies" className="space-y-4 pt-6 sm:pt-8 border-t border-slate-200/80">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                                        Hotel Policies & House Rules
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Essential check-in terms, guest guidelines, and payment flexibility for this stay</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
                                    {/* Card 1: Check-in & Check-out */}
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <img src={appleEmoji('1f55b')} alt="clock" className="w-5 h-5 shrink-0 object-contain" />
                                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Check-in & Check-out</h3>
                                        </div>

                                        <div className="space-y-1.5 text-sm">
                                            <p className="text-slate-800 font-medium">
                                                <span className="text-slate-500 font-normal">Check-in from:</span> <span className="font-bold text-slate-900">{formatTime(dynamicPolicies.checkIn, "2:00 PM")}</span> onwards
                                            </p>
                                            <p className="text-slate-800 font-medium">
                                                <span className="text-slate-500 font-normal">Check-out until:</span> <span className="font-bold text-slate-900">{formatTime(dynamicPolicies.checkOut, "11:00 AM")}</span>
                                            </p>
                                        </div>

                                        <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                            24/7 front desk assistance available. Early check-in or late check-out can be requested upon booking and is subject to property availability.
                                        </p>
                                    </div>

                                    {/* Card 2: Guest ID & Couple Policy */}
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <img src={appleEmoji('1faaa')} alt="id" className="w-5 h-5 shrink-0 object-contain" />
                                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Guest ID & Couple Policy</h3>
                                        </div>

                                        <div className="space-y-2 text-xs sm:text-sm">
                                            <p className="text-slate-800 font-medium leading-relaxed">
                                                <span className="font-bold text-slate-900">100% Couple Friendly:</span> Unmarried adult couples (18+) are welcome with complete privacy.
                                            </p>
                                            <p className="text-slate-800 font-medium leading-relaxed">
                                                <span className="font-bold text-slate-900">Govt. ID Required:</span> Valid original physical or DigiLocker ID (Aadhaar, Passport, DL, or Voter ID) accepted. Local IDs welcome.
                                            </p>
                                        </div>

                                        <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                            Primary guest must be at least 18 years of age with a valid government-issued photo identity proof.
                                        </p>
                                    </div>

                                    {/* Card 3: House Rules & Decorum */}
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <img src={appleEmoji('1f4cb')} alt="rules" className="w-5 h-5 shrink-0 object-contain" />
                                            <h3 className="text-base font-bold text-slate-900 tracking-tight">House Rules & Decorum</h3>
                                        </div>

                                        <div className="space-y-1.5 text-xs sm:text-sm">
                                            <p className="text-slate-800 font-medium">
                                                <span className="font-bold text-slate-900">• Smoking:</span> Non-smoking inside guestrooms (outdoor smoking areas available)
                                            </p>
                                            <p className="text-slate-800 font-medium">
                                                <span className="font-bold text-slate-900">• Parties & Events:</span> Not permitted to maintain quiet guest environment
                                            </p>
                                            <p className="text-slate-800 font-medium">
                                                <span className="font-bold text-slate-900">• Pets:</span> Pets not allowed on property premises
                                            </p>
                                            <p className="text-slate-800 font-medium">
                                                <span className="font-bold text-slate-900">• Quiet Hours:</span> 10:00 PM to 7:00 AM
                                            </p>
                                        </div>

                                        <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                            Children under 5 years stay complimentary with parents using existing bedding.
                                        </p>
                                    </div>

                                    {/* Card 4: Payment & Cancellation */}
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <img src={appleEmoji('1f4b3')} alt="payment" className="w-5 h-5 shrink-0 object-contain" />
                                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Payment & Cancellation</h3>
                                        </div>

                                        <div className="space-y-2 text-xs sm:text-sm">
                                            <p className="text-slate-800 font-medium leading-relaxed">
                                                <span className="font-bold text-slate-900">Pay 12% Deposit:</span> Reserve online with only 12% advance deposit; balance 88% is payable at hotel reception upon check-in.
                                            </p>
                                            <p className="text-slate-800 font-medium leading-relaxed">
                                                <span className="font-bold text-slate-900">Free Cancellation:</span> Cancel free up to 24 hours before scheduled check-in for an immediate full deposit refund.
                                            </p>
                                        </div>

                                        <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                            UPI, Credit/Debit cards, Net Banking and Cash accepted at hotel reception.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        );
                    })()}

                    {/* FAQs Section (Booking.com Style) */}
                    {hotelFaqs.length > 0 && (
                        <section className="space-y-10 pt-16 pb-20">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">FAQs about {hotel.name}</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                {hotelFaqs.map((faq: any, idx: number) => {
                                    return (
                                        <div key={idx}>
                                            <FAQItem faq={faq} />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* 6. Trending Hotels in Area */}
                    {trendingHotels.length > 0 && (
                        <section className="space-y-4 pt-6 sm:pt-8 border-t border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                                        Trending Stays Nearby
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Top-rated properties in and around {hotel.city}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-1">
                                {trendingHotels.map((h: any) => (
                                    <Link
                                        key={h.id}
                                        to={getHotelUrl(h.id, h.name)}
                                        target="_blank"
                                        className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                                                <Image
                                                    src={h.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"}
                                                    alt={h.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1 border border-slate-100">
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                    <span>{h.guestRating || h.starRating || "4.5"}</span>
                                                </div>
                                                {h.city && (
                                                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-slate-950/70 backdrop-blur-sm text-white rounded-md text-[10px] font-semibold tracking-wide">
                                                        {h.city}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 space-y-1.5">
                                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                                                    {h.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">{h.address || h.city}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-medium block">Starting from</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-base font-black text-slate-900">{formatPrice(h.pricePerNight)}</span>
                                                    <span className="text-[10px] text-slate-500 font-normal">/ night</span>
                                                </div>
                                            </div>

                                            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-brand-600 group-hover:text-white transition-all flex items-center justify-center shrink-0">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Hotel FAQs Section for SEO & User Clarity */}
                    <section className="space-y-4 pt-6 sm:pt-8 border-t border-slate-200/80">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Quick answers to common questions about {hotel.name}</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/70 px-5 sm:px-6 divide-y divide-slate-100">
                            {[
                                {
                                    question: `Is ${hotel.name} couple friendly and are local IDs accepted?`,
                                    answer: `Yes, ${hotel.name} is 100% couple friendly and welcomes adult couples (18+). Valid original government photo IDs including Aadhaar Card, Driving License, Voter ID, and Passport are accepted at check-in with complete privacy.`
                                },
                                {
                                    question: `Can I book ${hotel.name} by paying only a 12% deposit?`,
                                    answer: `Yes! You can reserve your room on GetHotelStays by paying only a 12% advance deposit online. The remaining balance is paid directly at the hotel reception upon check-in.`
                                },
                                {
                                    question: `What are the check-in and check-out timings?`,
                                    answer: `Standard check-in is from 12:00 PM and check-out is until 11:00 AM. 24-hour reception is available for seamless arrivals.`
                                },
                                {
                                    question: `Where is this property located?`,
                                    answer: `${hotel.name} is situated at ${hotel.address || hotel.city || 'Delhi, India'}, offering convenient access to local transit, business hubs, and city attractions.`
                                },
                                {
                                    question: `What amenities are included with the rooms?`,
                                    answer: `Rooms come equipped with air conditioning, complimentary high-speed Wi-Fi, en-suite private bathrooms with 24/7 hot/cold water, clean sanitized linen, and daily housekeeping.`
                                }
                            ].map((faq, idx) => (
                                <FAQItem key={idx} faq={faq} />
                            ))}
                        </div>
                    </section>

                    {/* Final Thank You Message */}
                    <section className="pt-4 pb-2 border-t border-slate-100 flex flex-col items-center text-center space-y-5">
                        <div className="max-w-xl space-y-3">
                            <h2 className="text-3xl font-bold text-slate-950 tracking-tighter leading-none">A Heartfelt Thank You.</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Thank you for exploring this property with GetHotel Stays. We are honored to be a part of your journey to finding the perfect stay. Your trust drives us to deliver excellence in every experience.
                            </p>
                        </div>
                        <div className="pt-4 flex items-center gap-3">
                            <span className="h-px w-12 bg-slate-200"></span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Enjoy Your Travels</span>
                            <span className="h-px w-12 bg-slate-200"></span>
                        </div>
                    </section>
                </div>
            </div>

            {/* Room Details Overlay (Drawer on Mobile, Modal on Desktop) */}
            <AnimatePresence>
                {selectedRoomForDetails && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setSelectedRoomForDetails(null);
                                setCurrentRoomImage(0);
                            }}
                            className="fixed inset-0 z-[350] bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* 📱 MOBILE DRAWER */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 350 }}
                            drag="y"
                            dragControls={roomDetailsDragControls}
                            dragListener={false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 0.7 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 80 || info.velocity.y > 300) {
                                    setSelectedRoomForDetails(null);
                                    setCurrentRoomImage(0);
                                }
                            }}
                            className="fixed bottom-0 left-0 right-0 z-[351] bg-white rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:hidden"
                        >
                            {/* Drag / Pull Indicator Handle */}
                            <div
                                onPointerDown={(e) => roomDetailsDragControls.start(e)}
                                className="pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none group shrink-0"
                                title="Drag down to close"
                            >
                                <div className="w-10 h-1 rounded-full bg-slate-300 group-hover:bg-slate-400 group-active:bg-slate-500 transition-colors" />
                            </div>
                            <div className="overflow-y-auto px-5 pt-1 space-y-5 pb-44">
                                <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
                                    <div
                                        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                                        onScroll={(e) => {
                                            const target = e.target as HTMLDivElement;
                                            const index = Math.round(target.scrollLeft / target.clientWidth);
                                            setCurrentRoomImage(index);
                                        }}
                                    >
                                        {getImages(selectedRoomForDetails.images).map((img, idx) => (
                                            <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                                                <Image
                                                    src={img || selectedRoomForDetails.thumbnail || hotel.thumbnail}
                                                    alt={`${selectedRoomForDetails.name} ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => { setSelectedRoomForDetails(null); setCurrentRoomImage(0); }} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white text-slate-700 transition-all z-10">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">{selectedRoomForDetails.name}</h3>
                                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                            {selectedRoomForDetails.roomSize && (
                                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    {selectedRoomForDetails.roomSize}
                                                </span>
                                            )}
                                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                                {selectedRoomForDetails.maxOccupancy || selectedRoomForDetails.capacityAdults || 2} Guests
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                <Bed className="w-3.5 h-3.5 text-slate-500" />
                                                {selectedRoomForDetails.bedConfiguration || "1 Bed"}
                                            </span>
                                        </div>
                                        {selectedRoomForDetails.description && (
                                            <p className="text-xs text-slate-500 leading-relaxed font-normal pt-1">
                                                {selectedRoomForDetails.description}
                                            </p>
                                        )}
                                    </div>
                                    {safeParse(selectedRoomForDetails.amenities, []).length > 0 && (
                                        <div className="space-y-2.5 pt-1">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Room Amenities</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {safeParse(selectedRoomForDetails.amenities, []).map((amenity: string) => {
                                                    const lower = (amenity || '').toLowerCase();
                                                    return (
                                                        <div 
                                                            key={amenity} 
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                                                        >
                                                            {lower.includes('wifi') || lower.includes('internet') ? (
                                                                <Wifi className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                                            ) : lower.includes('coffee') || lower.includes('tea') || lower.includes('breakfast') ? (
                                                                <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                            ) : lower.includes('food') || lower.includes('dining') || lower.includes('meal') ? (
                                                                <Utensils className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                                            ) : lower.includes('bath') || lower.includes('shower') || lower.includes('tub') ? (
                                                                <Bath className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                            ) : (
                                                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            )}
                                                            <span className="capitalize">{amenityLabel(amenity)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2.5 pt-1">
                                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Highlights</h4>
                                        <div className="space-y-2">
                                            {(stayType === 'hourly' 
                                                ? ["Instant booking confirmation", `Exclusive ${duration} hour pricing`, "Safe and secure check-in"]
                                                : (safeParse(selectedRoomForDetails.trustPoints, []).length > 0 ? safeParse(selectedRoomForDetails.trustPoints, []) : [
                                                    "Instant confirmation & secure stay",
                                                    "Pay 12% advance, rest 88% at hotel"
                                                ])
                                            ).map((point: string, pIdx: number) => (
                                                <div key={pIdx} className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                    <span>{point}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-[352]">
                                <div className="max-w-md mx-auto space-y-3">
                                    <div className="flex items-center justify-between">
                                         {(() => {
                                              const rates = typeof selectedRoomForDetails.hourlyRates === 'string' ? safeParse(selectedRoomForDetails.hourlyRates, {}) : (selectedRoomForDetails.hourlyRates || safeParse(selectedRoomForDetails.hourly_rates, {}));
                                              const bPrice = stayType === 'hourly' ? (rates[duration] || rates[String(duration)] || selectedRoomForDetails.pricePerNight / 2) : selectedRoomForDetails.selectedVariant?.price;
                                              const sInfo = calculateStayPrice(bPrice, selectedRoomForDetails, coupons);
                                              const stayNights = (() => {
                                                  if (stayType === 'hourly') return 1;
                                                  if (!checkIn || !checkOut || checkIn === "Dates" || checkOut === "Dates") return 1;
                                                  const start = new Date(checkIn);
                                                  const end = new Date(checkOut);
                                                  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                                  return diff > 0 ? diff : 1;
                                              })();
                                              const totalStayPrice = sInfo.finalPrice * stayNights;
                                              const advanceAmt = Math.round(totalStayPrice * 0.12);
                                              const restAmt = totalStayPrice - advanceAmt;
                                              
                                              return (
                                                  <>
                                                      <div className="flex flex-col">
                                                          {sInfo.originalPrice && (
                                                              <div className="flex items-center gap-1.5 mb-0.5">
                                                                  <span className="text-[10px] text-slate-400 line-through">{formatPrice(sInfo.originalPrice * stayNights)}</span>
                                                                  <span className="text-[9px] font-bold text-emerald-600">{Math.round((1 - sInfo.finalPrice / sInfo.originalPrice) * 100)}% OFF</span>
                                                              </div>
                                                          )}
                                                          <div className="flex items-baseline gap-1">
                                                              <span className="text-xl font-bold text-slate-900 leading-none">{formatPrice(sInfo.finalPrice)}</span>
                                                              <span className="text-[11px] text-slate-400 font-medium">{stayType === 'hourly' ? `/${duration}h` : '/night'}</span>
                                                          </div>
                                                          {stayNights > 1 && (
                                                              <span className="text-[10px] text-slate-500 mt-0.5">
                                                                  Total: <span className="font-semibold text-slate-800">{formatPrice(totalStayPrice)}</span> ({stayNights}n)
                                                              </span>
                                                          )}
                                                      </div>
                                                      <div className="flex flex-col items-end">
                                                          <div className="px-2.5 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-lg flex items-center gap-1">
                                                              <span className="text-[10px] font-medium">Pay 12%:</span>
                                                              <span className="text-xs font-bold">{formatPrice(advanceAmt)}</span>
                                                          </div>
                                                          <span className="text-[10px] text-slate-400 mt-1 font-medium">Rest at hotel: {formatPrice(restAmt)}</span>
                                                      </div>
                                                  </>
                                              );
                                          })()}
                                    </div>
                                    {(() => {
                                        const vIdx = hotel.room.findIndex((r: any) => r.id === selectedRoomForDetails.id); 
                                        const currentVariantIdx = selectedRoomForDetails.selectedVariant ? 
                                            (selectedRoomForDetails.variants?.indexOf(selectedRoomForDetails.selectedVariant) ?? 0).toString() : "0";
                                        const cartKey = `${selectedRoomForDetails.id}_${currentVariantIdx}`;

                                        if (selectedRooms[cartKey]) {
                                            return (
                                                <div className="w-full flex items-center justify-between bg-brand-50 rounded-xl p-2 border border-brand-100">
                                                    <button onClick={(e) => handleCartQuantity(e, selectedRoomForDetails.id, currentVariantIdx, -1, selectedRoomForDetails.inventory || 5)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 shadow-sm">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-xs font-bold text-brand-700">{selectedRooms[cartKey]} Room{selectedRooms[cartKey] > 1 ? 's' : ''} Selected</span>
                                                    <button onClick={(e) => handleCartQuantity(e, selectedRoomForDetails.id, currentVariantIdx, 1, selectedRoomForDetails.inventory || 5)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 shadow-sm">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return (
                                            <button
                                                onClick={(e) => handleBook(e, selectedRoomForDetails.id, currentVariantIdx)}
                                                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                                            >
                                                Reserve Room <ChevronRight className="w-4 h-4" />
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </motion.div>

                        {/* 💻 DESKTOP MODAL */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-4 md:inset-8 lg:inset-16 z-[351] bg-white rounded-2xl shadow-2xl overflow-hidden hidden md:flex border border-slate-200"
                        >
                            {/* Left: Image Section */}
                            <div className="w-[45%] relative bg-slate-100 group/imageSection">
                                <AnimatePresence mode="popLayout" custom={slideDirection}>
                                    <motion.div
                                        key={currentRoomImage}
                                        custom={slideDirection}
                                        variants={{
                                            initial: (direction: number) => ({
                                                x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
                                                opacity: 0
                                            }),
                                            animate: { x: 0, opacity: 1 },
                                            exit: (direction: number) => ({
                                                x: direction > 0 ? "-100%" : direction < 0 ? "100%" : 0,
                                                opacity: 0
                                            })
                                        }}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{ 
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.3 }
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={getImages(selectedRoomForDetails.images)[currentRoomImage] || selectedRoomForDetails.thumbnail || hotel.thumbnail}
                                            alt={selectedRoomForDetails.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                
                                {/* Navigation Arrows */}
                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center z-20 opacity-0 group-hover/imageSection:opacity-100 transition-opacity duration-300">
                                    <button 
                                        onClick={() => {
                                            setSlideDirection(-1);
                                            setCurrentRoomImage((prev) => (prev > 0 ? prev - 1 : getImages(selectedRoomForDetails.images).length - 1));
                                        }}
                                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all border border-white/20"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSlideDirection(1);
                                            setCurrentRoomImage((prev) => (prev < getImages(selectedRoomForDetails.images).length - 1 ? prev + 1 : 0));
                                        }}
                                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all border border-white/20"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 space-y-3 z-10 pointer-events-none">
                                    <h3 className="text-3xl font-bold text-white uppercase tracking-tighter leading-tight">
                                        {selectedRoomForDetails.name}
                                    </h3>
                                    {/* Pagination Dots repositioned */}
                                    <div className="flex gap-1.5 z-20 pointer-events-auto">
                                        {getImages(selectedRoomForDetails.images).map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentRoomImage(idx)}
                                                className={cn(
                                                    "h-1.5 rounded-full transition-all duration-300",
                                                    currentRoomImage === idx ? "w-6 bg-blue-600" : "w-1.5 bg-white/40 hover:bg-white/60"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Content Section */}
                            <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
                                <button 
                                    onClick={() => setSelectedRoomForDetails(null)} 
                                    className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100 z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                                    {/* Header Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100/50">
                                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-700">{selectedRoomForDetails.maxOccupancy || selectedRoomForDetails.capacityAdults || 2} Max Guests</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                <Bed className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{selectedRoomForDetails.bedConfiguration || "1 Double Bed"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{selectedRoomForDetails.sizeM2 || 250} sq.ft</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                                <Info className="w-3 h-3" /> About this room
                                            </h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-bold pr-10">
                                                {selectedRoomForDetails.description || "Indulge in the perfect blend of modern luxury and classic comfort. Each detail has been curated to ensure a stay that exceeds expectations."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amenities Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-l-3 border-blue-600 pl-3">Room Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {safeParse(selectedRoomForDetails.amenities, []).map((amenity: string) => {
                                                const lower = (amenity || '').toLowerCase();
                                                return (
                                                    <div 
                                                        key={amenity} 
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                                                    >
                                                        {lower.includes('wifi') || lower.includes('internet') ? (
                                                            <Wifi className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                                        ) : lower.includes('coffee') || lower.includes('tea') || lower.includes('breakfast') ? (
                                                            <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                        ) : lower.includes('food') || lower.includes('dining') || lower.includes('meal') ? (
                                                            <Utensils className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                                        ) : lower.includes('bath') || lower.includes('shower') || lower.includes('tub') ? (
                                                            <Bath className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                        ) : (
                                                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        )}
                                                        <span className="capitalize">{amenityLabel(amenity)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Trust Points / Highlights */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-l-3 border-amber-500 pl-3">Booking Highlights</h4>
                                        <div className="space-y-2.5">
                                            {(stayType === 'hourly' 
                                                ? ["Instant booking confirmation", `Exclusive ${duration} hour pricing`, "Safe and secure check-in"]
                                                : (safeParse(selectedRoomForDetails.trustPoints, []).length > 0 ? safeParse(selectedRoomForDetails.trustPoints, []) : [
                                                    "Secure booking with instant confirmation",
                                                    "Pay 12% now to secure your stay",
                                                    "Remaining 88% payable directly at property",
                                                    "Professional hospitality standards guaranteed"
                                                ])
                                            ).map((point: string, pIdx: number) => (
                                                <div key={pIdx} className="flex items-start gap-3">
                                                    <div className="w-4 h-4 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                                                        <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-700 leading-snug">{point}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Room Policies Section (Overrides Only) */}
                                    {(() => {
                                        const hPol = safeParse(hotel.policies, {});
                                        const rPol = (() => {
                                            const p = safeParse(selectedRoomForDetails.roomPolicies || selectedRoomForDetails.room_policies || selectedRoomForDetails.policies, {});
                                            return Array.isArray(p) ? (p[0] || {}) : p;
                                        })();
                                        
                                        // Only show if room policy is DIFFERENT from hotel policy (Override)
                                        const overrides = [
                                            { label: "Room Policy", value: rPol.hotelPolicies, original: hPol.hotelPolicies },
                                            { label: "Room Rules", value: rPol.houseRules, original: hPol.houseRules },
                                            { label: "Cancellation", value: rPol.cancellation, original: hPol.cancellation }
                                        ].filter(item => item.value && item.value.trim() !== "" && item.value !== item.original);

                                        if (overrides.length === 0) return null;
                                        
                                        return (
                                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 border-l-3 border-red-500 pl-3">Room Specific Overrides</h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {overrides.map((ov, idx) => (
                                                        <div key={idx} className="p-3 bg-red-50/50 rounded-xl border border-red-100/50 space-y-1">
                                                            <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">{ov.label}</p>
                                                            <p className="text-[10px] font-bold text-red-900 leading-relaxed">{ov.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Pricing Footer Content optimized for 70/30 split */}
                                <div className="p-7 bg-slate-50/90 border-t border-slate-100 mt-auto">
                                    <div className="flex items-end justify-between gap-5">
                                         <div className="space-y-3 flex-1">
                                             {(() => {
                                                 const rates = typeof selectedRoomForDetails.hourlyRates === 'string' ? safeParse(selectedRoomForDetails.hourlyRates, {}) : (selectedRoomForDetails.hourlyRates || safeParse(selectedRoomForDetails.hourly_rates, {}));
                                                 const bPrice = stayType === 'hourly' ? (rates[duration] || rates[String(duration)] || selectedRoomForDetails.pricePerNight / 2) : selectedRoomForDetails.selectedVariant?.price;
                                                 const sInfo = calculateStayPrice(bPrice, selectedRoomForDetails, coupons);
                                                 const stayNights = (() => {
                                                     if (stayType === 'hourly') return 1;
                                                     if (!checkIn || !checkOut || checkIn === "Dates" || checkOut === "Dates") return 1;
                                                     const start = new Date(checkIn);
                                                     const end = new Date(checkOut);
                                                     const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                                     return diff > 0 ? diff : 1;
                                                 })();
                                                 const totalStayPrice = sInfo.finalPrice * stayNights;
                                                 const advanceAmt = Math.round(totalStayPrice * 0.12);
                                                 const restAmt = totalStayPrice - advanceAmt;
                                                 
                                                 return (
                                                     <>
                                                         <div className="flex flex-col">
                                                             {sInfo.originalPrice && (
                                                                 <div className="flex items-center gap-2 mb-0.5">
                                                                     <span className="text-[10px] font-bold text-slate-400 line-through">{formatPrice(sInfo.originalPrice * stayNights)}</span>
                                                                     <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[7px] font-black uppercase rounded-md border border-red-100">
                                                                         -{Math.round((1 - sInfo.finalPrice / sInfo.originalPrice) * 100)}%
                                                                     </span>
                                                                 </div>
                                                             )}
                                                             <div className="flex items-baseline gap-1.5">
                                                                 <span className="text-3xl font-bold text-slate-950 tracking-tighter">{formatPrice(sInfo.finalPrice)}</span>
                                                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stayType === 'hourly' ? `/${duration}h` : '/night'}</span>
                                                             </div>
                                                             {stayNights > 1 && (
                                                                 <span className="text-[10px] font-bold text-slate-500 mt-1">
                                                                     Total ({stayNights} nights): <span className="font-extrabold text-slate-800">{formatPrice(totalStayPrice)}</span>
                                                                 </span>
                                                             )}
                                                         </div>
                                                         
                                                         <div className="grid grid-cols-2 gap-2.5">
                                                             <div className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 flex flex-col justify-center min-h-[52px]">
                                                                 <p className="text-[7px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Pay 12% Now</p>
                                                                 <p className="text-sm font-bold">{formatPrice(advanceAmt)}</p>
                                                             </div>
                                                             <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl flex flex-col justify-center min-h-[52px]">
                                                                 <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Rest at Hotel</p>
                                                                 <p className="text-[13px] font-bold text-slate-700">{formatPrice(restAmt)}</p>
                                                             </div>
                                                         </div>
                                                     </>
                                                 );
                                             })()}
                                         </div>

                                        <motion.button 
                                            animate={{ scale: [1, 1.03, 1] }}
                                            transition={{ 
                                                duration: 1.5, 
                                                repeat: Infinity, 
                                                ease: "easeInOut" 
                                            }}
                                            onClick={(e) => handleBook(e, selectedRoomForDetails.id, rooms.indexOf(selectedRoomForDetails).toString())} 
                                            className="px-8 py-4 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-2xl hover:bg-brand-700 transition-all h-[52px] flex items-center justify-center relative z-10"
                                        >
                                            {selectedRooms[selectedRoomForDetails.id] ? 'Add More' : 'Reserve Room'}
                                        </motion.button>
                                    </div>
                                    <p className="text-center text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-4 italic">
                                        Secure booking with instant confirmation
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {isMessageModalOpen && (
                    <GuestHotelChatModal
                        isOpen={isMessageModalOpen}
                        onClose={() => setIsMessageModalOpen(false)}
                        hotelId={hotel?.id || Number(id)}
                        hotelName={hotel?.name || "Hotel"}
                        hotelThumbnail={hotel?.thumbnail || safeParse(hotel?.images)?.[0]}
                        hotelCity={hotel?.city}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSearchModal && (
                    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
                        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="relative w-full max-w-2xl z-10">
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xl relative">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest">Edit Search</h2>
                                    <button onClick={() => setShowSearchModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
                                </div>
                                <SmartSearchBar
                                    hideStories
                                    navigationPath={getHotelUrl(hotel.id, hotel.name)}
                                    initialState={{
                                        destination: { label: hotel.city, id: hotel.city.toLowerCase(), category: "trending" },
                                        dates: {
                                            checkIn: searchParams.get("checkIn") ? new Date(searchParams.get("checkIn") as string) : null,
                                            checkOut: searchParams.get("checkOut") ? new Date(searchParams.get("checkOut") as string) : null
                                        },
                                        guests: { adults: Number(adults), children: 0, rooms: 1 },
                                    }}
                                    onSearch={() => setShowSearchModal(false)}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Unified Stay Details (Dates & Guests) Modal */}
            <AnimatePresence>
                {showStayDetailsModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowStayDetailsModal(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">Select Dates & Guests</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowStayDetailsModal(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 no-scrollbar">
                                {/* 1 & 2: Check-in / Check-out Tab Selector */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setModalCalendarMode("checkIn")}
                                            className={cn(
                                                "py-2.5 px-3 rounded-xl text-left transition-all cursor-pointer",
                                                modalCalendarMode === "checkIn" ? "bg-white shadow-sm ring-1 ring-brand-500/30" : "hover:bg-slate-200/60"
                                            )}
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                {stayType === 'hourly' ? 'Arrival Date' : 'Check-in'}
                                            </p>
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                {tempCheckIn ? tempCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Add Date"}
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setModalCalendarMode("checkOut")}
                                            className={cn(
                                                "py-2.5 px-3 rounded-xl text-left transition-all cursor-pointer",
                                                modalCalendarMode === "checkOut" ? "bg-white shadow-sm ring-1 ring-amber-500/30" : "hover:bg-slate-200/60"
                                            )}
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                {stayType === 'hourly' ? 'Duration' : 'Check-out'}
                                            </p>
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                {stayType === 'hourly' ? `${tempDuration} Hours` : (tempCheckOut ? tempCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Add Date")}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Hourly options if hourly stay */}
                                    {stayType === 'hourly' && (
                                        <div className="space-y-3 pt-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Stay Duration</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[3, 6, 12].map(h => (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        onClick={() => {
                                                            setTempDuration(String(h));
                                                            const params = new URLSearchParams(window.location.search);
                                                            params.set("duration", String(h));
                                                            setSearchParams(params);
                                                        }}
                                                        className={cn(
                                                            "py-2.5 rounded-xl font-black text-xs transition-all border cursor-pointer",
                                                            Number(tempDuration) === h ? "bg-brand-600 text-white border-brand-600 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {h} Hours Stay
                                                    </button>
                                                ))}
                                            </div>

                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-1">Select Arrival Time</p>
                                            <div className="grid grid-cols-4 gap-1.5">
                                                {["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM", "10:00 PM"].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => {
                                                            setTempArrivalTime(t);
                                                            const params = new URLSearchParams(window.location.search);
                                                            params.set("arrivalTime", t);
                                                            setSearchParams(params);
                                                        }}
                                                        className={cn(
                                                            "py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                                                            tempArrivalTime === t ? "bg-brand-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Calendar View */}
                                    <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-2.5">
                                        <div className="flex justify-between items-center px-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newDate = new Date(currentMonthDate);
                                                    newDate.setMonth(newDate.getMonth() - 1);
                                                    setCurrentMonthDate(newDate);
                                                }}
                                                className="p-1.5 hover:bg-white rounded-full border border-slate-200/80 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <ChevronLeft className="w-4 h-4 text-slate-700" />
                                            </button>
                                            <p className="font-bold text-xs uppercase tracking-wider text-slate-800">
                                                {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newDate = new Date(currentMonthDate);
                                                    newDate.setMonth(newDate.getMonth() + 1);
                                                    setCurrentMonthDate(newDate);
                                                }}
                                                className="p-1.5 hover:bg-white rounded-full border border-slate-200/80 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <ChevronRight className="w-4 h-4 text-slate-700" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="py-0.5">{d}</div>)}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                                            {Array.from({ length: new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                const d = i + 1;
                                                const date = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), d);
                                                const isPast = date < new Date(new Date().setHours(0,0,0,0));
                                                const isCheckIn = tempCheckIn && date.toDateString() === tempCheckIn.toDateString();
                                                const isCheckOut = tempCheckOut && date.toDateString() === tempCheckOut.toDateString();
                                                const isInRange = tempCheckIn && tempCheckOut && date > tempCheckIn && date < tempCheckOut;

                                                return (
                                                    <button
                                                        key={d}
                                                        disabled={isPast}
                                                        type="button"
                                                        onClick={() => {
                                                            const params = new URLSearchParams(window.location.search);
                                                            if (modalCalendarMode === 'checkIn') {
                                                                setTempCheckIn(date);
                                                                params.set("checkIn", formatDateLocal(date));
                                                                if (!tempCheckOut || tempCheckOut <= date) {
                                                                    const nextDay = new Date(date);
                                                                    nextDay.setDate(nextDay.getDate() + 1);
                                                                    setTempCheckOut(nextDay);
                                                                    params.set("checkOut", formatDateLocal(nextDay));
                                                                }
                                                                setSearchParams(params);
                                                                if (stayType !== 'hourly') {
                                                                    setModalCalendarMode('checkOut');
                                                                }
                                                            } else {
                                                                if (tempCheckIn && date <= tempCheckIn) {
                                                                    setTempCheckIn(date);
                                                                    params.set("checkIn", formatDateLocal(date));
                                                                    const nextDay = new Date(date);
                                                                    nextDay.setDate(nextDay.getDate() + 1);
                                                                    setTempCheckOut(nextDay);
                                                                    params.set("checkOut", formatDateLocal(nextDay));
                                                                } else {
                                                                    setTempCheckOut(date);
                                                                    params.set("checkOut", formatDateLocal(date));
                                                                }
                                                                setSearchParams(params);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer",
                                                            isPast ? "text-slate-300 cursor-not-allowed" :
                                                            (isCheckIn || isCheckOut) ? "bg-brand-600 text-white shadow-md shadow-brand-100 scale-105" :
                                                            isInRange ? "bg-brand-100 text-brand-700" :
                                                            "hover:bg-white text-slate-700"
                                                        )}
                                                    >
                                                        {d}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 3: Guests Selector */}
                                <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/70 border border-purple-100/70 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Total Guests</h4>
                                            <p className="text-[10px] text-slate-500 font-medium">Adults & children (ages 13+)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            disabled={Number(adults) <= 1}
                                            onClick={() => {
                                                const val = String(Math.max(1, Number(adults) - 1));
                                                const params = new URLSearchParams(window.location.search);
                                                params.set("adults", val);
                                                setSearchParams(params);
                                            }}
                                            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-base font-black text-slate-900 w-5 text-center">{adults}</span>
                                        <button
                                            type="button"
                                            disabled={Number(adults) >= 8}
                                            onClick={() => {
                                                const val = String(Math.min(8, Number(adults) + 1));
                                                const params = new URLSearchParams(window.location.search);
                                                params.set("adults", val);
                                                setSearchParams(params);
                                            }}
                                            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setShowStayDetailsModal(false)}
                                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-brand-100 active:scale-98 transition-all cursor-pointer"
                                >
                                    Done / Apply Stay Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Full-Screen Bottom Drawer for All Facilities & Amenities */}
            <AnimatePresence>
                {showFacilitiesDrawer && (
                    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFacilitiesDrawer(false)}
                            onTouchMove={(e) => e.preventDefault()}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm touch-none"
                        />
                        <motion.div
                            initial={{ y: "100%", opacity: 0.5 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 350 }}
                            drag="y"
                            dragControls={facilitiesDragControls}
                            dragListener={false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 0.7 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 80 || info.velocity.y > 300) {
                                    setShowFacilitiesDrawer(false);
                                }
                            }}
                            className="relative w-full max-w-xl bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col h-[85vh] sm:h-[78vh] max-h-[90vh]"
                        >
                            {/* Drag / Pull Indicator Handle */}
                            <div
                                onPointerDown={(e) => facilitiesDragControls.start(e)}
                                className="pt-3 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none group"
                                title="Drag down to close"
                            >
                                <div className="w-10 h-1 rounded-full bg-slate-300 group-hover:bg-slate-400 group-active:bg-slate-500 transition-colors" />
                            </div>

                            {/* Drawer Header */}
                            <div
                                onPointerDown={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (!target.closest('button') && !target.closest('input')) {
                                        facilitiesDragControls.start(e);
                                    }
                                }}
                                className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20 touch-none cursor-grab active:cursor-grabbing select-none"
                            >
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                                        Facilities & Amenities
                                    </h3>
                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                                        {hotel.name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFacilitiesDrawer(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                    aria-label="Close facilities drawer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Minimal Search Bar */}
                            <div className="px-5 py-3 border-b border-slate-100/70 bg-white">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={facilitySearchQuery}
                                        onChange={(e) => setFacilitySearchQuery(e.target.value)}
                                        placeholder="Search amenities (e.g. WiFi, Pool, AC)..."
                                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/70 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                                    />
                                    {facilitySearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setFacilitySearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable Content Body */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 no-scrollbar overscroll-contain">
                                {filteredFacilitiesCategories.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 space-y-2">
                                        <p className="text-xs font-medium">No facilities matching &ldquo;{facilitySearchQuery}&rdquo;</p>
                                        <button
                                            type="button"
                                            onClick={() => setFacilitySearchQuery("")}
                                            className="text-xs text-brand-600 font-bold underline cursor-pointer"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                ) : (
                                    filteredFacilitiesCategories.map((cat, catIdx) => (
                                        <div key={catIdx} className="space-y-2.5">
                                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    {cat.iconType === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                                                    {cat.iconType === 'bed' && <BedDouble className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                                                    {cat.iconType === 'bath' && <Bath className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                                                    {cat.iconType === 'utensils' && <Utensils className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                                                    {cat.iconType === 'shield' && <ShieldCheck className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                                                    {cat.iconType === 'services' && <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                        {cat.title}
                                                    </h4>
                                                </div>
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    {cat.items.length}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 py-1">
                                                {cat.items.map((item, itemIdx) => (
                                                    <div
                                                        key={itemIdx}
                                                        className="flex items-center gap-2.5 py-1 text-xs text-slate-700 font-medium"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                        <span className="truncate">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Minimal Footer */}
                            <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
                                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                                    Verified by property
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowFacilitiesDrawer(false)}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl active:scale-98 transition-all cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDescriptionModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDescriptionModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-950">About this property</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{hotel.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowDescriptionModal(false)}
                                    className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-600" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto no-scrollbar">
                                <p className="text-slate-600 leading-relaxed text-base md:text-lg whitespace-pre-line">
                                    {hotel.description}
                                </p>
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
                                <button
                                    onClick={() => setShowDescriptionModal(false)}
                                    className="px-12 py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-brand-600 transition-all"
                                >
                                    Close Description
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Single Review Detail Pop-up Modal */}
            <AnimatePresence>
                {selectedDetailedReview && (
                    <div className="fixed inset-0 z-[320] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDetailedReview(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div>
                                    <p className="text-base font-bold text-slate-900 leading-none">
                                        {selectedDetailedReview.user?.name || "Verified Guest"}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1.5">
                                        {formatDate(selectedDetailedReview.createdAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedDetailedReview(null)}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                            
                            {/* Modal Content */}
                            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] no-scrollbar">
                                {/* Rating Badge */}
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Stay Rating</span>
                                    <div className="px-3 py-1.5 bg-brand-50 text-brand-600 border border-brand-200/70 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                        <Star className="w-4 h-4 fill-brand-600 text-brand-600" />
                                        {selectedDetailedReview.rating || "5.0"} / 5
                                    </div>
                                </div>

                                {/* Review Comment */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Comment</span>
                                    <p className="text-slate-700 leading-relaxed text-sm md:text-base font-medium italic whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                        {parseComment(selectedDetailedReview.comment) || "Exceptional stay, everything was perfect!"}
                                    </p>
                                </div>

                                {/* Subscores list */}
                                <div className="space-y-4 pt-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Detailed Ratings</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { label: "Cleanliness", value: selectedDetailedReview.cleanliness || 5 },
                                            { label: "Comfort", value: selectedDetailedReview.comfort || 5 },
                                            { label: "Location", value: selectedDetailedReview.location || 5 },
                                            { label: "Staff & Service", value: selectedDetailedReview.staff || 5 },
                                            { label: "Value For Money", value: selectedDetailedReview.valueForMoney || 5 }
                                        ].map((sub, sIdx) => (
                                            <div key={sIdx} className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                    <span>{sub.label}</span>
                                                    <span className="text-slate-900 text-xs italic">{sub.value} / 5</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-600 rounded-full" 
                                                        style={{ width: `${(sub.value / 5) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                                <button
                                    onClick={() => setSelectedDetailedReview(null)}
                                    className="px-10 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                >
                                    Close Detail
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* All Reviews Modal */}
            <AnimatePresence>
                {showReviewsModal && (
                    <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReviewsModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-950">Guest Reviews ({reviews.length})</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{hotel.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowReviewsModal(false)}
                                    className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-600" />
                                </button>
                            </div>

                            {/* Modal Scrollable Content */}
                            <div className="p-8 overflow-y-auto no-scrollbar space-y-4">
                                {reviews.map((rev: any) => (
                                    <div 
                                        key={rev.id} 
                                        onClick={() => setSelectedDetailedReview(rev)}
                                        className="p-6 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-xl shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                    >
                                        <div>
                                            <h5 className="text-[13px] font-black text-slate-900">{rev.user?.name || "Verified Guest"}</h5>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {formatDate(rev.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0 sm:pl-4">
                                            <p className="text-xs text-slate-600 italic truncate max-w-md">
                                                {parseComment(rev.comment) || "Exceptional stay!"}
                                            </p>
                                        </div>
                                        <div className="px-2.5 py-1 bg-brand-50 text-brand-600 border border-brand-200/70 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0">
                                            <Star className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
                                            {rev.rating || "5.0"}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
                                <button
                                    onClick={() => setShowReviewsModal(false)}
                                    className="px-12 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
                                >
                                    Close Reviews
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Cart Pill */}
            <AnimatePresence>
                {Object.keys(selectedRooms).length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                    >
                        <div className="bg-black/30 text-white rounded-full p-2 pl-5 pr-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex items-center justify-between border border-white/20 backdrop-blur-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/50 rounded-full flex items-center justify-center shadow-inner">
                                    <span className="text-xs font-black text-brand-300">{Object.values(selectedRooms).reduce((a, b) => a + b, 0)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300/80">Cart Total</span>
                                    <span className="text-sm font-black italic">{Object.keys(selectedRooms).length} Room Types</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setSelectedRooms({})}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/40 hover:border-red-500/50 hover:text-red-100 transition-all active:scale-95 text-slate-300"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={handleCheckout}
                                    className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center hover:bg-brand-400 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95"
                                >
                                    <ArrowRight className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Action Popup (Login / Date Warning) */}
            <AnimatePresence>
                {actionPopup.isOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => {
                                setActionPopup({ ...actionPopup, isOpen: false });
                                if (actionPopup.type === 'date') {
                                    triggerCheckInDropdown();
                                }
                            }} 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                            className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-brand-600" />
                            </div>
                            <h3 className="text-xl font-black italic text-slate-900 mb-2">
                                {actionPopup.type === 'login' ? 'Authentication Required' : 'Dates Required'}
                            </h3>
                            <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
                                {actionPopup.message}
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        setActionPopup({ ...actionPopup, isOpen: false });
                                        if (actionPopup.type === 'date') {
                                            triggerCheckInDropdown();
                                        }
                                    }} 
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setActionPopup({ ...actionPopup, isOpen: false });
                                        if (actionPopup.type === 'login') {
                                            const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                                            router(`/login?redirect=${currentUrl}`);
                                        } else {
                                            triggerCheckInDropdown();
                                        }
                                    }} 
                                    className="flex-1 py-4 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-brand-700 transition-colors"
                                >
                                    {actionPopup.type === 'login' ? 'Log In Now' : 'Select Dates'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Phone Copied Floating Toast Notification */}
            <AnimatePresence>
                {copiedPhone && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800"
                    >
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Number Copied!</div>
                            <div className="text-[11px] text-slate-400">Reception phone copied to clipboard.</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ultra-Minimal Address & Map Popup Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddressModal(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className="relative bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-md z-10 space-y-4"
                        >
                            {/* Minimal Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Hotel Address
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-xs">
                                        {hotel?.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddressModal(false)}
                                    className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-lg leading-none"
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Clean Frameless Address Text */}
                            <div className="py-1">
                                <p className="text-sm text-slate-700 leading-relaxed font-normal select-text">
                                    {hotel?.address || `${hotel?.name}, ${hotel?.city}, India`}
                                </p>
                            </div>

                            {/* Minimal Actions without icons */}
                            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((hotel?.name || '') + ' ' + (hotel?.address || hotel?.city || ''))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all active:scale-[0.99] text-center"
                                >
                                    Show on Google Maps ↗
                                </a>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const addr = hotel?.address || `${hotel?.name}, ${hotel?.city}, India`;
                                        navigator.clipboard.writeText(addr);
                                        setCopiedAddress(true);
                                        setTimeout(() => setCopiedAddress(false), 2000);
                                    }}
                                    className="w-full sm:w-auto inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                                >
                                    {copiedAddress ? "Copied!" : "Copy Address"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
