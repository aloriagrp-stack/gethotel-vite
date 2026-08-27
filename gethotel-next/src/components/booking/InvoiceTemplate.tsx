'use client';
import React from 'react';
import { formatPrice, formatDate } from "@/lib/utils";
import { MapPin, Calendar, User, CreditCard, ShieldCheck } from "lucide-react";

interface InvoiceProps {
    booking: any;
}

export const InvoiceTemplate = ({ booking }: InvoiceProps) => {
    if (!booking) return null;

    const { hotel, room, guestFirstName, guestLastName, guestEmail, guestPhone, checkIn, checkOut, totalPrice, amountPaid } = booking;
    const payAtHotel = totalPrice - amountPaid;
    const bookingId = `#GH-${Math.floor(Math.random() * 90000) + 10000}`;

    return (
        <div id="invoice-capture" className="bg-white p-12 max-w-4xl mx-auto border border-slate-100 shadow-2xl rounded-3xl my-10 font-sans text-slate-900">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-10 mb-10">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">GetHotel<span className="text-blue-600">.</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Official Booking Receipt</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{bookingId}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Date: {formatDate(new Date().toISOString())}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                {/* Hotel Details */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Property Details</p>
                    <div>
                        <h2 className="text-xl font-black italic uppercase text-slate-900">{hotel?.name}</h2>
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <MapPin className="w-3 h-3" />
                            <p className="text-xs font-bold">{hotel?.address}, {hotel?.city}</p>
                        </div>
                    </div>
                </div>

                {/* Guest Details */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Guest Information</p>
                    <div>
                        <h2 className="text-xl font-black italic uppercase text-slate-900">{guestFirstName} {guestLastName}</h2>
                        <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-2 text-slate-500">
                                <User className="w-3 h-3" />
                                <p className="text-xs font-bold">{guestPhone}</p>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <ShieldCheck className="w-3 h-3" />
                                <p className="text-xs font-bold">{guestEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stay Details Table */}
            <div className="bg-slate-50 rounded-2xl p-8 mb-12 border border-slate-100">
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-in</p>
                        <p className="text-sm font-black text-slate-900 italic">{formatDate(checkIn)}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">From 02:00 PM</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-out</p>
                        <p className="text-sm font-black text-slate-900 italic">{formatDate(checkOut)}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Before 11:00 AM</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stay Details</p>
                        <p className="text-sm font-black text-slate-900 italic">{room?.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Luxury Accommodation</p>
                    </div>
                </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Base Amount</span>
                    <span className="font-black text-slate-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-6">
                    <span className="text-slate-900 font-black uppercase tracking-widest italic text-lg">Total Amount</span>
                    <span className="text-2xl font-black text-slate-950 italic">{formatPrice(totalPrice)}</span>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Paid Online (Verified)</p>
                        <p className="text-2xl font-black text-emerald-700 italic">{formatPrice(amountPaid)}</p>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Pay at Hotel (Balance)</p>
                        <p className="text-2xl font-black text-blue-700 italic">{formatPrice(payAtHotel)}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-10 border-t border-slate-100 text-center space-y-4">
                <div className="flex justify-center gap-8">
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Certified Stay</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Secure Payment</span>
                    </div>
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-20">
                    This is a computer-generated receipt and does not require a physical signature. 
                    Please present this at the time of check-in for a seamless experience.
                </p>
                <div className="mt-8">
                    <p className="text-[10px] font-black text-slate-900 uppercase italic">Enjoy your stay with GetHotel.</p>
                </div>
            </div>
        </div>
    );
};
