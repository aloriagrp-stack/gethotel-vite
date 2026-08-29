import { memo } from 'react';
import { CheckCircle2, Building, Calendar, User, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react';

export interface BookingConfirmationDetails {
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
}

interface Props {
  details: BookingConfirmationDetails;
  theme?: 'light' | 'dark';
}

const BookingConfirmationCard = memo(function BookingConfirmationCard({ details, theme = 'light' }: Props) {
  const voucherUrl = `https://gethotelstays.com/en/booking/details/${details.bookingId}`;
  const whatsappUrl = `https://wa.me/919318485680?text=${encodeURIComponent(
    `Hello GetHotelStays, I have confirmed Booking ID: GHS-BK-${details.bookingId} for ${details.hotelName}. Please share check-in voucher details.`
  )}`;

  return (
    <div
      className={`my-3 p-5 rounded-3xl border shadow-xl transition-all max-w-xl animate-fade-in ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-[#161f18] to-[#0f1410] border-emerald-500/30 text-slate-100'
          : 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-200 text-slate-900'
      }`}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Payment Received • Guaranteed
              </span>
            </div>
            <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              Reservation Confirmed!
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Booking ID</span>
          <span className="text-xs font-black tracking-wider text-brand-500">
            GHS-BK-{details.bookingId}
          </span>
        </div>
      </div>

      {/* Hotel & Stay Information */}
      <div className="py-4 space-y-3">
        <div>
          <h4 className="text-sm font-black flex items-center gap-1.5">
            <Building className="w-4 h-4 text-brand-500 shrink-0" />
            {details.hotelName}
          </h4>
          <p className="text-xs text-slate-400 font-medium pl-5.5">{details.hotelCity} • {details.roomName}</p>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className={`p-3 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#141815] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <Calendar className="w-3 h-3" /> Check-in & Out
            </div>
            <p className="text-xs font-black mt-1">
              {details.checkIn} → {details.checkOut}
            </p>
            <span className="text-[10px] text-slate-400">({details.nights} Night{details.nights > 1 ? 's' : ''}, {details.totalGuests} Guests)</span>
          </div>

          <div className={`p-3 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#141815] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <User className="w-3 h-3" /> Guest Details
            </div>
            <p className="text-xs font-black mt-1 truncate">{details.guestName}</p>
            <span className="text-[10px] text-slate-400 truncate block">{details.guestPhone}</span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {details.paymentType === 'deposit' ? '12% Online Deposit Paid' : '100% Full Payment Paid'}
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              ₹{details.paidAmount?.toLocaleString()}
            </span>
          </div>

          {details.balanceAmount > 0 ? (
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payable at Hotel Check-in
              </span>
              <span className="text-xs font-extrabold text-amber-500">
                ₹{details.balanceAmount?.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> All Clear
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Zero balance at desk
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        <a
          href={voucherUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
        >
          <span>View Online Voucher</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Concierge</span>
        </a>
      </div>
    </div>
  );
});

export default BookingConfirmationCard;
