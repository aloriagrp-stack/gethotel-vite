'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { partnerApi, authApi } from "@/lib/api";

const PROPERTY_TYPES = [
    "Boutique & City Hotel",
    "Homestay & Farmstay",
    "Luxury Villa & Estate",
    "Resort & Wellness Retreat",
    "Guest House & B&B"
];

const AVAILABLE_AMENITIES = [
    "Free High-Speed WiFi",
    "Free On-Site Parking",
    "Swimming Pool",
    "In-House Restaurant",
    "24/7 Front Desk",
    "Air Conditioning",
    "100% Power Backup",
    "CCTV Security",
    "Elevator / Lift",
    "Room Service",
    "Couple Friendly",
    "Pet Friendly",
    "Complimentary Breakfast Available",
    "Airport Transfers"
];

const ROOM_AMENITIES_LIST = [
    "Air Conditioning",
    "Private Attached Bathroom",
    "Flat Screen 4K TV",
    "Geyser / Hot Water",
    "Balcony / View",
    "High-Speed Free WiFi",
    "Electric Kettle",
    "Work Desk",
    "Complimentary Toiletries"
];

interface RoomCategory {
    id: string;
    name: string;
    bedType: string;
    occupancy: number;
    price: number;
    inventory: number;
    amenities: string[];
    images: string[];
}

export default function ListPropertyRegister() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);

    // ─── Step 1: Host Account & OTP Verification ──────────────────────────────
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [partnerPassword, setPartnerPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Email OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpMessage, setOtpMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let timer: any;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    // ─── Step 2: Property Details ─────────────────────────────────────────────
    const [hotelName, setHotelName] = useState("");
    const [propertyType, setPropertyType] = useState("Boutique & City Hotel");
    const [totalRooms, setTotalRooms] = useState<number>(10);
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("Delhi");
    const [stateName, setStateName] = useState("Delhi NCR");
    const [pincode, setPincode] = useState("");
    const [hotelAmenities, setHotelAmenities] = useState<string[]>([
        "Free High-Speed WiFi",
        "Air Conditioning",
        "24/7 Front Desk",
        "100% Power Backup"
    ]);

    // ─── Step 3: Photos, Rooms & Pricing ──────────────────────────────────────
    const [hotelImages, setHotelImages] = useState<string[]>([]);
    const [photoInput, setPhotoInput] = useState("");

    const [rooms, setRooms] = useState<RoomCategory[]>([
        {
            id: "room_1",
            name: "Deluxe Room",
            bedType: "King Bed",
            occupancy: 2,
            price: 2499,
            inventory: 5,
            amenities: ["Air Conditioning", "Private Attached Bathroom", "High-Speed Free WiFi"],
            images: []
        }
    ]);

    const [roomPhotoInputs, setRoomPhotoInputs] = useState<{ [roomId: string]: string }>({});
    const [minPrice, setMinPrice] = useState<number>(1800);
    const [maxPrice, setMaxPrice] = useState<number>(4500);

    // ─── OTP Functions ────────────────────────────────────────────────────────
    const handleSendOTP = async () => {
        setError("");
        setOtpMessage("");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userEmail.trim() || !emailRegex.test(userEmail.trim())) {
            setError("Please enter a valid email address first.");
            return;
        }

        setOtpLoading(true);
        try {
            const passToSend = partnerPassword || "TempPass_GHS_2026!";
            const res = await authApi.sendOTP({
                name: userName.trim() || "Host Partner",
                email: userEmail.trim().toLowerCase(),
                password: passToSend,
                role: "user"
            });

            if (res && (res.success || res.message)) {
                setOtpSent(true);
                setResendTimer(60);
                setOtpMessage("OTP has been sent to your email. Please check your inbox.");
            } else {
                setError(res?.message || "Failed to send OTP. Please check your email address.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to send OTP. Please check your connection.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError("");
        setOtpMessage("");

        if (!otpCode.trim() || otpCode.trim().length < 4) {
            setError("Please enter the OTP received in your email.");
            return;
        }

        setOtpLoading(true);
        try {
            const res = await authApi.verifyOTP({
                email: userEmail.trim().toLowerCase(),
                otp: otpCode.trim()
            });

            if (res && (res.success || res.token || res.user)) {
                setIsEmailVerified(true);
                setOtpSent(false);
                setOtpMessage("Email verified successfully.");
            } else {
                setError(res?.message || "Invalid or expired OTP. Please try again.");
            }
        } catch (err: any) {
            setError(err.message || "Invalid OTP. Please check the code and try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    // ─── Room & Photo Handlers ────────────────────────────────────────────────
    const toggleHotelAmenity = (item: string) => {
        setHotelAmenities(prev => 
            prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
        );
    };

    const addHotelPhoto = () => {
        const url = photoInput.trim();
        if (!url) return;
        if (!hotelImages.includes(url)) {
            setHotelImages(prev => [...prev, url]);
        }
        setPhotoInput("");
    };

    const removeHotelPhoto = (index: number) => {
        setHotelImages(prev => prev.filter((_, i) => i !== index));
    };

    const addRoomCategory = () => {
        const newId = `room_${Date.now()}`;
        setRooms(prev => [
            ...prev,
            {
                id: newId,
                name: `Room Type ${prev.length + 1}`,
                bedType: "King Bed",
                occupancy: 2,
                price: 2999,
                inventory: 4,
                amenities: ["Air Conditioning", "Private Attached Bathroom"],
                images: []
            }
        ]);
    };

    const removeRoomCategory = (id: string) => {
        if (rooms.length <= 1) {
            setError("At least one room category is required.");
            return;
        }
        setRooms(prev => prev.filter(r => r.id !== id));
    };

    const updateRoom = (id: string, field: keyof RoomCategory, val: any) => {
        setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const toggleRoomAmenity = (roomId: string, amenity: string) => {
        setRooms(prev => prev.map(r => {
            if (r.id !== roomId) return r;
            const has = r.amenities.includes(amenity);
            return {
                ...r,
                amenities: has ? r.amenities.filter(a => a !== amenity) : [...r.amenities, amenity]
            };
        }));
    };

    const addRoomPhoto = (roomId: string) => {
        const url = (roomPhotoInputs[roomId] || "").trim();
        if (!url) return;
        setRooms(prev => prev.map(r => {
            if (r.id !== roomId) return r;
            return {
                ...r,
                images: r.images.includes(url) ? r.images : [...r.images, url]
            };
        }));
        setRoomPhotoInputs(prev => ({ ...prev, [roomId]: "" }));
    };

    const removeRoomPhoto = (roomId: string, imgIdx: number) => {
        setRooms(prev => prev.map(r => {
            if (r.id !== roomId) return r;
            return {
                ...r,
                images: r.images.filter((_, i) => i !== imgIdx)
            };
        }));
    };

    // ─── Validations ──────────────────────────────────────────────────────────
    const validateStep1 = () => {
        setError("");
        if (!userName.trim()) {
            setError("Please enter your full name.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userEmail.trim() || !emailRegex.test(userEmail.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }
        if (!isEmailVerified) {
            setError("Please verify your email address with OTP before continuing.");
            return false;
        }
        const cleanPhone = userPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return false;
        }
        if (!partnerPassword || partnerPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return false;
        }
        if (partnerPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        setError("");
        if (!hotelName.trim()) {
            setError("Please enter the property name.");
            return false;
        }
        if (!address.trim()) {
            setError("Please enter the full address.");
            return false;
        }
        if (!city.trim()) {
            setError("Please enter the city.");
            return false;
        }
        if (!totalRooms || totalRooms < 1) {
            setError("Total rooms must be at least 1.");
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        setError("");
        if (rooms.length === 0) {
            setError("Please configure at least one room category.");
            return false;
        }
        for (const r of rooms) {
            if (!r.name.trim()) {
                setError("Each room category must have a name.");
                return false;
            }
            if (!r.price || r.price <= 0) {
                setError(`Please enter a valid nightly price for ${r.name}.`);
                return false;
            }
        }
        if (minPrice <= 0) {
            setError("Minimum price must be greater than 0.");
            return false;
        }
        if (maxPrice <= minPrice) {
            setError("Maximum price must be greater than minimum price.");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        if (currentStep === 3 && !validateStep3()) return;
        setCurrentStep(prev => Math.min(4, prev + 1));
    };

    const handleBack = () => {
        setError("");
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = async () => {
        if (!agreedTerms) {
            setError("Please accept the terms and 12% commission to complete submission.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const cleanPhone = userPhone.replace(/[^0-9]/g, '').slice(-10);
            const basePrice = rooms[0]?.price || minPrice;

            const finalPayload = {
                userName: userName.trim(),
                userEmail: userEmail.trim().toLowerCase(),
                userPhone: cleanPhone,
                partnerPassword: partnerPassword,
                hotelName: hotelName.trim(),
                hotelUsername: `hotel_${userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`,
                tagline: `${propertyType} in ${city}`,
                description: `${propertyType} with ${totalRooms} rooms in ${city}, ${stateName}.`,
                address: `${address.trim()}${pincode ? ` - ${pincode}` : ''}`,
                city: city.trim(),
                pricePerNight: basePrice,
                propertyType,
                totalRooms,
                hotelAmenities,
                hotelImages,
                minPrice,
                maxPrice,
                rooms
            };

            const response = await partnerApi.submitRequest(finalPayload);

            if (response && (response.success || response.data)) {
                setSubmitted(true);
            } else {
                setError(response?.message || response?.error || "Submission could not be completed.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit property. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Submitted Screen (Footer Color BG, No Image, No Cards, No Icons) ────
    if (submitted) {
        return (
            <div 
                className="fixed inset-0 h-screen w-screen overflow-hidden text-slate-900 flex flex-col justify-between p-8 sm:p-14 z-50 bg-[#f8fafc]"
                style={{
                    background: "linear-gradient(to bottom right, #eff6ff 0%, #f8fafc 50%, #eff6ff 100%)"
                }}
            >
                <header className="flex justify-between items-center pb-6 border-b border-slate-200">
                    <span className="text-xl font-bold tracking-tight text-slate-950">
                        GetHotelStays<span className="text-blue-600">.</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                        Property Submission
                    </span>
                </header>

                <main className="max-w-xl mx-auto w-full my-auto space-y-4">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        Submission Received
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                        Application Submitted
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Your property listing for <b className="text-slate-900">{hotelName}</b> has been received and is currently under review by our operations desk.
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        A confirmation receipt has been sent to <b className="text-slate-900">{userEmail}</b>. Once our team approves your listing (typically within 2 to 4 hours), your property will go live with dynamic pricing enabled.
                    </p>
                    <div className="pt-4">
                        <Link 
                            href="/"
                            className="inline-block px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/20"
                        >
                            Return to Homepage
                        </Link>
                    </div>
                </main>

                <footer className="text-xs text-slate-400 pt-6 border-t border-slate-200">
                    GetHotelStays Partner Desk • reservation@gethotelstays.com
                </footer>
            </div>
        );
    }

    // ─── Fixed Single-Screen Layout (Footer Color BG, Brand Blue, No Cards, No Icons, No Tags) ──
    return (
        <div 
            className="fixed inset-0 h-screen w-screen overflow-hidden text-slate-900 flex flex-col font-sans z-50 bg-[#f8fafc]"
            style={{
                background: "linear-gradient(to bottom right, #eff6ff 0%, #f8fafc 50%, #eff6ff 100%)"
            }}
        >
            {/* Top Header */}
            <header className="h-16 shrink-0 border-b border-slate-200/80 px-6 sm:px-12 flex items-center justify-between bg-white/70 backdrop-blur-md">
                <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">
                    GetHotelStays<span className="text-blue-600">.</span>
                </Link>

                {/* Minimal Text Step Indicator */}
                <div className="hidden sm:flex items-center gap-6 text-xs font-semibold">
                    {[
                        { step: 1, label: "1. Account" },
                        { step: 2, label: "2. Property" },
                        { step: 3, label: "3. Rooms & Pricing" },
                        { step: 4, label: "4. Review" }
                    ].map((s) => (
                        <span 
                            key={s.step} 
                            className={
                                s.step === currentStep 
                                    ? "text-blue-600 border-b-2 border-blue-600 pb-1 font-bold" 
                                    : s.step < currentStep 
                                        ? "text-slate-600 font-medium" 
                                        : "text-slate-400 font-normal"
                            }
                        >
                            {s.label}
                        </span>
                    ))}
                </div>

                <Link href="/partner" className="text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors">
                    Already a partner? Sign In
                </Link>
            </header>

            {/* Glowing Blue Divider Line (Like Site Footer) */}
            <div className="relative w-full h-[2px] overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[2px] opacity-75" />
            </div>

            {/* Central Form Viewport (Contained, Clean, No Floating Card Box) */}
            <main className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Step Title & Subtitle */}
                    <div className="space-y-1">
                        <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                            Step {currentStep} of 4
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                            {currentStep === 1 && "Account & Email Verification"}
                            {currentStep === 2 && "Property Details & Location"}
                            {currentStep === 3 && "Rooms & Dynamic Pricing"}
                            {currentStep === 4 && "Review & Submit"}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            {currentStep === 1 && "Enter your contact details. Your email must be verified via OTP."}
                            {currentStep === 2 && "Enter your property name, location, and guest facilities."}
                            {currentStep === 3 && "Configure room categories and dynamic pricing limits."}
                            {currentStep === 4 && "Confirm all details before final verification submission."}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="p-3 bg-red-50 border-l-2 border-red-500 text-xs font-semibold text-red-700 rounded-r-md">
                            {error}
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────
                        STEP 1: ACCOUNT & EMAIL OTP VERIFICATION
                    ───────────────────────────────────────────────────────── */}
                    {currentStep === 1 && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Full Name *
                                </label>
                                <input 
                                    type="text" 
                                    value={userName} 
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-2xs"
                                />
                            </div>

                            {/* Email Address with OTP Button */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">
                                    Email Address *
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="email" 
                                        disabled={isEmailVerified}
                                        value={userEmail} 
                                        onChange={(e) => {
                                            setUserEmail(e.target.value);
                                            setIsEmailVerified(false);
                                            setOtpSent(false);
                                        }}
                                        placeholder="hotel@example.com"
                                        className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs"
                                    />
                                    {!isEmailVerified ? (
                                        <button 
                                            type="button" 
                                            onClick={handleSendOTP}
                                            disabled={otpLoading || resendTimer > 0}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-all shrink-0 shadow-sm shadow-blue-500/20 cursor-pointer"
                                        >
                                            {otpLoading ? "Sending..." : resendTimer > 0 ? `Resend (${resendTimer}s)` : "Send OTP"}
                                        </button>
                                    ) : (
                                        <span className="px-3.5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center shrink-0">
                                            Verified
                                        </span>
                                    )}
                                </div>
                                {otpMessage && (
                                    <p className="text-xs text-blue-600 font-medium">{otpMessage}</p>
                                )}
                            </div>

                            {/* OTP Input Field */}
                            {otpSent && !isEmailVerified && (
                                <div className="space-y-1.5 p-4 bg-white/90 border border-slate-200 rounded-lg shadow-2xs">
                                    <label className="text-xs font-semibold text-slate-800 block">
                                        Enter 6-Digit OTP sent to your email *
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="123456"
                                            className="w-40 px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm font-mono tracking-widest text-slate-900 focus:border-blue-600 outline-none"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleVerifyOTP}
                                            disabled={otpLoading}
                                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                                        >
                                            {otpLoading ? "Verifying..." : "Verify OTP"}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Did not receive? Check spam folder or click resend when timer finishes.
                                    </p>
                                </div>
                            )}

                            {/* Mobile Phone Number */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Mobile Phone Number (+91) *
                                </label>
                                <input 
                                    type="tel" 
                                    maxLength={10}
                                    value={userPhone} 
                                    onChange={(e) => setUserPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="9876543210"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-2xs"
                                />
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Password *
                                    </label>
                                    <input 
                                        type="password" 
                                        value={partnerPassword} 
                                        onChange={(e) => setPartnerPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-2xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Confirm Password *
                                    </label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-2xs"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────
                        STEP 2: PROPERTY DETAILS & AMENITIES
                    ───────────────────────────────────────────────────────── */}
                    {currentStep === 2 && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Property Type *
                                </label>
                                <select 
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                                >
                                    {PROPERTY_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Hotel / Property Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={hotelName} 
                                        onChange={(e) => setHotelName(e.target.value)}
                                        placeholder="e.g. Vedas Heritage Haveli"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Total Number of Rooms *
                                    </label>
                                    <input 
                                        type="number" 
                                        min={1}
                                        value={totalRooms} 
                                        onChange={(e) => setTotalRooms(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        City *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={city} 
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="e.g. Delhi, Jaipur"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                    />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Full Address *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={address} 
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Street, Area, Landmark"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        State
                                    </label>
                                    <input 
                                        type="text" 
                                        value={stateName} 
                                        onChange={(e) => setStateName(e.target.value)}
                                        placeholder="e.g. Delhi NCR"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Postal Code
                                    </label>
                                    <input 
                                        type="text" 
                                        value={pincode} 
                                        onChange={(e) => setPincode(e.target.value)}
                                        placeholder="e.g. 110001"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                    />
                                </div>
                            </div>

                            {/* Property Amenities */}
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                                <label className="text-xs font-semibold text-slate-700 block">
                                    Hotel Amenities
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {AVAILABLE_AMENITIES.map((am) => {
                                        const checked = hotelAmenities.includes(am);
                                        return (
                                            <label key={am} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-950 transition-colors">
                                                <input 
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleHotelAmenity(am)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0"
                                                />
                                                <span>{am}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────
                        STEP 3: ROOMS, PHOTOS & DYNAMIC PRICING
                    ───────────────────────────────────────────────────────── */}
                    {currentStep === 3 && (
                        <div className="space-y-6 pt-2">
                            {/* Hotel Photos */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-700 block">
                                    Property Photos ({hotelImages.length})
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="url" 
                                        value={photoInput}
                                        onChange={(e) => setPhotoInput(e.target.value)}
                                        placeholder="Paste image URL (https://...)"
                                        className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={addHotelPhoto}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Add Photo
                                    </button>
                                </div>

                                {hotelImages.length > 0 && (
                                    <div className="space-y-1 pt-1 text-xs text-slate-600">
                                        {hotelImages.map((img, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200">
                                                <span className="truncate max-w-md">{img}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeHotelPhoto(idx)}
                                                    className="text-red-500 hover:text-red-700 font-semibold ml-2 cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Rooms Configurator */}
                            <div className="space-y-3 pt-3 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Room Categories ({rooms.length})
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={addRoomCategory}
                                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                                    >
                                        + Add Room Category
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {rooms.map((room, rIdx) => (
                                        <div key={room.id} className="p-4 bg-white/80 border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-900">
                                                    Room {rIdx + 1}
                                                </span>
                                                {rooms.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeRoomCategory(room.id)}
                                                        className="text-xs text-slate-400 hover:text-red-600 font-medium transition-colors cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                                                <div className="sm:col-span-2">
                                                    <label className="text-[11px] text-slate-500 block mb-1">Room Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={room.name}
                                                        onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                                                        placeholder="e.g. Deluxe King Room"
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] text-slate-500 block mb-1">Bed Type</label>
                                                    <select 
                                                        value={room.bedType}
                                                        onChange={(e) => updateRoom(room.id, 'bedType', e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                                                    >
                                                        <option value="King Bed">King Bed</option>
                                                        <option value="Queen Bed">Queen Bed</option>
                                                        <option value="Twin Beds">Twin Beds</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[11px] text-slate-500 block mb-1">Base Price (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        value={room.price}
                                                        onChange={(e) => updateRoom(room.id, 'price', parseFloat(e.target.value) || 0)}
                                                        placeholder="2500"
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-semibold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Amenities Checkbox List */}
                                            <div className="pt-1">
                                                <span className="text-[11px] text-slate-500 block mb-1">Room Amenities</span>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-600">
                                                    {ROOM_AMENITIES_LIST.map((ram) => (
                                                        <label key={ram} className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
                                                            <input 
                                                                type="checkbox"
                                                                checked={room.amenities.includes(ram)}
                                                                onChange={() => toggleRoomAmenity(room.id, ram)}
                                                                className="w-3 h-3 rounded border-slate-300 accent-blue-600"
                                                            />
                                                            <span className="truncate">{ram}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic AI Pricing */}
                            <div className="space-y-3 pt-3 border-t border-slate-200">
                                <div>
                                    <label className="text-xs font-semibold text-slate-900 block">
                                        Dynamic AI Pricing Boundaries
                                    </label>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Set your lowest safety floor and highest ceiling. Our AI dynamic pricing system will autonomously optimize rates within this range to maximize bookings.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Lowest Price Floor (₹) *
                                        </label>
                                        <input 
                                            type="number" 
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                                            placeholder="1800"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                        />
                                        <span className="text-[11px] text-slate-500">The rate will never drop below this floor.</span>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Highest Peak Ceiling (₹) *
                                        </label>
                                        <input 
                                            type="number" 
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
                                            placeholder="4500"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none shadow-2xs"
                                        />
                                        <span className="text-[11px] text-slate-500">Maximum rate during high demand or holidays.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────
                        STEP 4: REVIEW & SUBMIT
                    ───────────────────────────────────────────────────────── */}
                    {currentStep === 4 && (
                        <div className="space-y-4 pt-2">
                            <div className="p-3 bg-blue-50 border-l-2 border-blue-600 text-xs text-blue-900 rounded-r-md">
                                All registration details are completed. Please confirm below before submitting for verification.
                            </div>

                            <div className="divide-y divide-slate-200 border-t border-b border-slate-200 text-xs">
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">Owner Name:</span>
                                    <span className="font-semibold text-slate-900">{userName}</span>
                                </div>
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">Email:</span>
                                    <span className="font-semibold text-slate-900">{userEmail} (Verified)</span>
                                </div>
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">Phone:</span>
                                    <span className="font-semibold text-slate-900">+91 {userPhone}</span>
                                </div>
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">Property Name:</span>
                                    <span className="font-semibold text-slate-900">{hotelName} ({propertyType})</span>
                                </div>
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">Location:</span>
                                    <span className="font-semibold text-slate-900">{address}, {city}</span>
                                </div>
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">Total Rooms:</span>
                                    <span className="font-semibold text-slate-900">{totalRooms} Rooms</span>
                                </div>
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">Configured Categories:</span>
                                    <span className="font-semibold text-slate-900">{rooms.length} Type(s)</span>
                                </div>
                                <div className="py-2.5 flex justify-between">
                                    <span className="text-slate-500">AI Price Guardrails:</span>
                                    <span className="font-semibold text-slate-900">₹{minPrice} - ₹{maxPrice}</span>
                                </div>
                            </div>

                            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-2">
                                <input 
                                    type="checkbox"
                                    checked={agreedTerms}
                                    onChange={(e) => setAgreedTerms(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-blue-600"
                                />
                                <span>
                                    I confirm these details are accurate and agree to the <b className="text-slate-950">flat 12% commission</b> on completed stays.
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            </main>

            {/* Fixed Bottom Action Bar */}
            <footer className="h-16 shrink-0 border-t border-slate-200/80 px-6 sm:px-12 flex items-center justify-between bg-white/80 backdrop-blur-md">
                <div>
                    {currentStep > 1 && (
                        <button 
                            type="button" 
                            onClick={handleBack}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 transition-colors cursor-pointer"
                        >
                            Back
                        </button>
                    )}
                </div>

                <div>
                    {currentStep < 4 ? (
                        <button 
                            type="button" 
                            onClick={handleNext}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                        >
                            Continue
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                        >
                            {loading ? "Submitting..." : "Submit Property"}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}

