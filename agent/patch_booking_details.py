import os

# 1. Patch BookingDetails.tsx
bd_path = 'gethotel-next/src/pages-legacy/BookingDetails.tsx'
with open(bd_path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('\r\n', '\n')

old_calc = """    const totalPriceVal = booking?.totalPrice || (isTour ? 19998 : 0);
    const amountPaidVal = booking ? (booking.amountPaid ?? (isTour ? totalPriceVal : 0)) : 0;
    const payAtHotelVal = isTour ? 0 : Math.max(0, totalPriceVal - amountPaidVal);
    const paymentStatus = isTour ? 'paid' : (booking?.paymentStatus || (amountPaidVal === 0 ? 'pending' : (amountPaidVal >= totalPriceVal ? 'paid' : 'partial')));"""

new_calc = """    const isPayAtHotel = booking?.paymentMode === 'pay_at_hotel' || 
                         booking?.internalNotes?.includes('PAY_AT_HOTEL') || 
                         (!isTour && booking?.status === 'confirmed' && booking?.paymentStatus === 'pending' && !booking?.internalNotes?.includes('ONLINE'));
    const isHeld = !isTour && (booking?.status === 'held');
    const totalPriceVal = booking?.totalPrice || (isTour ? 19998 : 0);
    const amountPaidVal = booking ? (booking.amountPaid ?? (isTour ? totalPriceVal : 0)) : 0;
    const payAtHotelVal = isTour || isHeld ? 0 : (isPayAtHotel ? totalPriceVal : Math.max(0, totalPriceVal - amountPaidVal));
    const paymentStatus = isTour ? 'paid' : (booking?.paymentStatus || (amountPaidVal === 0 ? 'pending' : (amountPaidVal >= totalPriceVal ? 'paid' : 'partial')));"""

assert old_calc in c, "old_calc not found"
c = c.replace(old_calc, new_calc, 1)

old_header_badges = """                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                                isTour ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-brand-50 text-brand-600 border-brand-100'
                            }`}>
                                {isTour ? `Tour ${status}` : `Reservation ${status}`}
                            </span>
                            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border bg-emerald-50 text-emerald-700 border-emerald-100">
                                {isTour ? 'Fully Paid (All-Inclusive)' : (paymentStatus === 'paid' ? 'Fully Paid' : paymentStatus === 'partial' ? '12% Deposit Paid' : 'Pay At Hotel')}
                            </span>"""

new_header_badges = """                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                                isTour ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                isHeld ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-brand-50 text-brand-600 border-brand-100'
                            }`}>
                                {isTour ? `Tour ${status}` : isHeld ? 'Reservation Held (Awaiting Payment)' : `Reservation ${status}`}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                                isTour ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                isHeld ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                isPayAtHotel ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                                {isTour ? 'Fully Paid (All-Inclusive)' : 
                                 isHeld ? 'Payment Pending (Online)' :
                                 paymentStatus === 'paid' ? 'Fully Paid' : 
                                 paymentStatus === 'partial' ? '12% Deposit Paid' : 
                                 isPayAtHotel ? 'Pay At Hotel' : 
                                 'Payment Incomplete'}
                            </span>"""

assert old_header_badges in c, "old_header_badges not found"
c = c.replace(old_header_badges, new_header_badges, 1)

old_voucher_badge = """                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded border border-emerald-100">
                                {isTour ? 'Fully Paid (All-Inclusive)' : (paymentStatus === 'paid' ? 'Fully Paid' : paymentStatus === 'partial' ? '12% Deposit Paid' : 'Pay At Hotel')}
                            </span>"""

new_voucher_badge = """                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded border border-emerald-100">
                                {isTour ? 'Fully Paid (All-Inclusive)' : 
                                 isHeld ? 'Payment Pending (Online)' :
                                 (paymentStatus === 'paid' ? 'Fully Paid' : paymentStatus === 'partial' ? '12% Deposit Paid' : isPayAtHotel ? 'Pay At Hotel' : 'Pending')}
                            </span>"""

assert old_voucher_badge in c, "old_voucher_badge not found"
c = c.replace(old_voucher_badge, new_voucher_badge, 1)

with open(bd_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('BookingDetails.tsx patched successfully!')

# 2. Patch BookingInvoice.tsx
bi_path = 'gethotel-next/src/pages-legacy/BookingInvoice.tsx'
with open(bi_path, 'r', encoding='utf-8') as f:
    c_bi = f.read()

c_bi = c_bi.replace('\r\n', '\n')

old_bi = """                        <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${
                            booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            booking.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            {booking.paymentStatus === 'paid' ? 'Fully Paid' :
                             booking.paymentStatus === 'partial' ? '12% Deposit Paid' :
                             'Pay At Hotel'}
                        </span>"""

new_bi = """                        {(() => {
                            const isPayAtHotel = booking.paymentMode === 'pay_at_hotel' || 
                                                 booking.internalNotes?.includes('PAY_AT_HOTEL') || 
                                                 (booking.status === 'confirmed' && booking.paymentStatus === 'pending' && !booking.internalNotes?.includes('ONLINE'));
                            return (
                                <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${
                                    booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    booking.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    isPayAtHotel ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                    {booking.paymentStatus === 'paid' ? 'Fully Paid' :
                                     booking.paymentStatus === 'partial' ? '12% Deposit Paid' :
                                     isPayAtHotel ? 'Pay At Hotel' :
                                     'Online Payment Pending'}
                                </span>
                            );
                        })()}"""

assert old_bi in c_bi, "old_bi not found"
c_bi = c_bi.replace(old_bi, new_bi, 1)

with open(bi_path, 'w', encoding='utf-8') as f:
    f.write(c_bi)

print('BookingInvoice.tsx patched successfully!')
