// API configuration for GetHotelStays (Next.js Compatible)
const isProd = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const envApiUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;

const API_URL = isProd 
    ? 'https://gethotelstays.com/api' 
    : (envApiUrl || `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000/api`);

// Legacy fabricated default hero images that the OLD backend used to return when
// no tour hero config was saved. These must NOT be treated as real admin banners —
// if the backend only returns these, the frontend should show "Not Available".
const LEGACY_FALLBACK_PHOTO_IDS = [
    "photo-1506461883276-594a12b11cf3",
    "photo-1512343879784-a960bf40e7f2"
];

// Sanitize a hero config response: real configured data (banners array or
// non-legacy heroImages) passes through; fabricated legacy defaults become null.
const sanitizeHeroConfig = (d: any): any => {
    if (!d || typeof d !== 'object') return null;
    if (Array.isArray(d.banners) && d.banners.length > 0) return d;
    const realHeroImages = (Array.isArray(d.heroImages) ? d.heroImages : [])
        .filter((u: string) => typeof u === 'string' && !LEGACY_FALLBACK_PHOTO_IDS.some(id => u.includes(id)));
    if (realHeroImages.length > 0) {
        return { ...d, heroImages: realHeroImages };
    }
    return null;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? (sessionStorage.getItem('token') || localStorage.getItem('token')) : null;
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), 45000) : null;

    let csrfToken = 'gethotel_csrf_token';
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/csrf-token=([^;]+)/);
        if (match) {
            csrfToken = match[1];
        } else {
            document.cookie = `csrf-token=${csrfToken}; path=/; max-age=86400`;
        }
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers as Record<string, string>),
    };

    let response: Response;
    try {
        const delimiter = endpoint.includes('?') ? '&' : '?';
        const safeEndpoint = endpoint.includes('unblock-debug') ? endpoint : `${endpoint}${delimiter}unblock-debug=1`;
        response = await fetch(`${API_URL}${safeEndpoint}`, {
            ...options,
            headers,
            signal: options.signal || controller?.signal,
        });
    } catch (err: any) {
        if (err?.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw err;
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        if (text.includes('503') || text.includes('Service Unavailable')) {
            throw new Error('Server temporarily initializing (503 Service Unavailable). Please try again in 5 seconds.');
        }
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            throw new Error(`Server connection error (${response.status}). Please check network or reload.`);
        }
        throw new Error(`Server error: ${text.slice(0, 80)}`);
    }

    if (!response.ok) {
        if (response.status === 401 && token) {
            try {
                sessionStorage.removeItem('token');
                localStorage.removeItem('token');
            } catch (e) {}
        }
        const err = new Error(data.message || data.error || 'Something went wrong') as any;
        err.status = response.status;
        err.errors = data.errors;
        err.error = data.error;
        throw err;
    }

    return data;
};

export const authApi = {
    login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    sendOTP: (userData: any) => apiFetch('/auth/send-otp', { method: 'POST', body: JSON.stringify(userData) }),
    verifyOTP: (data: { email: string; otp: string }) => apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
    googleLogin: (idToken: string) => apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
    getMe: () => apiFetch('/auth/me'),
    impersonate: (userId: number) => apiFetch(`/auth/impersonate/${userId}`, { method: 'POST' }),
    sendChangePasswordOTP: (data: { newPassword: string; confirmPassword: string }) => apiFetch('/auth/change-password/send-otp', { method: 'POST', body: JSON.stringify(data) }),
    verifyChangePasswordOTP: (otp: string) => apiFetch('/auth/change-password/verify-otp', { method: 'POST', body: JSON.stringify({ otp }) }),
    sendChangeEmailOTP: (data: { newEmail: string }) => apiFetch('/auth/change-email/send-otp', { method: 'POST', body: JSON.stringify(data) }),
    verifyChangeEmailOTP: (otp: string) => apiFetch('/auth/change-email/verify-otp', { method: 'POST', body: JSON.stringify({ otp }) }),
};

export const hotelApi = {
    getHotels: (city?: string) => apiFetch(city ? `/hotels?city=${encodeURIComponent(city)}` : '/hotels'),
    getHotel: (id: string) => apiFetch(`/hotels/${id}`),
    searchHotels: (params: any) => apiFetch(`/hotels/search?${new URLSearchParams(params).toString()}`),
    getSearchSuggestions: (query: string) => apiFetch(`/hotels/search-suggestions?query=${encodeURIComponent(query)}`),
    getMyHotels: async (params?: { light?: boolean; includeBookings?: boolean }) => {
        const query = params ? `?${new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== undefined) acc[key] = String(value);
                return acc;
            }, {} as Record<string, string>)
        ).toString()}` : '';
        const res = await apiFetch(`/hotels/my-hotels${query}`);
        const activeHotelId = typeof window !== 'undefined' ? sessionStorage.getItem('activeHotelId') : null;
        if (activeHotelId && res.success && Array.isArray(res.data)) {
            const selectedId = parseInt(activeHotelId);
            const index = res.data.findIndex((h: any) => h.id === selectedId);
            if (index !== -1) {
                const [selectedHotel] = res.data.splice(index, 1);
                res.data.unshift(selectedHotel);
            }
        }
        return res;
    },
    createHotel: (hotelData: any) => apiFetch('/hotels', { method: 'POST', body: JSON.stringify(hotelData) }),
    updateHotel: async (id: string | number, hotelData: any) => {
        // Use WAF-Bypass Top-Level Route: POST /v2-update-hotel
        return await apiFetch('/v2-update-hotel', { 
            method: 'POST', 
            body: JSON.stringify({ ...hotelData, _hotelId: id }) 
        });
    },
    deleteHotel: (id: string) => apiFetch(`/hotels/${id}`, { method: 'DELETE' }),
    createReview: (hotelId: number, reviewData: any) => apiFetch(`/hotels/${hotelId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),
    replyToReview: (hotelId: number, reviewId: number, reply: string) => apiFetch(`/hotels/${hotelId}/reviews/${reviewId}/reply`, { method: 'POST', body: JSON.stringify({ reply }) }),
    getRooms: (id: string, params?: any) => apiFetch(`/hotels/${id}/rooms${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    addRoom: (hotelId: number, roomData: any) => apiFetch(`/hotels/${hotelId}/rooms`, { method: 'POST', body: JSON.stringify(roomData) }),
    updateRoom: async (hotelId: number, roomId: number, roomData: any) => {
        // Use WAF-Bypass Top-Level Route: POST /v2-update-room
        return await apiFetch('/v2-update-room', { 
            method: 'POST', 
            body: JSON.stringify({ ...roomData, _hotelId: hotelId, _roomId: roomId }) 
        });
    },
    deleteRoom: (hotelId: number, roomId: number) => apiFetch(`/hotels/${hotelId}/rooms/${roomId}`, { method: 'DELETE' }),
    bulkUpdateRooms: (hotelId: number, rooms: any[], deleteIds: number[]) => apiFetch(`/hotels/${hotelId}/rooms/bulk`, { method: 'POST', body: JSON.stringify({ rooms, deleteIds }) }),
    getStaff: (hotelId: number) => apiFetch(`/hotels/${hotelId}/staff`),
    addStaff: (hotelId: number, staffData: any) => apiFetch(`/hotels/${hotelId}/staff`, { method: 'POST', body: JSON.stringify(staffData) }),
    removeStaff: (hotelId: number, staffId: number) => apiFetch(`/hotels/${hotelId}/staff/${staffId}`, { method: 'DELETE' }),
};

export const bookingApi = {
    createBooking: (bookingData: any) => apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
    getBookings: () => apiFetch('/bookings'),
    getMyBookings: () => apiFetch('/bookings/my-bookings'),
    getBooking: (id: string) => apiFetch(`/bookings/${id}`),
    updateBooking: (id: number, bookingData: any) => apiFetch(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(bookingData) }),
    cancelBooking: (id: number) => apiFetch(`/bookings/${id}/cancel`, { method: 'POST' }),
};

export const couponApi = {
    getCoupons: (hotelId: number) => apiFetch(`/hotels/${hotelId}/coupons`),
    createCoupon: (hotelId: number, couponData: any) => apiFetch(`/hotels/${hotelId}/coupons`, { method: 'POST', body: JSON.stringify(couponData) }),
    updateCoupon: (hotelId: number, id: number, couponData: any) => apiFetch(`/hotels/${hotelId}/coupons/${id}`, { method: 'PUT', body: JSON.stringify(couponData) }),
    toggleStatus: (hotelId: number, id: number, isActive: boolean) => apiFetch(`/hotels/${hotelId}/coupons/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    deleteCoupon: (hotelId: number, id: number) => apiFetch(`/hotels/${hotelId}/coupons/${id}`, { method: 'DELETE' }),
};

export const notificationApi = {
    getNotifications: () => apiFetch('/notifications'),
    markAsRead: (id: number) => apiFetch(`/notifications/${id}`, { method: 'PUT' }),
    markAllRead: () => apiFetch('/notifications/mark-all-read', { method: 'PUT' }),
};

export const dailyRateApi = {
    getRates: (roomId: number, startDate: string, endDate: string) => 
        apiFetch(`/daily-rates?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}`),
    updateRate: (data: any) => 
        apiFetch('/daily-rates', { method: 'POST', body: JSON.stringify(data) }),
    bulkUpdateRates: (data: any) => 
        apiFetch('/daily-rates/bulk', { method: 'POST', body: JSON.stringify(data) }),
};

export const paymentApi = {
    createOrder: (bookingId: number) => apiFetch('/payments/create-order', { method: 'POST', body: JSON.stringify({ bookingId }) }),
    verifyPayment: (paymentData: any) => apiFetch('/payments/verify', { method: 'POST', body: JSON.stringify(paymentData) }),
    fetchPaymentStatus: (bookingId: number) => apiFetch(`/payments/fetch-status/${bookingId}`, { method: 'POST' }),
};

export const partnerApi = {
    submitRequest: (data: any) => apiFetch('/partner/request', { method: 'POST', body: JSON.stringify(data) }),
};

export const adminApi = {
    getPartners: () => apiFetch('/admin/partners'),
    getUsers: () => apiFetch('/admin/users'),
    getPartnerRequests: () => apiFetch('/partner/requests'),
    approvePartnerRequest: (id: number) => apiFetch(`/partner/requests/${id}/approve`, { method: 'PUT' }),
    declinePartnerRequest: (id: number) => apiFetch(`/partner/requests/${id}/decline`, { method: 'PUT' }),
    bulkApprovePartnerRequests: (ids: number[]) => apiFetch('/partner/requests/bulk-approve', { method: 'PUT', body: JSON.stringify({ ids }) }),
    bulkDeclinePartnerRequests: (ids: number[]) => apiFetch('/partner/requests/bulk-decline', { method: 'PUT', body: JSON.stringify({ ids }) }),
    resetPartnerPassword: (id: number, password: string) => apiFetch(`/admin/partners/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),
    updatePartnerEmail: (id: number, email: string) => apiFetch(`/admin/partners/${id}/update-email`, { method: 'PUT', body: JSON.stringify({ email }) }),
    getAllHotels: () => apiFetch('/admin/hotels'),
    getAllBookings: () => apiFetch('/admin/bookings'),
    getStats: () => apiFetch('/admin/stats'),
    getAnalytics: () => apiFetch('/admin/analytics'),
    getAIChatAnalytics: (search?: string) => apiFetch(`/admin/ai-chats${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getHotelDetails: (id: string) => apiFetch(`/admin/hotels/${id}`),
    updateHotelMetrics: (id: string, data: any) => apiFetch(`/admin/hotels/${id}/metrics`, { method: 'PATCH', body: JSON.stringify(data) }),
    recalculateHotelMetrics: (id: string) => apiFetch(`/admin/hotels/${id}/recalculate`, { method: 'POST' }),
    suspendHotel: (id: string) => apiFetch(`/admin/hotels/${id}/suspend`, { method: 'PUT' }),
    deleteHotel: (id: string) => apiFetch(`/admin/hotels/${id}`, { method: 'DELETE' }),
    updateTrendingBulk: (hotelIds: number[]) => apiFetch('/admin/hotels/trending/bulk', { method: 'PUT', body: JSON.stringify({ hotelIds }) }),
    toggleTrending: (id: string) => apiFetch(`/admin/hotels/${id}/trending`, { method: 'PUT' }),
    toggleFeatured: (id: string) => apiFetch(`/admin/hotels/${id}/featured`, { method: 'PUT' }),
    updateHomepageConfig: (data: any) => apiFetch('/admin/homepage/config', { method: 'PUT', body: JSON.stringify(data) }),
    createQuickPartner: (data: any) => apiFetch('/admin/partners/quick', { method: 'POST', body: JSON.stringify(data) }),
    createBulkPartnersWithHotels: (data: any) => apiFetch('/admin/partners/bulk-with-hotels', { method: 'POST', body: JSON.stringify(data) }),
    assignHotelsToPartner: (partnerId: number, hotelIds: number[]) => apiFetch(`/admin/partners/${partnerId}/assign-hotels`, { method: 'PUT', body: JSON.stringify({ hotelIds }) }),
    createBulkHotels: (data: any) => apiFetch('/admin/hotels/bulk', { method: 'POST', body: JSON.stringify(data) }),
    getGlobalReviews: () => apiFetch('/admin/reviews'),
    deleteReview: (id: number) => apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' }),
    suggestRooms: (data: { hotelId: number; prompt?: string; url?: string; urls?: string[]; history?: { role: string; text: string }[]; existingRooms?: any[]; newAttachedImages?: string[] }, options?: RequestInit) => apiFetch('/admin/ai/suggest-rooms', { method: 'POST', body: JSON.stringify(data), ...options }),
    convertWebP: (data: { imageUrl: string }) => apiFetch('/admin/ai/convert-webp', { method: 'POST', body: JSON.stringify(data) }),
    importReviews: (data: { hotelId: number; url: string }) => apiFetch('/admin/ai/import-reviews', { method: 'POST', body: JSON.stringify(data) }),
    bulkOnboardPreview: (data: { files: { fileName: string; content: string }[] }) => apiFetch('/admin/ai/bulk-onboard-preview', { method: 'POST', body: JSON.stringify(data) }),
    bulkOnboardConfirm: (data: { hotels: any[] }) => apiFetch('/admin/ai/bulk-onboard-confirm', { method: 'POST', body: JSON.stringify(data) }),
    bulkOnboardHistory: () => apiFetch('/admin/ai/bulk-onboard-history'),
    bulkUpdatePromotions: (data: { hotelIds: number[]; code: string; discountType: string; discountValue: number; isActive: boolean; startDate?: string; endDate?: string }) => apiFetch('/admin/hotels/bulk-promotion', { method: 'POST', body: JSON.stringify(data) }),
    bulkDeletePromotions: (data: { hotelIds: number[]; code: string }) => apiFetch('/admin/hotels/bulk-delete-promotion', { method: 'POST', body: JSON.stringify(data) }),
};

export const otaApi = {
    getSettings: (hotelId: number) => apiFetch(`/ota/key/${hotelId}`),
    generateKey: (hotelId: number, data: any) => apiFetch(`/ota/key/${hotelId}`, { method: 'POST', body: JSON.stringify(data) }),
};

export const analyticsApi = {
    ping: (page: string) => apiFetch('/analytics/ping', { method: 'POST', body: JSON.stringify({ page }) })
};

export const aiApi = {
    chat: (messages: { role: string; content: string }[]) =>
        apiFetch('/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) }),
};

export const homepageApi = {
    getConfig: async () => {
        try {
            return await apiFetch('/homepage/config');
        } catch (error) {
            return { success: true, data: {} };
        }
    },
    getTrendingHotels: async (city?: string, stayType?: string) => {
        try {
            const params = new URLSearchParams();
            if (city) params.append('city', city);
            if (stayType) params.append('stayType', stayType);
            const query = params.toString() ? `?${params.toString()}` : '';
            return await apiFetch(`/hotels/trending${query}`);
        } catch (error) {
            const params = new URLSearchParams();
            if (city) params.append('city', city);
            if (stayType) params.append('stayType', stayType);
            const query = params.toString() ? `?${params.toString()}` : '';
            
            const fallback = city
                ? await apiFetch(`/hotels/search${query}`)
                : await apiFetch(`/hotels${query}`);

            return {
                ...fallback,
                detectedCity: null,
                isLocalized: false
            };
        }
    }
};

export const messageApi = {
    sendMessage: (messageData: { hotelId: number; content: string }) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(messageData) }),
    getHotelMessages: (hotelId: number) => apiFetch(`/messages/hotel/${hotelId}`),
    getMyMessages: () => apiFetch('/messages/my-messages'),
};

export const packageApi = {
    getPackages: (params?: any) => apiFetch(`/packages${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    getPackage: (idOrSlug: string) => apiFetch(`/packages/${idOrSlug}`),
    createPackage: async (data: any) => {
        return await apiFetch('/packages', { method: 'POST', body: JSON.stringify(data) });
    },
    updatePackage: async (id: string | number, data: any) => {
        return await apiFetch(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deletePackage: async (id: string | number) => {
        return await apiFetch(`/packages/${id}`, { method: 'DELETE' });
    },
    uploadImage: async (imageBase64: string) => {
        return await apiFetch('/packages/upload-image', { method: 'POST', body: JSON.stringify({ image: imageBase64 }) });
    },
    importJson: async (payload: { jsonText?: string; packages?: any[]; products?: any[]; tours?: any[]; defaultPrice?: number; defaultBadge?: string }) => {
        return await apiFetch('/packages/import-json', { method: 'POST', body: JSON.stringify(payload) });
    },
    getHeroConfig: async () => {
        return await apiFetch('/packages/hero-config');
    },
    updateHeroConfig: async (data: any) => {
        if (data && data.banners) {
            try { localStorage.setItem("ghs_admin_tour_banners", JSON.stringify(data.banners)); } catch (e) { /* quota */ }
        }
        try { localStorage.setItem("ghs_admin_tour_hero_config", JSON.stringify(data)); } catch (e) { /* quota */ }
        try { localStorage.setItem("ghs_tour_banners_v2", "1"); } catch (e) { /* quota */ }

        let lastError: string = "Unknown error while saving hero config";
        try {
            const res = await apiFetch('/packages/hero-config', { method: 'PUT', body: JSON.stringify(data) });
            if (res && res.success) return res;
            if (res && res.message) lastError = res.message;
        } catch (e: any) {
            lastError = e?.message || lastError;
            if (e?.status === 401) {
                lastError = 'Session expired — please login again and publish';
            }
        }

        try {
            const res = await apiFetch('/admin/homepage/config', {
                method: 'PUT',
                body: JSON.stringify({ key: 'tour_hero_config', value: JSON.stringify(data) })
            });
            if (res && res.success) {
                return { success: true, message: "Hero config updated" };
            }
            if (res && res.message) lastError = res.message;
        } catch (e: any) {
            lastError = e?.message || lastError;
            if (e?.status === 401) {
                lastError = 'Session expired — please login again and publish';
            }
        }

        console.error("updateHeroConfig failed:", lastError);
        return { success: false, message: `Hero config sync failed: ${lastError}` };
    },
};

export const hotelImporterApi = {
    getStats: () => apiFetch('/admin/importer/stats'),
    getHotels: (params?: { page?: number; limit?: number; since?: string; city?: string }) => {
        const query = params ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, String(v)])).toString() : '';
        return apiFetch(`/admin/importer/hotels${query}`);
    },
    importHotels: (payload: { hotelIds?: string[]; hotelsToImport?: any[] }) => apiFetch('/admin/importer/import', { method: 'POST', body: JSON.stringify(payload) }),
    deleteHotel: (id: string) => apiFetch(`/admin/importer/scraped-hotel/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    syncHotels: (since?: string) => apiFetch('/admin/importer/sync', { method: 'POST', body: JSON.stringify({ since }) }),
    verifyPairing: (data: { agentUrl?: string; pairingCode?: string }) => apiFetch('/admin/importer/verify-pairing', { method: 'POST', body: JSON.stringify(data) }),
};


