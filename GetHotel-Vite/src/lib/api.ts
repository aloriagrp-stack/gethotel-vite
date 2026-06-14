// API configuration for GetHotelStays - Force refresh
const API_URL = import.meta.env.MODE === 'production' 
    ? 'https://gethotelstays.com/api' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? (sessionStorage.getItem('token') || localStorage.getItem('token')) : null;
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), 45000) : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    let response: Response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, {
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
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
    }

    if (!response.ok) {
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
    getHotels: () => apiFetch('/hotels'),
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
    updateHotel: (id: string, hotelData: any) => apiFetch(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(hotelData) }),
    deleteHotel: (id: string) => apiFetch(`/hotels/${id}`, { method: 'DELETE' }),
    createReview: (hotelId: number, reviewData: any) => apiFetch(`/hotels/${hotelId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),
    replyToReview: (hotelId: number, reviewId: number, reply: string) => apiFetch(`/hotels/${hotelId}/reviews/${reviewId}/reply`, { method: 'POST', body: JSON.stringify({ reply }) }),
    getRooms: (id: string, params?: any) => apiFetch(`/hotels/${id}/rooms${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    addRoom: (hotelId: number, roomData: any) => apiFetch(`/hotels/${hotelId}/rooms`, { method: 'POST', body: JSON.stringify(roomData) }),
    updateRoom: (hotelId: number, roomId: number, roomData: any) => apiFetch(`/hotels/${hotelId}/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(roomData) }),
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
    getAllHotels: () => apiFetch('/admin/hotels'),
    getAllBookings: () => apiFetch('/admin/bookings'),
    getStats: () => apiFetch('/admin/stats'),
    getAnalytics: () => apiFetch('/admin/analytics'),
    getHotelDetails: (id: string) => apiFetch(`/admin/hotels/${id}`),
    updateHotelMetrics: (id: string, data: any) => apiFetch(`/admin/hotels/${id}/metrics`, { method: 'PATCH', body: JSON.stringify(data) }),
    recalculateHotelMetrics: (id: string) => apiFetch(`/admin/hotels/${id}/recalculate`, { method: 'POST' }),
    suspendHotel: (id: string) => apiFetch(`/admin/hotels/${id}/suspend`, { method: 'PUT' }),
    deleteHotel: (id: string) => apiFetch(`/admin/hotels/${id}`, { method: 'DELETE' }),
    toggleTrending: (id: string) => apiFetch(`/admin/hotels/${id}/trending`, { method: 'PUT' }),
    toggleFeatured: (id: string) => apiFetch(`/admin/hotels/${id}/featured`, { method: 'PUT' }),
    updateHomepageConfig: (data: any) => apiFetch('/admin/homepage/config', { method: 'PUT', body: JSON.stringify(data) }),
    createQuickPartner: (data: any) => apiFetch('/admin/partners/quick', { method: 'POST', body: JSON.stringify(data) }),
    assignHotelsToPartner: (partnerId: number, hotelIds: number[]) => apiFetch(`/admin/partners/${partnerId}/assign-hotels`, { method: 'PUT', body: JSON.stringify({ hotelIds }) }),
    createBulkHotels: (data: any) => apiFetch('/admin/hotels/bulk', { method: 'POST', body: JSON.stringify(data) }),
    getGlobalReviews: () => apiFetch('/admin/reviews'),
    deleteReview: (id: number) => apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' }),
    getRoomsOverview: () => apiFetch('/admin/rooms-overview'),
    importOtaRooms: (data: { hotelId: number; otaUrl?: string; otaUrls?: string[]; syncMode?: "full" | "rooms" | "prices"; syncGroup?: boolean }) => apiFetch('/admin/rooms/import-ota', { method: 'POST', body: JSON.stringify(data) }),
    suggestRooms: (data: { hotelId: number; prompt?: string; url?: string; history?: { role: string; text: string }[] }) => apiFetch('/admin/ai/suggest-rooms', { method: 'POST', body: JSON.stringify(data) }),
};

export const otaApi = {
    getSettings: (hotelId: number) => apiFetch(`/ota/key/${hotelId}`),
    generateKey: (hotelId: number, data: any) => apiFetch(`/ota/key/${hotelId}`, { method: 'POST', body: JSON.stringify(data) }),
};

export const analyticsApi = {
    ping: (page: string) => apiFetch('/analytics/ping', { method: 'POST', body: JSON.stringify({ page }) })
};

export const homepageApi = {
    getConfig: async () => {
        try {
            return await apiFetch('/homepage/config');
        } catch (error) {
            return { success: true, data: {} };
        }
    },
    getTrendingHotels: async (city?: string) => {
        try {
            return await apiFetch(`/hotels/trending${city ? `?city=${encodeURIComponent(city)}` : ''}`);
        } catch (error) {
            const fallback = city
                ? await apiFetch(`/hotels/search?city=${encodeURIComponent(city)}`)
                : await apiFetch('/hotels');

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
