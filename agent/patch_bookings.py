import os

# 1. Patch MyBookings.tsx
mb_path = 'gethotel-next/src/pages-legacy/MyBookings.tsx'
with open(mb_path, 'r', encoding='utf-8') as f:
    c = f.read()

# Normalize line endings in memory to \n
c = c.replace('\r\n', '\n')

old_filter = """        const status = (b.status || "").toLowerCase();

        if (activeTab === "cancelled") {
            return status === 'cancelled' || status === 'failed';
        }

        if (status === 'cancelled' || status === 'failed') return false;"""

new_filter = """        const status = (b.status || "").toLowerCase();
        const isHoldExpired = status === 'held' && b.holdExpiresAt && new Date(b.holdExpiresAt) < new Date();

        if (activeTab === "cancelled") {
            return status === 'cancelled' || status === 'failed' || isHoldExpired;
        }

        if (status === 'cancelled' || status === 'failed' || isHoldExpired) return false;"""

assert old_filter in c, "old_filter not found"
c = c.replace(old_filter, new_filter, 1)

old_badge = """                                                        if (isCompleted) {
                                                            badgeClass = "bg-emerald-500/90 border-emerald-400 text-white";
                                                            dotClass = "bg-white";
                                                            label = "Completed";
                                                        } else if (isConfirmedOrPaid) {
                                                            badgeClass = "bg-emerald-500/90 border-emerald-400 text-white";
                                                            dotClass = s === 'paid' ? 'bg-white animate-pulse' : 'bg-white';
                                                        } else if (isCancelledOrFailed) {
                                                            badgeClass = "bg-red-500/90 border-red-400 text-white";
                                                            dotClass = "bg-white";
                                                        }"""

new_badge = """                                                        const isHeld = s === 'held';
                                                        if (isCompleted) {
                                                            badgeClass = "bg-emerald-500/90 border-emerald-400 text-white";
                                                            dotClass = "bg-white";
                                                            label = "Completed";
                                                        } else if (isConfirmedOrPaid) {
                                                            badgeClass = "bg-emerald-500/90 border-emerald-400 text-white";
                                                            dotClass = s === 'paid' ? 'bg-white animate-pulse' : 'bg-white';
                                                        } else if (isHeld) {
                                                            badgeClass = "bg-amber-500/90 border-amber-400 text-white";
                                                            dotClass = "bg-white animate-pulse";
                                                            label = "Payment Pending";
                                                        } else if (isCancelledOrFailed) {
                                                            badgeClass = "bg-red-500/90 border-red-400 text-white";
                                                            dotClass = "bg-white";
                                                        }"""

assert old_badge in c, "old_badge not found"
c = c.replace(old_badge, new_badge, 1)

old_ps = """                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
                                                            <div className={cn(
                                                                "px-3 py-1 rounded-lg inline-block text-[9px] font-black uppercase tracking-widest",
                                                                booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                                booking.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-600' :
                                                                'bg-amber-50 text-amber-600'
                                                            )}>
                                                                {booking.paymentStatus === 'paid' ? 'Fully Paid' :
                                                                 booking.paymentStatus === 'partial' ? '12% Paid' :
                                                                 'Pay At Hotel'}
                                                            </div>
                                                        </div>"""

new_ps = """                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
                                                            {(() => {
                                                                const isPayAtHotel = booking.paymentMode === 'pay_at_hotel' ||
                                                                                     booking.internalNotes?.includes('PAY_AT_HOTEL') ||
                                                                                     (booking.status === 'confirmed' && booking.paymentStatus === 'pending' && !booking.internalNotes?.includes('ONLINE'));
                                                                return (
                                                                    <div className={cn(
                                                                        "px-3 py-1 rounded-lg inline-block text-[9px] font-black uppercase tracking-widest",
                                                                        booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                                        booking.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-600' :
                                                                        isPayAtHotel ? 'bg-purple-50 text-purple-700 border border-purple-200/60' :
                                                                        'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                                    )}>
                                                                        {booking.paymentStatus === 'paid' ? 'Fully Paid' :
                                                                         booking.paymentStatus === 'partial' ? '12% Paid' :
                                                                         isPayAtHotel ? 'Pay At Hotel' :
                                                                         'Online Payment Pending'}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>"""

assert old_ps in c, "old_ps not found"
c = c.replace(old_ps, new_ps, 1)

old_btn = """                                                        <Link
                                                            to={`/booking/details/${booking.id}`}
                                                            className="px-5 sm:px-8 py-3.5 sm:py-4 bg-slate-950 text-white rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                                        >
                                                            <Ticket className="w-4 h-4" /> View Receipt
                                                        </Link>"""

new_btn = """                                                        {booking.status === 'held' ? (
                                                            <Link
                                                                to={`/booking/details/${booking.id}`}
                                                                className="px-5 sm:px-8 py-3.5 sm:py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-amber-200 flex items-center justify-center gap-2"
                                                            >
                                                                <CreditCard className="w-4 h-4" /> Complete Payment
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                to={`/booking/details/${booking.id}`}
                                                                className="px-5 sm:px-8 py-3.5 sm:py-4 bg-slate-950 text-white rounded-xl sm:rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                                            >
                                                                <Ticket className="w-4 h-4" /> View Receipt
                                                            </Link>
                                                        )}"""

assert old_btn in c, "old_btn not found"
c = c.replace(old_btn, new_btn, 1)

with open(mb_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('MyBookings.tsx patched successfully!')
