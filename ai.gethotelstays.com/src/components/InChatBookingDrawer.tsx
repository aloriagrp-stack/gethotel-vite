import { useState, useEffect, useMemo } from 'react';
import { X, User, ShieldCheck, CreditCard, Sparkles, AlertCircle, Loader, Building } from 'lucide-react';
import { bookingApi, paymentApi, aiApi } from '../lib/api';

interface InChatBookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: {
    id: number;
    name: string;
    city: string;
    thumbnail?: string;
    pricePerNight?: number;
    starRating?: number;
    guestRating?: number;
  } | null;
  room?: {
    id: number;
    name: string;
    pricePerNight: number;
    images?: string[];
    maxOccupancy?: number;
  } | null;
  user?: any;
  theme?: 'light' | 'dark';
  onPaymentSuccess: (bookingSummary: {
    bookingId: number;
    hotelName: string;
    hotelCity: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalGuests: number;
    totalPrice: number;
    paidAmount: number;
    balanceAmount: number;
    paymentType: 'deposit' | 'full';
    guestName: string;
    guestEmail: string;
    guestPhone: string;
  }) => void;
}

export default function InChatBookingDrawer({
  isOpen,
  onClose,
  hotel,
  room,
  user,
  theme = 'light',
  onPaymentSuccess
}: InChatBookingDrawerProps) {
  // Dates setup (Tomorrow to Day After Tomorrow by default)
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const dayAfterTomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow);
  const [roomsCount, setRoomsCount] = useState(1);
  const [guestsCount, setGuestsCount] = useState(2);
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');

  // Available rooms for this hotel
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(room?.id || null);

  // Guest Details
  const [guestName, setGuestName] = useState(user?.name || user?.displayName || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update details if user or room changes
  useEffect(() => {
    if (user) {
      if (!guestName && (user.name || user.displayName)) setGuestName(user.name || user.displayName);
      if (!guestEmail && user.email) setGuestEmail(user.email);
      if (!guestPhone && (user.phone || user.phoneNumber)) setGuestPhone(user.phone || user.phoneNumber);
    }
  }, [user]);

  useEffect(() => {
    if (room?.id) {
      setSelectedRoomId(room.id);
    }
  }, [room]);

  // Fetch rooms if hotel changes
  useEffect(() => {
    if (hotel?.id && isOpen) {
      aiApi.getRooms(hotel.id)
        .then(res => {
          if (res.success && Array.isArray(res.rooms) && res.rooms.length > 0) {
            setAvailableRooms(res.rooms);
            if (!selectedRoomId || !res.rooms.some((r: any) => r.id === selectedRoomId)) {
              setSelectedRoomId(res.rooms[0].id);
            }
          } else {
            setAvailableRooms([]);
          }
        })
        .catch(err => {
          console.warn('[BookingDrawer] Failed to load hotel rooms:', err.message);
        });
    }
  }, [hotel?.id, isOpen]);

  // Selected Room Object & Price
  const activeRoom = useMemo(() => {
    if (selectedRoomId && availableRooms.length > 0) {
      return availableRooms.find(r => r.id === selectedRoomId) || availableRooms[0];
    }
    return room || { id: 0, name: 'Deluxe Room', pricePerNight: hotel?.pricePerNight || 2499 };
  }, [selectedRoomId, availableRooms, room, hotel]);

  // Calculate Nights & Pricing
  const nights = useMemo(() => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const basePrice = activeRoom?.pricePerNight || hotel?.pricePerNight || 2499;
  const roomTotal = basePrice * roomsCount * nights;
  const taxes = Math.round(roomTotal * 0.12);
  const grandTotal = roomTotal + taxes;

  const depositAmount = Math.round(grandTotal * 0.12);
  const balanceAtHotel = grandTotal - depositAmount;
  const amountToPayNow = paymentType === 'deposit' ? depositAmount : grandTotal;

  if (!isOpen || !hotel) return null;

  const handlePayAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!guestName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create reservation in backend
      const bookingPayload = {
        hotelId: hotel.id,
        rooms: [{ roomId: activeRoom.id || selectedRoomId || 1, count: roomsCount, price: basePrice }],
        checkIn,
        checkOut,
        totalGuests: guestsCount,
        guestInfo: {
          fullName: guestName.trim(),
          email: guestEmail.trim(),
          phone: guestPhone.trim(),
          specialRequests: specialRequests.trim()
        },
        stayType: 'standard',
        paymentStatus: paymentType === 'full' ? 'paid' : 'partial'
      };

      const bookingRes = await bookingApi.createBooking(bookingPayload);
      if (!bookingRes.success || !bookingRes.booking?.id) {
        throw new Error(bookingRes.message || 'Failed to initialize booking.');
      }

      const bookingId = bookingRes.booking.id;

      // 2. Create Razorpay Order
      const orderRes = await paymentApi.createOrder(bookingId);
      if (!orderRes.success || !orderRes.order?.id) {
        throw new Error(orderRes.message || 'Failed to generate online payment order.');
      }

      const order = orderRes.order;
      const razorpayKey = orderRes.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

      // 3. Open Razorpay Checkout Modal
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh the page.');
      }

      const rzpOptions = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'GetHotelStays AI Concierge',
        description: `Reservation for ${hotel.name} (${nights} Night${nights > 1 ? 's' : ''})`,
        image: 'https://gethotelstays.com/logo.png',
        order_id: order.id,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone
        },
        theme: {
          color: '#1087e7'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setErrorMessage('Payment window closed. You can tap "Pay Online" to retry.');
          }
        },
        handler: async (response: any) => {
          try {
            // 4. Verify Payment Signature
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });

            if (verifyRes.success) {
              onPaymentSuccess({
                bookingId,
                hotelName: hotel.name,
                hotelCity: hotel.city,
                roomName: activeRoom.name || 'Deluxe Room',
                checkIn,
                checkOut,
                nights,
                totalGuests: guestsCount,
                totalPrice: grandTotal,
                paidAmount: amountToPayNow,
                balanceAmount: paymentType === 'deposit' ? balanceAtHotel : 0,
                paymentType,
                guestName,
                guestEmail,
                guestPhone
              });
              onClose();
            } else {
              setErrorMessage(verifyRes.message || 'Payment verification failed.');
            }
          } catch (verifyErr: any) {
            setErrorMessage(verifyErr.message || 'Verification error occurred.');
          } finally {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (failRes: any) => {
        setIsProcessing(false);
        setErrorMessage(failRes.error?.description || 'Payment was declined by your bank.');
      });
      rzp.open();

    } catch (err: any) {
      console.error('[BookingDrawer Error]:', err);
      setErrorMessage(err.message || 'Something went wrong while initiating payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div
        className={`w-full max-w-lg h-full overflow-y-auto custom-scrollbar flex flex-col shadow-2xl transition-transform duration-300 ${
          theme === 'dark' ? 'bg-[#0f0f13] text-slate-100 border-l border-slate-800' : 'bg-white text-slate-900 border-l border-slate-200'
        }`}
      >
        {/* Drawer Header */}
        <div className={`p-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${
          theme === 'dark' ? 'bg-[#0f0f13]/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold leading-tight">Instant In-Chat Reservation</h3>
              <p className="text-[10px] text-slate-400 font-medium">Guaranteed Best Rate • Instant Confirmation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handlePayAndBook} className="p-5 space-y-5 flex-1">
          {/* Hotel Snapshot Card */}
          <div className={`p-3.5 rounded-2xl border flex gap-3.5 items-center ${
            theme === 'dark' ? 'bg-[#15151a] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {hotel.thumbnail ? (
              <img src={hotel.thumbnail} alt={hotel.name} className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center shrink-0">
                <Building className="w-7 h-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black truncate">{hotel.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium">{hotel.city}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-brand-500">₹{basePrice.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal"> / night</span></span>
                {hotel.guestRating && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    ★ {hotel.guestRating}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Room Selection */}
          {availableRooms.length > 1 && (
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Select Room Category
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableRooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoomId(r.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedRoomId === r.id
                        ? (theme === 'dark' ? 'bg-brand-500/20 border-brand-500/50 text-white' : 'bg-brand-50 border-brand-400 text-brand-900 font-bold')
                        : (theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300')
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{r.name}</p>
                      <p className="text-[10px] text-slate-400">Max Occupancy: {r.maxOccupancy || 2} Guests</p>
                    </div>
                    <span className="text-xs font-black text-brand-500">₹{r.pricePerNight?.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dates & Occupancy Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Check-in</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className={`w-full px-3 py-2 text-xs font-bold border rounded-xl outline-none ${
                  theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Check-out</label>
              <input
                type="date"
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className={`w-full px-3 py-2 text-xs font-bold border rounded-xl outline-none ${
                  theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Rooms</label>
              <select
                value={roomsCount}
                onChange={(e) => setRoomsCount(parseInt(e.target.value))}
                className={`w-full px-3 py-2 text-xs font-bold border rounded-xl outline-none ${
                  theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                }`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Guests</label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                className={`w-full px-3 py-2 text-xs font-bold border rounded-xl outline-none ${
                  theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                }`}
              >
                {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-brand-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Primary Guest Details
            </h4>

            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Full Name (as per Govt ID) *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 text-xs font-medium border rounded-xl outline-none ${
                  theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                }`}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 text-xs font-medium border rounded-xl outline-none ${
                    theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                  }`}
                />

                <input
                  type="tel"
                  placeholder="10-digit Phone *"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 text-xs font-medium border rounded-xl outline-none ${
                    theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                  }`}
                />
              </div>

              <input
                type="text"
                placeholder="Special Requests (e.g. Quiet Room, High Floor, Early Arrival)"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs font-medium border rounded-xl outline-none ${
                  theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-white focus:border-brand-500' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500'
                }`}
              />
            </div>
          </div>

          {/* Payment Type Choice */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Payment Choice
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentType('deposit')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentType === 'deposit'
                    ? (theme === 'dark' ? 'bg-brand-500/20 border-brand-500 text-white ring-1 ring-brand-500' : 'bg-brand-50 border-brand-500 text-brand-900 font-bold ring-1 ring-brand-500')
                    : (theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                }`}
              >
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 inline-block mb-1">
                  Most Popular
                </span>
                <p className="text-xs font-black">Pay 12% Deposit</p>
                <p className="text-sm font-black text-brand-500 mt-1">₹{depositAmount.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Pay ₹{balanceAtHotel.toLocaleString()} at hotel</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('full')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentType === 'full'
                    ? (theme === 'dark' ? 'bg-brand-500/20 border-brand-500 text-white ring-1 ring-brand-500' : 'bg-brand-50 border-brand-500 text-brand-900 font-bold ring-1 ring-brand-500')
                    : (theme === 'dark' ? 'bg-[#15151a] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                }`}
              >
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 inline-block mb-1">
                  100% Prepaid
                </span>
                <p className="text-xs font-black">Pay Full Online</p>
                <p className="text-sm font-black text-brand-500 mt-1">₹{grandTotal.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Zero balance at check-in</p>
              </button>
            </div>
          </div>

          {/* Pricing Breakdown Summary */}
          <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
            theme === 'dark' ? 'bg-[#15151a] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between text-slate-400">
              <span>{activeRoom.name} × {nights} Night{nights > 1 ? 's' : ''} ({roomsCount} Room)</span>
              <span className="font-bold text-slate-200">₹{roomTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxes & GST (12%)</span>
              <span className="font-bold text-slate-200">₹{taxes.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-700/50 pt-2 flex justify-between font-black text-sm">
              <span>Total Booking Value</span>
              <span className="text-brand-400">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Checkout Action Button */}
          <div className="pt-2 sticky bottom-0 bg-transparent pb-3">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Securing Reservation & Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{amountToPayNow.toLocaleString()} & Confirm Booking 💳</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 font-medium mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              256-Bit SSL Encrypted Razorpay Secure Checkout
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
