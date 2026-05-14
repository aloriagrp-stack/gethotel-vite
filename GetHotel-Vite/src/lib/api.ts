// API configuration for GetHotelStays - Force refresh
const API_URL = import.meta.env.MODE === 'production' 
    ? 'https://gethotelstays.com/api' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
    }

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

export const authApi = {
    login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    googleLogin: (idToken: string) => apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
    getMe: () => apiFetch('/auth/me'),
    impersonate: (userId: number) => apiFetch(`/auth/impersonate/${userId}`, { method: 'POST' }),
};

export const hotelApi = {
    getHotels: () => apiFetch('/hotels'),
    getHotel: (id: string) => apiFetch(`/hotels/${id}`),
    searchHotels: (params: any) => apiFetch(`/hotels/search?${new URLSearchParams(params).toString()}`),
    getMyHotels: () => apiFetch('/hotels/my-hotels'),
    createHotel: (hotelData: any) => apiFetch('/hotels', { method: 'POST', body: JSON.stringify(hotelData) }),
    updateHotel: (id: string, hotelData: any) => apiFetch(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(hotelData) }),
    deleteHotel: (id: string) => apiFetch(`/hotels/${id}`, { method: 'DELETE' }),
    createReview: (hotelId: number, reviewData: any) => apiFetch(`/hotels/${hotelId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),
    replyToReview: (hotelId: number, reviewId: number, reply: string) => apiFetch(`/hotels/${hotelId}/reviews/${reviewId}/reply`, { method: 'POST', body: JSON.stringify({ reply }) }),
    getRooms: (id: string) => apiFetch(`/hotels/${id}/rooms`),
    addRoom: (hotelId: number, roomData: any) => apiFetch(`/hotels/${hotelId}/rooms`, { method: 'POST', body: JSON.stringify(roomData) }),
    updateRoom: (hotelId: number, roomId: number, roomData: any) => apiFetch(`/hotels/${hotelId}/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(roomData) }),
    deleteRoom: (hotelId: number, roomId: number) => apiFetch(`/hotels/${hotelId}/rooms/${roomId}`, { method: 'DELETE' }),
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
};

export const partnerApi = {
    submitRequest: (data: any) => apiFetch('/partner/request', { method: 'POST', body: JSON.stringify(data) }),
};

export const adminApi = {
    getPartners: () => apiFetch('/admin/partners'),
    getPartnerRequests: () => apiFetch('/partner/requests'),
    approvePartnerRequest: (id: number) => apiFetch(`/partner/requests/${id}/approve`, { method: 'PUT' }),
    declinePartnerRequest: (id: number) => apiFetch(`/partner/requests/${id}/decline`, { method: 'PUT' }),
    bulkApprovePartnerRequests: (ids: number[]) => apiFetch('/partner/requests/bulk-approve', { method: 'PUT', body: JSON.stringify({ ids }) }),
    bulkDeclinePartnerRequests: (ids: number[]) => apiFetch('/partner/requests/bulk-decline', { method: 'PUT', body: JSON.stringify({ ids }) }),
    resetPartnerPassword: (id: number, password: string) => apiFetch(`/admin/partners/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),
    getAllHotels: () => apiFetch('/admin/hotels'),
    getAllBookings: () => apiFetch('/admin/bookings'),
    getStats: () => apiFetch('/admin/stats'),
    getHotelDetails: (id: string) => apiFetch(`/admin/hotels/${id}`),
    updateHotelMetrics: (id: string, data: any) => apiFetch(`/admin/hotels/${id}/metrics`, { method: 'PATCH', body: JSON.stringify(data) }),
    recalculateHotelMetrics: (id: string) => apiFetch(`/admin/hotels/${id}/recalculate`, { method: 'POST' }),
};

export const messageApi = {
    sendMessage: (messageData: { hotelId: number; content: string }) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(messageData) }),
    getHotelMessages: (hotelId: number) => apiFetch(`/messages/hotel/${hotelId}`),
    getMyMessages: () => apiFetch('/messages/my-messages'),
};
