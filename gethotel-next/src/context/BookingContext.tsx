

'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: "Confirmed" | "Checked-in" | "Paid" | "Cancelled" | "Awaiting";
  amount: string;
  timestamp: number;
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "timestamp">) => void;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Initial mock data if empty
  useEffect(() => {
    const saved = localStorage.getItem("gethotel_bookings");
    if (saved) {
      setBookings(JSON.parse(saved));
    } else {
      const initial = [
        { 
            id: "BK-8402", 
            hotelId: "3", 
            hotelName: "Backwaters Villa", 
            guestName: "Shriyansh S.", 
            roomType: "Executive Suite", 
            status: "Checked-in" as const, 
            checkIn: "May 15", 
            checkOut: "May 18", 
            amount: "₹42,000",
            timestamp: Date.now() - 86400000 
        },
        { 
            id: "BK-9120", 
            hotelId: "3", 
            hotelName: "Backwaters Villa", 
            guestName: "Ananya R.", 
            roomType: "Deluxe Room", 
            status: "Paid" as const, 
            checkIn: "May 20", 
            checkOut: "May 22", 
            amount: "₹18,500",
            timestamp: Date.now() - 43200000 
        }
      ];
      setBookings(initial);
      localStorage.setItem("gethotel_bookings", JSON.stringify(initial));
    }
  }, []);

  const addBooking = (newBooking: Omit<Booking, "id" | "timestamp">) => {
    const booking: Booking = {
      ...newBooking,
      id: `BK-${Math.floor(Math.random() * 90000) + 10000}`,
      timestamp: Date.now(),
    };
    const updated = [booking, ...bookings];
    setBookings(updated);
    localStorage.setItem("gethotel_bookings", JSON.stringify(updated));
  };

  const updateBookingStatus = (id: string, status: Booking["status"]) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(updated);
    localStorage.setItem("gethotel_bookings", JSON.stringify(updated));
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBookingStatus }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBookings must be used within BookingProvider");
  return context;
};



