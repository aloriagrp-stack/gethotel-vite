import { useState, useEffect, useMemo } from 'react';
import { X, ShieldCheck, CreditCard, AlertCircle, Loader, Building2 } from 'lucide-react';
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

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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
      const nameParts = guestName.trim().split(' ');
      const firstName = nameParts[0] || guestName.trim();
      const lastName = nameParts.slice(1).join(' ') || 'Guest';

      const bookingPayload = {
        hotelId: hotel.id,
        rooms: [{
          id: activeRoom.id || selectedRoomId || 1,
          roomId: activeRoom.id || selectedRoomId || 1,
          count: roomsCount,
          quantity: roomsCount,
          price: basePrice
        }],
        checkIn,
        checkOut,
        totalGuests: guestsCount,
        guestInfo: {
          fullName: guestName.trim(),
          firstName,
          lastName,
          email: guestEmail.trim(),
          phone: guestPhone.trim(),
          specialRequests: "Booked via ChatGHS"
        },
        stayType: 'standard',
        paymentStatus: paymentType === 'full' ? 'paid' : 'partial'
      };

      const bookingRes = await bookingApi.createBooking(bookingPayload);
      const bookingData = bookingRes.booking || bookingRes.data;
      if (!bookingRes.success || !bookingData?.id) {
        throw new Error(bookingRes.message || 'Failed to initialize booking.');
      }

      const bookingId = bookingData.id;

      // 2. Create Razorpay Order
      const orderRes = await paymentApi.createOrder(bookingId);
      const orderId = orderRes.orderId || orderRes.order?.id || orderRes.id;
      const orderAmount = orderRes.amount || orderRes.order?.amount;

      if (!orderRes.success || !orderId) {
        throw new Error(orderRes.message || 'Failed to generate online payment order.');
      }

      const razorpayKey = orderRes.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_T16NuPtvvs9cRV';

      // 3. Open Razorpay Checkout Modal
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh the page.');
      }

      const rzpOptions = {
        key: razorpayKey,
        amount: orderAmount,
        currency: orderRes.currency || orderRes.order?.currency || 'INR',
        name: 'GetHotelStays',
        description: `${hotel.name} (${nights} Night${nights > 1 ? 's' : ''})`,
        image: 'https://gethotelstays.com/logo.png',
        order_id: orderId,
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
            setErrorMessage('Payment window closed. Tap below to retry.');
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
            setErrorMessage(verifyErr.message || 'Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        setErrorMessage(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      console.error('[InChatBookingDrawer Payment Error]:', err);
      setErrorMessage(err.message || 'Something went wrong during payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-xl animate-backdrop-smooth">
      <div
        className={`w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-drawer-spring ${
          theme === 'dark' ? 'bg-[#0B0B0E] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Minimal Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-[#101014]">
          <div>
            <h3 className="text-sm font-extrabold leading-tight text-white">Quick Reserve</h3>
            <p className="text-[11px] text-zinc-400">Instant confirmation via Razorpay</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-zinc-700/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Minimal Content */}
        <form onSubmit={handlePayAndBook} className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 bg-[#0B0B0E]">
          {/* Hotel & Room Single-Row Summary */}
          <div className="p-2.5 rounded-2xl bg-[#14141A] border border-zinc-800 flex items-center gap-3">
            {hotel.thumbnail ? (
              <img src={hotel.thumbnail} alt={hotel.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold truncate text-white">{hotel.name}</h4>
              <p className="text-[11px] text-zinc-400 truncate">
                {activeRoom.name} • 📍 {hotel.city}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-blue-400">₹{basePrice.toLocaleString()}</span>
              <span className="text-[9px] text-zinc-400 block">/night</span>
            </div>
          </div>

          {/* Room Selector if multiple exist */}
          {availableRooms.length > 1 && (
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Room Category
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {availableRooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoomId(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      selectedRoomId === r.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-[#14141A] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {r.name} (₹{r.pricePerNight?.toLocaleString()})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dates & Guests Compact 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Check-in</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#14141A] border border-zinc-800 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Check-out</label>
              <input
                type="date"
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#14141A] border border-zinc-800 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Rooms</label>
              <select
                value={roomsCount}
                onChange={(e) => setRoomsCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#14141A] border border-zinc-800 text-white outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Guests</label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#14141A] border border-zinc-800 text-white outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 6, 8].map((n) => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Minimal Inputs */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Guest Information</label>
            <input
              type="text"
              placeholder="Full Name *"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#14141A] border border-zinc-800 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="10-digit Mobile *"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#14141A] border border-zinc-800 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#14141A] border border-zinc-800 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Choice Toggle (2-Pill Segment) */}
          <div className="pt-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Payment Option</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('deposit')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentType === 'deposit'
                    ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-[#14141A] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-[10px] font-bold text-amber-400">12% Deposit</div>
                <div className="text-xs font-black text-white mt-0.5">₹{depositAmount.toLocaleString()}</div>
                <div className="text-[9px] text-zinc-400">Pay ₹{balanceAtHotel.toLocaleString()} at stay</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('full')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentType === 'full'
                    ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-[#14141A] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-[10px] font-bold text-emerald-400">100% Full</div>
                <div className="text-xs font-black text-white mt-0.5">₹{grandTotal.toLocaleString()}</div>
                <div className="text-[9px] text-zinc-400">Zero check-in hassle</div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Opening Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{amountToPayNow.toLocaleString()} & Confirm Booking</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted Razorpay Checkout</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
