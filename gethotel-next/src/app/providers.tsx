'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { StayModeProvider } from '@/context/StayModeContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { CartProvider } from '@/context/CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <BookingProvider>
                <WishlistProvider>
                    <StayModeProvider>
                        <LocaleProvider>
                            <CartProvider>
                                <Suspense fallback={null}>
                                    {children}
                                </Suspense>
                            </CartProvider>
                        </LocaleProvider>
                    </StayModeProvider>
                </WishlistProvider>
            </BookingProvider>
        </AuthProvider>
    );
}
