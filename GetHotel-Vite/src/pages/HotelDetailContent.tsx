
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "@/components/common/Image";
import { Link, useSearchParams } from "react-router-dom";
import {
    MapPin, ChevronRight, ChevronLeft, Check, Loader2, Shield, Zap, TrendingUp, ShieldCheck,
    Plus, Minus, Clock, Users, X, Calendar, Phone, Star, Award, Coffee, Wifi, MessageSquare,
    Send, Share2, Search, Heart, Info, AlertCircle, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Bed,
    BedDouble, Maximize2, Edit3, CreditCard, Tag, Copy
} from "lucide-react";
import { useNavigate as useRouter } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ImageGallery from "@/components/hotels/ImageGallery";
import PriceBox from "@/components/hotels/PriceBox";
import { cn, ratingLabel, amenityIcon, amenityLabel, formatDate, formatPrice, safeParse, formatDateLocal, getHotelUrl } from "@/lib/utils";
import { hotelApi, messageApi, couponApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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
    const overallMatch = commentStr.match(/Overall:\s*(.*?)$/is);
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
        <div className="border-b border-slate-100 last:border-0 transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group transition-all"
            >
                <span className="text-[13px] font-black text-slate-950 uppercase tracking-widest leading-snug group-hover:text-blue-600 transition-colors">
                    {faq.question}
                </span>
                <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
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
                        <div className="pb-8 pt-1 pr-12">
                            <p className="text-[13px] font-bold text-slate-500 leading-relaxed italic opacity-80">
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
    const [loading, setLoading] = useState(true);
    const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<any>(null);
    const [currentRoomImage, setCurrentRoomImage] = useState(0);
    const [slideDirection, setSlideDirection] = useState(0); // 1 for next, -1 for prev
    const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});
    const [scrolled, setScrolled] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
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

    const checkInRef = useRef<HTMLDivElement>(null);
    const checkOutRef = useRef<HTMLDivElement>(null);
    const guestsRef = useRef<HTMLDivElement>(null);

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
        setShowCheckInPicker(true);
        setShowCheckOutPicker(false);
        setShowGuestsPicker(false);
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
                setHotel(res.data);
            } catch (err) { console.error(err); }
        };
        fetchHotel();
    }, [id]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setFetchingRooms(true);
                const params: any = {};
                const checkInParam = searchParams.get("checkIn");
                const checkOutParam = searchParams.get("checkOut");
                if (checkInParam) params.checkIn = checkInParam;
                if (checkOutParam) params.checkOut = checkOutParam;

                const res = await hotelApi.getRooms(hotel?.id?.toString() || id, params);
                setRooms(res.data || []);
            } catch (err) { console.error(err); }
            finally { 
                setLoading(false);
                setFetchingRooms(false);
            }
        };

        const fetchCoupons = async () => {
            try {
                const res = await couponApi.getCoupons(hotel?.id || Number(id));
                // Resilient data extraction: handle res.data or res.data.coupons or res directly
                const rawData = res.data?.coupons || res.data || res;
                const couponList = Array.isArray(rawData) ? rawData : [];
                
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                setCoupons(couponList.filter((c: any) => {
                    const isActive = c.isActive !== false && c.is_active !== false;
                    if (!isActive) return false;
                    const startStr = typeof c.startDate === 'string' ? c.startDate.split('T')[0] : '';
                    const endStr = typeof c.endDate === 'string' ? c.endDate.split('T')[0] : '';
                    if (startStr && endStr && (todayStr < startStr || todayStr > endStr)) return false;
                    return true;
                }));
            } catch (err) { console.error("Failed to fetch coupons", err); }
        };

        fetchRooms();
        fetchCoupons();
    }, [id, searchParams]);

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

    const calculateStayPrice = (basePrice: any, room: any, activePromos: any[] = allAvailableCoupons) => {
        const promoList = activePromos && activePromos.length > 0 ? activePromos : allAvailableCoupons;
        const priceDiff = room.dynamicPricePerNight ? (room.dynamicPricePerNight - room.pricePerNight) : 0;
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

        // 2. Sort fully valid promos to find the best applicable one (fallback to promoList if dates not set yet)
        if (fullyValidPromos.length === 0 && promoList.length > 0) {
            promoList.forEach(p => {
                if (p.isActive !== false && p.is_active !== false) {
                    fullyValidPromos.push(p);
                }
            });
        }

        fullyValidPromos.sort((a: any, b: any) => Number(b.discountValue) - Number(a.discountValue));
        const bestPromo = fullyValidPromos[0];

        // 3. Calculate final display results
        if (mobileRestrictedPromo && !isMobile) {
            // Desktop view, show MOBILE ONLY badge, but do NOT apply mobile discount
            const title = `MOBILE ONLY: ${mobileRestrictedPromo.discountValue}${mobileRestrictedPromo.discountType === 'percentage' ? '%' : '₹'} OFF`;
            
            // If there's another fully valid coupon, apply that one instead to the price
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
                : `${bestPromo.discountValue}${bestPromo.discountType === 'percentage' ? '%' : '₹'} OFF (${bestPromo.code})`;
            
            return { 
                finalPrice: fPrice, 
                originalPrice: actualPrice, 
                discountLabel: label, 
                isMobileOnly: isMobilePromo,
                promoType: bestPromo.promoType,
                promoTypeLabel: getPromoTypeLabel(bestPromo.promoType)
            };
        }

        // 4. Default to Weekly/Monthly potential discounts if no promo matches
        if (!hasDates) {
            if (room.monthlyDiscount > 0) {
                return { 
                    finalPrice: applyDiscount(actualPrice, room.monthlyDiscount, 'percentage'), 
                    originalPrice: actualPrice, 
                    discountLabel: `${room.monthlyDiscount}% MONTHLY SAVINGS`, 
                    isMobileOnly: false,
                    promoType: 'standard',
                    promoTypeLabel: 'Monthly Deal'
                };
            } else if (room.weeklyDiscount > 0) {
                return { 
                    finalPrice: applyDiscount(actualPrice, room.weeklyDiscount, 'percentage'), 
                    originalPrice: actualPrice, 
                    discountLabel: `${room.weeklyDiscount}% WEEKLY DEAL`, 
                    isMobileOnly: false,
                    promoType: 'standard',
                    promoTypeLabel: 'Weekly Deal'
                };
            }
        } else {
            if (stayNights >= 30 && room.monthlyDiscount > 0) {
                return { 
                    finalPrice: applyDiscount(actualPrice, room.monthlyDiscount, 'percentage'), 
                    originalPrice: actualPrice, 
                    discountLabel: `${room.monthlyDiscount}% MONTHLY DISCOUNT`, 
                    isMobileOnly: false,
                    promoType: 'standard',
                    promoTypeLabel: 'Monthly Deal'
                };
            } else if (stayNights >= 7 && room.weeklyDiscount > 0) {
                return { 
                    finalPrice: applyDiscount(actualPrice, room.weeklyDiscount, 'percentage'), 
                    originalPrice: actualPrice, 
                    discountLabel: `${room.weeklyDiscount}% WEEKLY DISCOUNT`, 
                    isMobileOnly: false,
                    promoType: 'standard',
                    promoTypeLabel: 'Weekly Deal'
                };
            }
        }

        return { 
            finalPrice: actualPrice, 
            originalPrice: null, 
            discountLabel: null, 
            isMobileOnly: false,
            promoType: null,
            promoTypeLabel: null
        };
    };;

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

                    <div className="w-10 h-10 flex items-center justify-center" /> {/* Spacer */}
                </div>
            </div>

            {/* 2. Top Property Info */}
            <div className="max-w-7xl mx-auto px-5 pt-4 pb-6">
                {/* Visual Breadcrumbs */}
                <nav className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <Link to="/hotels" className="hover:text-brand-600 transition-colors">Hotels</Link>
                    {hotel.city && (
                        <>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            {["goa", "jaipur", "manali", "shimla", "udaipur", "delhi"].includes(hotel.city.toLowerCase().trim()) ? (
                                <Link to={`/${hotel.city.toLowerCase().trim()}-hotels`} className="hover:text-brand-600 transition-colors">
                                    {hotel.city} Hotels
                                </Link>
                            ) : (
                                <Link to={`/hotels?city=${encodeURIComponent(hotel.city)}`} className="hover:text-brand-600 transition-colors">
                                    {hotel.city} Hotels
                                </Link>
                            )}
                        </>
                    )}
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="text-slate-600 truncate max-w-[150px] md:max-w-xs">{hotel.name}</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5">
                                {[...Array(Math.floor(hotel.starRating || 5))].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
                            {hotel.name}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-brand-500" />
                            <p className="text-sm font-bold">{hotel.address} — <span className="text-brand-600">Great location</span></p>
                            <button className="text-brand-500 font-bold border-b border-brand-200 text-sm ml-2">Show on map</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Review box removed */}
                    </div>
                </div>

                {/* 3. Image Gallery / Hero Section */}
                <div className="w-full md:px-0">
                    <ImageGallery images={hotelImages} hotelName={hotel.name} />
                </div>
                {/* Main Content Area (Full Width) */}
                <div className="space-y-12 mt-10">
                    {/* 1. About Property */}
                    <section className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold tracking-tight uppercase border-l-4 border-blue-600 pl-4">About this property</h2>
                            <div className="relative">
                                <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line line-clamp-4">
                                    {hotel.description}
                                </p>
                                {hotel.description?.length > 400 && (
                                    <button
                                        onClick={() => setShowDescriptionModal(true)}
                                        className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
                                    >
                                        Read Full Description <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>


                        {/* Main Amenities Highlights */}
                        {/* Main Amenities Highlights - Simplified List */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-4">
                            {(mainAmenities.length > 0 ? mainAmenities : [
                                { id: 'wifi', label: 'Free Wi-Fi', icon: '📶' },
                                { id: 'cctv', label: 'CCTV Camera', icon: '📹' },
                                { id: 'air_conditioning', label: 'Air Conditioning', icon: '❄️' },
                                { id: 'parking', label: 'Free Parking', icon: '🅿️' },
                                { id: 'breakfast', label: 'Free Breakfast', icon: '🍳' },
                                { id: 'geyser', label: 'Geyser / Hot Water', icon: '🚿' }
                            ]).slice(0, 6).map((a: any) => (
                                <div key={a.id || a} className="flex items-center gap-3 py-2">
                                    <div className="text-xl bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 shrink-0">
                                        {a.icon || amenityIcon(a)}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">
                                        {a.label || amenityLabel(a)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Rooms Inventory */}
                    <section id="rooms" className="space-y-6 pt-1 border-t border-slate-100">
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
                        <div id="booking-bar" className="mb-10 relative">
                            <div className="bg-white/40 backdrop-blur-xl rounded-[48px] border border-white/20 relative z-40">
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                    {/* Card 1: Arrival / Check-in */}
                                    <div ref={checkInRef} className="relative flex flex-col">
                                        <button 
                                            onClick={() => {
                                                setShowCheckInPicker(!showCheckInPicker);
                                                setShowCheckOutPicker(false);
                                                setShowGuestsPicker(false);
                                            }}
                                            className="w-full flex items-center gap-5 p-6 hover:bg-slate-50/80 transition-all text-left group rounded-t-[48px] md:rounded-t-none md:rounded-l-[48px] focus:outline-none"
                                        >
                                            <div className="w-11 h-11 bg-brand-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Calendar className="w-5 h-5 text-brand-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                                                    {stayType === 'hourly' ? 'Arrival Date & Time' : 'Check-in Date'}
                                                </p>
                                                <p className="text-base font-black text-slate-900 italic leading-none">
                                                    {tempCheckIn ? tempCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Select Date"}
                                                    {stayType === 'hourly' && <span className="ml-2 text-brand-600">@ {tempArrivalTime}</span>}
                                                </p>
                                            </div>
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showCheckInPicker && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-[105%] left-0 md:left-4 bg-white rounded-[28px] shadow-2xl border border-slate-100 z-[999] p-5 w-[340px] max-w-[95vw] text-left"
                                                >
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center px-2">
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newDate = new Date(currentMonthDate);
                                                                    newDate.setMonth(newDate.getMonth() - 1);
                                                                    setCurrentMonthDate(newDate);
                                                                }} 
                                                                className="p-2 hover:bg-slate-50 rounded-full border border-slate-100"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            <p className="font-black italic uppercase text-xs tracking-widest text-slate-800">{currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newDate = new Date(currentMonthDate);
                                                                    newDate.setMonth(newDate.getMonth() + 1);
                                                                    setCurrentMonthDate(newDate);
                                                                }} 
                                                                className="p-2 hover:bg-slate-50 rounded-full border border-slate-100"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                                                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="py-1">{d}</div>)}
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {Array.from({ length: new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                                                            {Array.from({ length: new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                                const d = i + 1;
                                                                const date = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), d);
                                                                const isPast = date < new Date(new Date().setHours(0,0,0,0));
                                                                const isSelected = tempCheckIn?.toDateString() === date.toDateString();
                                                                return (
                                                                    <button 
                                                                        key={d} 
                                                                        disabled={isPast} 
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTempCheckIn(date);
                                                                            const params = new URLSearchParams(window.location.search);
                                                                            params.set("checkIn", formatDateLocal(date));
                                                                            
                                                                            // Heal checkout date if invalid (<= checkIn date)
                                                                            if (tempCheckOut && tempCheckOut <= date) {
                                                                                const newCheckOut = new Date(date);
                                                                                newCheckOut.setDate(newCheckOut.getDate() + 1);
                                                                                setTempCheckOut(newCheckOut);
                                                                                params.set("checkOut", formatDateLocal(newCheckOut));
                                                                            } else if (!tempCheckOut) {
                                                                                const newCheckOut = new Date(date);
                                                                                newCheckOut.setDate(newCheckOut.getDate() + 1);
                                                                                setTempCheckOut(newCheckOut);
                                                                                params.set("checkOut", formatDateLocal(newCheckOut));
                                                                            }
                                                                            setSearchParams(params);
                                                                            
                                                                            if (stayType !== 'hourly') {
                                                                                setShowCheckInPicker(false);
                                                                                setShowCheckOutPicker(true);
                                                                            }
                                                                        }} 
                                                                        className={cn(
                                                                            "h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center", 
                                                                            isPast ? "text-slate-200 cursor-not-allowed" : 
                                                                            isSelected ? "bg-brand-600 text-white shadow-xl shadow-brand-100 scale-105" : 
                                                                            "hover:bg-slate-50 text-slate-700"
                                                                        )}
                                                                    >
                                                                        {d}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {stayType === 'hourly' && (
                                                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arrival Time</p>
                                                                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                                                    {["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM", "10:00 PM"].map(t => (
                                                                        <button
                                                                            key={t}
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setTempArrivalTime(t);
                                                                                const params = new URLSearchParams(window.location.search);
                                                                                params.set("arrivalTime", t);
                                                                                setSearchParams(params);
                                                                                setShowCheckInPicker(false);
                                                                                setShowCheckOutPicker(true);
                                                                            }}
                                                                            className={cn(
                                                                                "py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all",
                                                                                tempArrivalTime === t ? "bg-brand-600 text-white shadow-md shadow-brand-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                                            )}
                                                                        >
                                                                            {t}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Card 2: Duration / Check-out */}
                                    <div ref={checkOutRef} className="relative flex flex-col">
                                        <button 
                                            onClick={() => {
                                                setShowCheckOutPicker(!showCheckOutPicker);
                                                setShowCheckInPicker(false);
                                                setShowGuestsPicker(false);
                                            }}
                                            className="w-full flex items-center gap-5 p-6 hover:bg-slate-50/80 transition-all text-left group focus:outline-none"
                                        >
                                            <div className="w-11 h-11 bg-amber-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                {stayType === 'hourly' ? <Clock className="w-5 h-5 text-amber-600" /> : <Calendar className="w-5 h-5 text-amber-600" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                                                    {stayType === 'hourly' ? 'Stay Duration' : 'Check-out Date'}
                                                </p>
                                                <p className="text-base font-black text-slate-900 italic leading-none">
                                                    {stayType === 'hourly' ? `${tempDuration} Hours Stay` : (tempCheckOut ? tempCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Select Date")}
                                                </p>
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {showCheckOutPicker && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-[105%] left-0 md:left-4 bg-white rounded-[28px] shadow-2xl border border-slate-100 z-[999] p-5 w-[340px] max-w-[95vw] text-left"
                                                >
                                                    {stayType === 'hourly' ? (
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">How long will you stay?</p>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {[3, 6, 12].map(h => (
                                                                    <button 
                                                                        key={h}
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTempDuration(String(h));
                                                                            const params = new URLSearchParams(window.location.search);
                                                                            params.set("duration", String(h));
                                                                            setSearchParams(params);
                                                                            setShowCheckOutPicker(false);
                                                                        }}
                                                                        className={cn(
                                                                            "py-6 rounded-2xl font-black italic transition-all flex flex-col items-center gap-1",
                                                                            Number(tempDuration) === h ? "bg-brand-600 text-white shadow-xl shadow-brand-100 scale-105" : "bg-slate-50 text-slate-400 border border-transparent hover:border-slate-200"
                                                                        )}
                                                                    >
                                                                        <span className="text-2xl">{h}</span>
                                                                        <span className="text-[8px] uppercase tracking-widest">Hours</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center px-2">
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newDate = new Date(currentMonthDate);
                                                                        newDate.setMonth(newDate.getMonth() - 1);
                                                                        setCurrentMonthDate(newDate);
                                                                    }} 
                                                                    className="p-2 hover:bg-slate-50 rounded-full border border-slate-100"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4" />
                                                                </button>
                                                                <p className="font-black italic uppercase text-xs tracking-widest text-slate-800">{currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newDate = new Date(currentMonthDate);
                                                                        newDate.setMonth(newDate.getMonth() + 1);
                                                                        setCurrentMonthDate(newDate);
                                                                    }} 
                                                                    className="p-2 hover:bg-slate-50 rounded-full border border-slate-100"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                                                                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="py-1">{d}</div>)}
                                                            </div>
                                                            <div className="grid grid-cols-7 gap-1">
                                                                {Array.from({ length: new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                                                                {Array.from({ length: new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                                    const d = i + 1;
                                                                    const date = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), d);
                                                                    const isPast = tempCheckIn ? date <= tempCheckIn : date < new Date(new Date().setHours(0,0,0,0));
                                                                    const isSelected = tempCheckOut?.toDateString() === date.toDateString();
                                                                    const isInRange = tempCheckIn && tempCheckOut && date > tempCheckIn && date < tempCheckOut;
                                                                    return (
                                                                        <button 
                                                                            key={d} 
                                                                            disabled={isPast} 
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setTempCheckOut(date);
                                                                                const params = new URLSearchParams(window.location.search);
                                                                                if (tempCheckIn) params.set("checkIn", formatDateLocal(tempCheckIn));
                                                                                params.set("checkOut", formatDateLocal(date));
                                                                                setSearchParams(params);
                                                                                setShowCheckOutPicker(false);
                                                                            }} 
                                                                            className={cn(
                                                                                "h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center", 
                                                                                isPast ? "text-slate-200 cursor-not-allowed" : 
                                                                                isSelected ? "bg-brand-600 text-white shadow-xl shadow-brand-100 scale-105" : 
                                                                                isInRange ? "bg-brand-50 text-brand-600" :
                                                                                "hover:bg-slate-50 text-slate-700"
                                                                            )}
                                                                        >
                                                                            {d}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Card 3: Guests Selector */}
                                    <div ref={guestsRef} className="relative flex flex-col">
                                        <button 
                                            onClick={() => {
                                                setShowGuestsPicker(!showGuestsPicker);
                                                setShowCheckInPicker(false);
                                                setShowCheckOutPicker(false);
                                            }}
                                            className="w-full flex items-center gap-5 p-6 hover:bg-slate-50/80 transition-all text-left group rounded-b-[48px] md:rounded-b-none md:rounded-r-[48px] focus:outline-none"
                                        >
                                            <div className="w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Users className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                                                    Guests Count
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black italic text-slate-900 text-base">
                                                        {adults} {Number(adults) === 1 ? "Guest" : "Guests"}
                                                    </span>
                                                    <ChevronDown className={cn(
                                                        "w-4 h-4 text-purple-400 transition-transform duration-300",
                                                        showGuestsPicker ? "rotate-180 text-purple-600" : "group-hover:text-purple-600"
                                                    )} />
                                                </div>
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {showGuestsPicker && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-[105%] right-0 bg-white rounded-[28px] shadow-2xl border border-slate-100 z-[999] p-6 w-[320px] max-w-[95vw] text-left"
                                                >
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Guests</h4>
                                                                <p className="text-[10px] text-slate-400 font-medium">Number of adults (ages 13+)</p>
                                                            </div>
                                                            <div className="flex items-center gap-3.5">
                                                                <button
                                                                    type="button"
                                                                    disabled={Number(adults) <= 1}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const val = String(Math.max(1, Number(adults) - 1));
                                                                        const params = new URLSearchParams(window.location.search);
                                                                        params.set("adults", val);
                                                                        setSearchParams(params);
                                                                    }}
                                                                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    <Minus className="w-3.5 h-3.5" />
                                                                </button>
                                                                <span className="text-base font-black italic text-slate-800 w-4 text-center">{adults}</span>
                                                                <button
                                                                    type="button"
                                                                    disabled={Number(adults) >= 8}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const val = String(Math.min(8, Number(adults) + 1));
                                                                        const params = new URLSearchParams(window.location.search);
                                                                        params.set("adults", val);
                                                                        setSearchParams(params);
                                                                    }}
                                                                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowGuestsPicker(false);
                                                            }}
                                                            className="w-full py-3 bg-brand-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-brand-100 hover:bg-brand-700 active:scale-98 transition-all text-center"
                                                        >
                                                            Apply & Search
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="rooms-section" className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-bold text-slate-950 uppercase tracking-tight flex items-center gap-4">
                                    Available Rooms
                                    <span className="h-px w-16 bg-slate-200 mt-2"></span>
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1">Live rates from property management</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            {fetchingRooms ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-[32px] border border-slate-150 animate-pulse">
                                    <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                                    <p className="text-slate-500 font-black italic text-xs uppercase tracking-widest">Updating Room Rates...</p>
                                </div>
                            ) : displayRooms.length === 0 ? (
                                <div className="py-20 px-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-center space-y-4">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                        <AlertCircle className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight">No Rooms Available</h3>
                                        <p className="text-sm font-bold text-slate-500 max-w-md mx-auto">
                                            We couldn't find any rooms matching your criteria ({searchedGuests} Guests on {formatDateLabel(checkIn, checkOut)}). Try adjusting your search.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => triggerCheckInDropdown()}
                                        className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
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
                                            <div className="flex items-center gap-4 px-2">
                                                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                                                <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight">
                                                    {room.name}
                                                </h3>
                                            </div>

                                            {/* Desktop View: Individual Variant Cards */}
                                            <div className="hidden md:grid grid-cols-1 gap-6">
                                                {displayItems.map((variant: any, vIdx: number) => {
                                                    const rates = typeof room.hourlyRates === 'string' ? safeParse(room.hourlyRates, {}) : (room.hourlyRates || safeParse(room.hourly_rates, {}));
                                                    const isHourly = stayType === 'hourly';
                                                    const hourlyPrice = isHourly ? Number(rates[duration] || rates[String(duration)] || room.pricePerNight / 2) : 0;
                                                    const stayInfo = calculateStayPrice(isHourly ? hourlyPrice : variant.price, room, coupons);
                                                    const finalDisplayPrice = stayInfo.finalPrice;

                                                    return (
                                                        <div
                                                            key={vIdx}
                                                            onClick={() => setSelectedRoomForDetails({ ...room, selectedVariant: variant })}
                                                            className="bg-white/60 backdrop-blur-md rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex h-64 cursor-pointer"
                                                        >
                                                            <div className="w-1/3 relative overflow-hidden">
                                                                <Image
                                                                    src={getImages(room.images)[0] || room.thumbnail || hotel.thumbnail}
                                                                    alt={room.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                                />
                                                                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                                                                    {stayInfo.discountLabel && stayInfo.promoTypeLabel && (
                                                                        <div className="bg-slate-900/95 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[7px] font-black uppercase tracking-widest leading-none shadow-sm">
                                                                            {stayInfo.promoTypeLabel}
                                                                        </div>
                                                                    )}
                                                                    {!isHourly && (variant.mealPlan?.toLowerCase().includes('breakfast') || variant.mealPlan?.toLowerCase().includes('cp')) && (
                                                                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                                                            <Coffee className="w-3 h-3" /> Breakfast Included
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 p-8 flex flex-col justify-between border-r border-slate-100">
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <h4 className="text-xl font-bold text-slate-950 tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-2">
                                                                                <span>{room.name}</span>
                                                                                {variant.mealPlan && (
                                                                                    <span className="text-xs font-semibold text-slate-500 normal-case">({variant.mealPlan})</span>
                                                                                )}
                                                                            </h4>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedRoomForDetails({ ...room, selectedVariant: variant });
                                                                                }}
                                                                                className="px-2 py-1 bg-blue-50 text-blue-600 text-[7px] font-black uppercase tracking-widest rounded-full border border-blue-100/50 flex items-center gap-1 hover:bg-blue-100 transition-colors"
                                                                            >
                                                                                <Info className="w-2.5 h-2.5" /> Details
                                                                            </button>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                                                            <div className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5 text-blue-500" /> {room.sizeM2 || 250} sq.ft</div>
                                                                            <div className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-blue-500" /> {room.bedConfiguration || "Double Bed"}</div>
                                                                            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" /> {room.maxOccupancy || room.capacityAdults || 2} Max Guests</div>
                                                                        </div>
                                                                    </div>

                                                                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold line-clamp-2">
                                                                        {room.description || "Experience comfort and elegance in our meticulously designed rooms."}
                                                                    </p>

                                                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                                        {safeParse(room.amenities, []).slice(0, 4).map((amenity: string) => (
                                                                            <div key={amenity} className="flex items-center gap-2">
                                                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                                                <span className="text-[9px] font-bold uppercase tracking-tight text-slate-500">{amenityLabel(amenity)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    {(variant.policy?.toLowerCase().includes('free') || rPol.cancellation?.toLowerCase().includes('free')) && (
                                                                        <div className="flex items-center gap-2 text-amber-600">
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                            <span className="text-[9px] font-black uppercase tracking-widest">Free Cancellation</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2 text-emerald-600">
                                                                        <Check className="w-4 h-4" />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest">Instant Confirmation</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="w-64 p-8 bg-slate-50/50 flex flex-col justify-center items-center text-center gap-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                        {stayType === 'hourly' ? `Price for ${duration} Hours` : 'Price for 1 Night'}
                                                                    </p>
                                                                    <div className="flex flex-col items-center">
                                                                        {stayInfo.originalPrice && (
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-xs font-bold text-slate-400 line-through decoration-red-400 decoration-2">{formatPrice(stayInfo.originalPrice)}</span>
                                                                                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-black uppercase rounded border border-red-100">
                                                                                    {Math.round((1 - stayInfo.finalPrice / stayInfo.originalPrice) * 100)}% OFF
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <span className="text-3xl font-bold text-slate-950">{formatPrice(finalDisplayPrice)}</span>
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">+ taxes & fees</span>
                                                                    </div>
                                                                </div>
                                                                {selectedRooms[`${room.id}_${vIdx}`] ? (
                                                                    <div className="w-full flex items-center justify-between bg-brand-50 rounded-lg p-1 shadow-inner border border-brand-100">
                                                                        <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), -1, room.inventory || 5)} className="w-10 h-10 bg-white rounded flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                            <Minus className="w-4 h-4" />
                                                                        </button>
                                                                        <span className="text-[10px] font-black text-brand-700">{selectedRooms[`${room.id}_${vIdx}`]} Selected</span>
                                                                        <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), 1, room.inventory || 5)} className="w-10 h-10 bg-white rounded flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                            <Plus className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => handleBook(e, room.id, vIdx.toString())}
                                                                        className="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                                                                    >
                                                                        Book Now
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

                                                    return (
                                                        <div
                                                            key={`${room.id}-${vIdx}`}
                                                            onClick={() => setSelectedRoomForDetails({ ...room, selectedVariant: variant })}
                                                            className="min-w-[300px] snap-start bg-white/60 backdrop-blur-md rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all flex flex-col cursor-pointer"
                                                        >
                                                            <div className="h-44 relative">
                                                                <Image
                                                                    src={getImages(room.images)[0] || room.thumbnail || hotel.thumbnail}
                                                                    alt={room.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                                                                    {(() => {
                                                                        const rates = typeof room.hourlyRates === 'string' ? safeParse(room.hourlyRates, {}) : (room.hourlyRates || safeParse(room.hourly_rates, {}));
                                                                        const bPrice = stayType === 'hourly' ? (rates[duration] || rates[String(duration)] || room.pricePerNight / 2) : variant.price;
                                                                        const sInfo = calculateStayPrice(bPrice, room, coupons);
                                                                        if (!sInfo.discountLabel || !sInfo.promoTypeLabel) return null;
                                                                        return (
                                                                            <div className="bg-slate-900/95 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-widest leading-none shadow-sm">
                                                                                {sInfo.promoTypeLabel}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                    {stayType !== 'hourly' && isBreakfast && (
                                                                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
                                                                            <Coffee className="w-3 h-3" /> Breakfast
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="p-5 space-y-4 flex-1 flex flex-col">
                                                                <div>
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex flex-col">
                                                                            <h4 className="text-lg font-bold text-slate-950 tracking-tight leading-tight flex flex-col gap-0.5">
                                                                                <span>{room.name}</span>
                                                                                {variant.mealPlan && (
                                                                                    <span className="text-[10px] font-semibold text-slate-500 normal-case">({variant.mealPlan})</span>
                                                                                )}
                                                                            </h4>
                                                                        </div>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedRoomForDetails({ ...room, selectedVariant: variant });
                                                                            }}
                                                                            className="shrink-0 px-2 py-1 bg-blue-50 text-blue-600 text-[7px] font-black uppercase tracking-widest rounded-full border border-blue-100/50 flex items-center gap-1"
                                                                        >
                                                                            <Info className="w-2.5 h-2.5" /> Details
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-1 text-slate-400 text-[8px] font-black uppercase tracking-widest">
                                                                        <span>{room.sizeM2 || 250} sq.ft</span>
                                                                        <span>•</span>
                                                                        <span>{room.maxOccupancy || room.capacityAdults || 2} Max Guests</span>
                                                                    </div>
                                                                    {stayType !== 'hourly' && (
                                                                        isBreakfast ? (
                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                <Check className="w-3 h-3 text-emerald-500" strokeWidth={4} />
                                                                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">Breakfast Included</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                <Check className="w-3 h-3 text-slate-400" strokeWidth={4} />
                                                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Room Only</span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 flex flex-col justify-end pt-4 border-t border-slate-50 gap-4">
                                                                    <div className="flex items-end justify-between">
                                                                        <div className="flex flex-col">
                                                                            {isFreeCancel && (
                                                                                <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest">Free Cancel</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col items-end">
                                                                            {(() => {
                                                                                const rates = typeof room.hourlyRates === 'string' ? safeParse(room.hourlyRates, {}) : (room.hourlyRates || safeParse(room.hourly_rates, {}));
                                                                                const bPrice = stayType === 'hourly' ? (rates[duration] || rates[String(duration)] || room.pricePerNight / 2) : variant.price;
                                                                                const sInfo = calculateStayPrice(bPrice, room, allAvailableCoupons);
                                                                                
                                                                                return (
                                                                                    <>
                                                                                        {sInfo.originalPrice && (
                                                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                                                <span className="text-[10px] font-bold text-slate-400 line-through">{formatPrice(sInfo.originalPrice)}</span>
                                                                                                <span className="text-[8px] font-black text-red-500 uppercase">{Math.round((1 - sInfo.finalPrice / sInfo.originalPrice) * 100)}% OFF</span>
                                                                                            </div>
                                                                                        )}
                                                                                        <span className="text-2xl font-black text-slate-950 italic leading-none">
                                                                                            {formatPrice(sInfo.finalPrice)}
                                                                                        </span>
                                                                                    </>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                    {selectedRooms[`${room.id}_${vIdx}`] ? (
                                                                        <div className="w-full flex items-center justify-between bg-brand-50 rounded-full p-1 shadow-inner border border-brand-100">
                                                                            <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), -1, room.inventory || 5)} className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                                <Minus className="w-3 h-3" />
                                                                            </button>
                                                                            <span className="text-[9px] font-black text-brand-700">{selectedRooms[`${room.id}_${vIdx}`]} Room{selectedRooms[`${room.id}_${vIdx}`] > 1 ? 's' : ''}</span>
                                                                            <button onClick={(e) => handleCartQuantity(e, room.id, vIdx.toString(), 1, room.inventory || 5)} className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                                                <Plus className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={(e) => handleBook(e, room.id, vIdx.toString())}
                                                                            className="w-full py-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
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
                    <section className="space-y-6 pt-1">
                        <h2 className="text-2xl font-bold tracking-tight uppercase border-l-4 border-blue-600 pl-4">Guest Reviews</h2>
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 py-12 px-10 bg-slate-50/50 rounded-[48px]">
                                <div className="flex items-center gap-8">
                                    {Array.isArray(reviews) && reviews.length > 0 && (
                                        <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-xl shadow-blue-100 shrink-0">
                                            {(reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-2xl font-bold text-slate-950 uppercase tracking-tighter leading-none">
                                            {Array.isArray(reviews) && reviews.length > 0 ? "Exceptional" : "No Reviews Yet"}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                                            {Array.isArray(reviews) && reviews.length > 0 
                                                ? `Based on ${reviews.length} verified stays`
                                                : "Be the first one to review this stay"}
                                        </p>
                                    </div>
                                </div>
                                {Array.isArray(reviews) && reviews.length > 0 && (
                                    <button
                                        onClick={() => setShowMoreCategories(!showMoreCategories)}
                                        className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        {showMoreCategories ? "Hide Details" : "Show Ratings"}
                                        {showMoreCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showMoreCategories && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 p-8 bg-slate-50/50 rounded-2xl mb-8 mt-2">
                                            {(() => {
                                                const ratings = safeParse(hotel.rating_details, {
                                                    cleanliness: (Number(hotel.guestRating) + 0.2).toFixed(1),
                                                    comfort: (Number(hotel.guestRating) + 0.1).toFixed(1),
                                                    location: (Number(hotel.guestRating) + 0.3).toFixed(1),
                                                    facilities: (Number(hotel.guestRating) - 0.1).toFixed(1),
                                                    staff: (Number(hotel.guestRating) + 0.2).toFixed(1),
                                                    value: (Number(hotel.guestRating) - 0.2).toFixed(1)
                                                });

                                                return [
                                                    { label: "Cleanliness", score: ratings.cleanliness },
                                                    { label: "Comfort", score: ratings.comfort },
                                                    { label: "Location", score: ratings.location },
                                                    { label: "Facilities", score: ratings.facilities },
                                                    { label: "Staff", score: ratings.staff },
                                                    { label: "Value", score: ratings.value }
                                                ].map((cat, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">{cat.label}</span>
                                                            <span className="text-xs font-black text-slate-900 italic leading-none">{Math.min(5, Number(cat.score)).toFixed(1)}</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(Math.min(5, Number(cat.score)) / 5) * 100}%` }}
                                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                                                className="h-full bg-blue-600 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {reviews.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reviews.slice(0, 2).map((rev: any) => (
                                        <div 
                                            key={rev.id} 
                                            onClick={() => setSelectedDetailedReview(rev)}
                                            className="p-10 bg-white/40 backdrop-blur-md rounded-xl shadow-sm hover:shadow-xl transition-all space-y-6 cursor-pointer hover:scale-[1.01]"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm">
                                                        {rev.user?.name?.charAt(0) || "G"}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-slate-950 leading-none">{rev.user?.name || "Verified Guest"}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{formatDate(rev.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-sm font-black italic">
                                                    {rev.rating || "5.0"}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">{parseComment(rev.comment) || "Exceptional stay, everything was perfect!"}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowReviewsModal(true)}
                                className="w-full sm:w-fit px-12 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-blue-700 transition-all shadow-xl mx-auto block mt-4"
                            >
                                Experience All Reviews
                            </button>
                        </div>
                    </section>

                    {/* 5. Policies & Safety */}
                    {(() => {
                        const dynamicPolicies = safeParse(hotel.policies, {});
                        const policyItems = [
                            { id: 'check', title: "Check-in / Check-out", icon: <Clock className="w-5 h-5" />, content: (dynamicPolicies.checkIn || dynamicPolicies.checkOut) ? `Check-in: ${dynamicPolicies.checkIn || '12:00 PM'} | Check-out: ${dynamicPolicies.checkOut || '11:00 AM'}` : null },
                            { id: 'hPol', title: "Hotel Policies", icon: <Shield className="w-5 h-5" />, content: dynamicPolicies.hotelPolicies },
                            { id: 'hRul', title: "House Rules", icon: <Info className="w-5 h-5" />, content: dynamicPolicies.houseRules },
                            { id: 'cCan', title: "Cancellation", icon: <AlertCircle className="w-5 h-5" />, content: dynamicPolicies.cancellation },
                            { id: 'child', title: "Children & Extra Bed", icon: <Users className="w-5 h-5" />, content: dynamicPolicies.children }
                        ].filter(item => {
                            if (!item.content) return false;
                            const contentStr = String(item.content).trim();
                            return contentStr !== "" && contentStr !== "null" && contentStr !== "undefined";
                        });

                        if (policyItems.length === 0 && (typeof safety === 'undefined' || (Array.isArray(safety) && safety.length === 0))) return null;

                        return (
                            <section id="policies" className="space-y-10 pt-16">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-bold text-slate-950 tracking-tight uppercase border-l-4 border-blue-600 pl-4">Policies & Safety</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl ml-4">
                                    {/* Column 1 */}
                                    <div className="space-y-10">
                                        {/* Timing */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Timing & Access</h3>
                                            </div>
                                            <ul className="space-y-3 pl-11">
                                                <li className="flex items-center justify-between text-sm group">
                                                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Check-in</span>
                                                    <span className="font-black text-slate-900">{dynamicPolicies.checkIn || "12:00 PM"}</span>
                                                </li>
                                                <li className="flex items-center justify-between text-sm group">
                                                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Check-out</span>
                                                    <span className="font-black text-slate-900">{dynamicPolicies.checkOut || "11:00 AM"}</span>
                                                </li>
                                                {dynamicPolicies.earlyCheckIn && (
                                                    <li className="text-[11px] text-slate-400 font-medium italic pt-1">
                                                        Note: {dynamicPolicies.earlyCheckIn}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Guest Policies */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Guest Rules</h3>
                                            </div>
                                            <ul className="space-y-3 pl-11">
                                                <li className="flex items-center gap-3">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", dynamicPolicies.localId === 'Accepted' ? "bg-emerald-500" : "bg-red-500")} />
                                                    <span className="text-sm font-bold text-slate-600">Local IDs: <span className="text-slate-900 font-black">{dynamicPolicies.localId || "Accepted"}</span></span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", dynamicPolicies.couplesAllowed === 'Yes' ? "bg-emerald-500" : "bg-red-500")} />
                                                    <span className="text-sm font-bold text-slate-600">Couples: <span className="text-slate-900 font-black">{dynamicPolicies.couplesAllowed || "Yes"}</span></span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    <span className="text-sm font-bold text-slate-600">Required: <span className="text-slate-900 font-black">{dynamicPolicies.requiredId || "Valid Govt. ID"}</span></span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-10">
                                        {/* Cancellation */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <AlertCircle className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cancellation</h3>
                                            </div>
                                            <div className="pl-11 space-y-3">
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                                    {dynamicPolicies.cancellation || "Standard cancellation rules apply."}
                                                </p>
                                                {dynamicPolicies.refundPercentage && (
                                                    <div className="inline-block px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded">
                                                        Refund: {dynamicPolicies.refundPercentage}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* House Rules */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Info className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">House Rules</h3>
                                            </div>
                                            <div className="pl-11 grid grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Smoking</span>
                                                    <p className="text-sm font-black text-slate-900">{dynamicPolicies.smoking || "No"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parties</span>
                                                    <p className="text-sm font-black text-slate-900">{dynamicPolicies.parties || "No"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quiet Hours</span>
                                                    <p className="text-sm font-black text-slate-900">{dynamicPolicies.quietHours || "10PM - 7AM"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pets</span>
                                                    <p className="text-sm font-black text-slate-900">{dynamicPolicies.pets || "Not Allowed"}</p>
                                                </div>
                                            </div>
                                        </div>
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
                        <section className="space-y-8 pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase border-l-4 border-blue-600 pl-4">Trending Nearby</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-4">Highly rated stays in {hotel.city}</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Live Updates</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {trendingHotels.map((h: any) => (
                                    <Link
                                        key={h.id}
                                        to={getHotelUrl(h.id, h.name)}
                                        target="_blank"
                                        className="group bg-white/40 backdrop-blur-md rounded-[40px] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={h.thumbnail}
                                                alt={h.name}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-slate-900 shadow-sm flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {h.guestRating || "4.5"}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-sm font-black text-slate-900 truncate tracking-tight">{h.name}</h3>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {h.city}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-base font-black text-slate-950 italic">{formatPrice(h.pricePerNight)}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">/night</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}


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
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[351] bg-white rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:hidden"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 shrink-0" />
                            <div className="overflow-y-auto p-6 space-y-6 pb-52">
                                <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-xl group">
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
                                    <button onClick={() => setSelectedRoomForDetails(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10">
                                        <X className="w-5 h-5 text-slate-900" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black italic text-slate-950 tracking-tight leading-tight">{selectedRoomForDetails.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest"><Users className="w-4 h-4 text-blue-600" /> {selectedRoomForDetails.maxOccupancy || selectedRoomForDetails.capacityAdults || 2} Max Guests</div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest"><Bed className="w-4 h-4 text-blue-600" /> {selectedRoomForDetails.bedConfiguration || "1 Bed"}</div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
                                            {selectedRoomForDetails.description || "Experience comfort and elegance in our specially designed rooms."}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Amenities</h4>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                            {safeParse(selectedRoomForDetails.amenities, []).map((amenity: string) => (
                                                <div key={amenity} className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{amenityLabel(amenity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Booking Highlights</h4>
                                        <div className="space-y-3">
                                            {(stayType === 'hourly' 
                                                ? ["Instant booking confirmation", `Exclusive ${duration} hour pricing`, "Safe and secure check-in"]
                                                : (safeParse(selectedRoomForDetails.trustPoints, []).length > 0 ? safeParse(selectedRoomForDetails.trustPoints, []) : [
                                                    "Secure booking with instant confirmation",
                                                    "Pay remaining 88% at hotel"
                                                ])
                                            ).map((point: string, pIdx: number) => (
                                                <div key={pIdx} className="flex items-start gap-3 py-1">
                                                    <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                                                    </div>
                                                    <p className="text-[11px] font-bold text-emerald-900 italic leading-snug">{point}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-[352]">
                                <div className="max-w-md mx-auto space-y-4">
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
                                                                  <span className="text-[10px] font-bold text-slate-400 line-through">{formatPrice(sInfo.originalPrice * stayNights)}</span>
                                                                  <span className="text-[8px] font-black text-red-500 uppercase">{Math.round((1 - sInfo.finalPrice / sInfo.originalPrice) * 100)}% OFF</span>
                                                              </div>
                                                          )}
                                                          <div className="flex items-baseline gap-1">
                                                              <span className="text-2xl font-black text-slate-950 italic leading-none">{formatPrice(sInfo.finalPrice)}</span>
                                                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{stayType === 'hourly' ? `/${duration}h` : '/night'}</span>
                                                          </div>
                                                          {stayNights > 1 && (
                                                              <span className="text-[10px] font-bold text-slate-500 mt-1">
                                                                  Total ({stayNights} nights): <span className="font-extrabold text-slate-800">{formatPrice(totalStayPrice)}</span>
                                                              </span>
                                                          )}
                                                      </div>
                                                      <div className="flex flex-col items-end">
                                                          <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-100 animate-pulse flex flex-col items-center">
                                                              <span className="text-[7px] font-black uppercase tracking-[0.1em] leading-none mb-0.5">Pay 12% Now</span>
                                                              <span className="text-xs font-black italic">{formatPrice(advanceAmt)}</span>
                                                          </div>
                                                          <span className="text-[7px] font-bold text-slate-400 uppercase mt-1">Rest at hotel ({formatPrice(restAmt)})</span>
                                                      </div>
                                                  </>
                                              );
                                          })()}
                                    </div>
                                    {(() => {
                                        const vIdx = hotel.room.findIndex((r: any) => r.id === selectedRoomForDetails.id); 
                                        // Note: If room detail modal is open, we need the specific variant index if applicable. 
                                        // For now, using variant index from the context of how the modal was opened.
                                        const currentVariantIdx = selectedRoomForDetails.selectedVariant ? 
                                            (selectedRoomForDetails.variants?.indexOf(selectedRoomForDetails.selectedVariant) ?? 0).toString() : "0";
                                        const cartKey = `${selectedRoomForDetails.id}_${currentVariantIdx}`;

                                        if (selectedRooms[cartKey]) {
                                            return (
                                                <div className="w-full flex items-center justify-between bg-brand-50 rounded-xl p-2 shadow-inner border border-brand-100">
                                                    <button onClick={(e) => handleCartQuantity(e, selectedRoomForDetails.id, currentVariantIdx, -1, selectedRoomForDetails.inventory || 5)} className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                    <span className="text-xs font-black text-brand-700">{selectedRooms[cartKey]} Room{selectedRooms[cartKey] > 1 ? 's' : ''} Selected</span>
                                                    <button onClick={(e) => handleCartQuantity(e, selectedRoomForDetails.id, currentVariantIdx, 1, selectedRoomForDetails.inventory || 5)} className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return (
                                            <button
                                                onClick={(e) => handleBook(e, selectedRoomForDetails.id, currentVariantIdx)}
                                                className="w-full py-4 bg-slate-950 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-l-3 border-blue-600 pl-3">Room Amenities</h4>
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                                            {safeParse(selectedRoomForDetails.amenities, []).map((amenity: string) => (
                                                <div key={amenity} className="flex items-center gap-3 group">
                                                    <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                                                        <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={4} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                                                        {amenityLabel(amenity)}
                                                    </span>
                                                </div>
                                            ))}
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
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMessageModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Message Host</h3>
                                <button onClick={() => setIsMessageModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
                            </div>
                            <textarea
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                placeholder="Type your inquiry here..."
                                className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none mb-6"
                            />
                            <button onClick={handleSendMessage} disabled={isSendingMessage} className="w-full py-4 bg-brand-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-brand-700 transition-all disabled:opacity-50">
                                {isSendingMessage ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Message"}
                            </button>
                        </motion.div>
                    </div>
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
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm">
                                        {selectedDetailedReview.user?.name?.charAt(0) || "G"}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-950 leading-none">
                                            {selectedDetailedReview.user?.name || "Verified Guest"}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                                            {formatDate(selectedDetailedReview.createdAt)}
                                        </p>
                                    </div>
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
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Overall Stay Rating</span>
                                    <div className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-black italic">
                                        ⭐ {selectedDetailedReview.rating || "5.0"} / 5
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
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm">
                                                {rev.user?.name?.charAt(0) || "G"}
                                            </div>
                                            <div>
                                                <h5 className="text-[13px] font-black text-slate-900">{rev.user?.name || "Verified Guest"}</h5>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {formatDate(rev.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 sm:pl-4">
                                            <p className="text-xs text-slate-600 italic truncate max-w-md">
                                                {parseComment(rev.comment) || "Exceptional stay!"}
                                            </p>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black italic">
                                            ⭐ {rev.rating || "5.0"}
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

        </div>
    );
}
