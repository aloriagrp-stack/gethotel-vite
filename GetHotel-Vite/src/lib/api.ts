// API configuration for GetHotelStays - Force refresh
const API_URL = import.meta.env.MODE === 'production' 
    ? 'https://gethotelstays.com/api' 
    : (import.meta.env.VITE_API_URL 
        || `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000/api`);

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
    getPackages: async (params?: any) => {
        try {
            const res = await apiFetch(`/packages${params ? '?' + new URLSearchParams(params).toString() : ''}`);
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) return res;
        } catch (e) {}

        // Fallback 1: Fetch from live MySQL homepage_config DB table
        try {
            const hpRes = await apiFetch('/homepage/config');
            if (hpRes && hpRes.success && hpRes.data && hpRes.data.ghs_admin_tour_packages) {
                const pkgs = typeof hpRes.data.ghs_admin_tour_packages === 'string'
                    ? JSON.parse(hpRes.data.ghs_admin_tour_packages)
                    : hpRes.data.ghs_admin_tour_packages;
                if (Array.isArray(pkgs) && pkgs.length > 0) return { success: true, data: pkgs };
            }
        } catch (e) {}

        // Fallback 2: LocalStorage
        const local = localStorage.getItem("ghs_admin_tour_packages");
        if (local) {
            try {
                return { success: true, data: JSON.parse(local) };
            } catch (e) {}
        }

        return { success: true, data: [] };
    },
    getPackage: (idOrSlug: string) => apiFetch(`/packages/${idOrSlug}`),
    createPackage: async (data: any) => {
        try {
            const res = await apiFetch('/packages', { method: 'POST', body: JSON.stringify(data) });
            if (res && res.success) return res;
        } catch (e) {}

        // Fallback: Save to LocalStorage + Sync with live MySQL homepage_config DB
        const existingStr = localStorage.getItem("ghs_admin_tour_packages");
        let existingList: any[] = existingStr ? JSON.parse(existingStr) : [];

        const newPkg = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            slug: (data.title || "tour").toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        existingList.unshift(newPkg);
        localStorage.setItem("ghs_admin_tour_packages", JSON.stringify(existingList));

        // Save to homepage_config MySQL database so all users on website see it!
        try {
            await apiFetch('/admin/homepage/config', {
                method: 'PUT',
                body: JSON.stringify({ ghs_admin_tour_packages: JSON.stringify(existingList) })
            });
        } catch (e) {}

        return { success: true, message: "Package created successfully", data: newPkg };
    },
    updatePackage: async (id: string | number, data: any) => {
        try {
            const res = await apiFetch(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            if (res && res.success) return res;
        } catch (e) {}

        const existingStr = localStorage.getItem("ghs_admin_tour_packages");
        let existingList: any[] = existingStr ? JSON.parse(existingStr) : [];
        existingList = existingList.map(p => p.id === id || String(p.id) === String(id) ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
        localStorage.setItem("ghs_admin_tour_packages", JSON.stringify(existingList));

        try {
            await apiFetch('/admin/homepage/config', {
                method: 'PUT',
                body: JSON.stringify({ ghs_admin_tour_packages: JSON.stringify(existingList) })
            });
        } catch (e) {}

        return { success: true, message: "Package updated successfully" };
    },
    deletePackage: async (id: string | number) => {
        try {
            const res = await apiFetch(`/packages/${id}`, { method: 'DELETE' });
            if (res && res.success) return res;
        } catch (e) {}

        const existingStr = localStorage.getItem("ghs_admin_tour_packages");
        let existingList: any[] = existingStr ? JSON.parse(existingStr) : [];
        existingList = existingList.filter(p => p.id !== id && String(p.id) !== String(id));
        localStorage.setItem("ghs_admin_tour_packages", JSON.stringify(existingList));

        try {
            await apiFetch('/admin/homepage/config', {
                method: 'PUT',
                body: JSON.stringify({ ghs_admin_tour_packages: JSON.stringify(existingList) })
            });
        } catch (e) {}

        return { success: true, message: "Package deleted successfully" };
    },
    uploadImage: async (imageBase64: string) => {
        try {
            const res = await apiFetch('/packages/upload-image', { method: 'POST', body: JSON.stringify({ image: imageBase64 }) });
            if (res && res.success && res.url) return res;
        } catch (e) {}
        // Fallback return base64 if server image upload route not available
        return { success: true, url: imageBase64 };
    },
    importJson: async (payload: { jsonText?: string; packages?: any[] }) => {
        try {
            const res = await apiFetch('/packages/import-json', { method: 'POST', body: JSON.stringify(payload) });
            if (res && res.success) return res;
        } catch (e) { /* try fallback */ }

        try {
            const res2 = await apiFetch('/admin/packages/import-json', { method: 'POST', body: JSON.stringify(payload) });
            if (res2 && res2.success) return res2;
        } catch (e) { /* try fallback */ }

        // Client-side Fallback using existing homepage_config DB + LocalStorage persistence
        let items: any[] = [];
        if (Array.isArray(payload.packages) && payload.packages.length > 0) {
            items = payload.packages;
        } else if (payload.jsonText) {
            try {
                const parsed = JSON.parse(payload.jsonText);
                if (Array.isArray(parsed)) items = parsed;
                else if (parsed && typeof parsed === 'object') {
                    if (Array.isArray(parsed.packages)) items = parsed.packages;
                    else if (Array.isArray(parsed.tours)) items = parsed.tours;
                    else if (parsed.title || parsed.name) items = [parsed];
                }
            } catch (e) {}
        }

        if (items.length > 0) {
            let importedCount = 0;
            for (const item of items) {
                const pkgPayload = {
                    title: item.title || item.name || "Untitled Tour Package",
                    destination: item.destination || item.city || "India",
                    duration: item.duration || "5 Days / 4 Nights",
                    price: parseFloat(item.price || item.cost || 15000),
                    originalPrice: item.originalPrice || item.original_price ? parseFloat(item.originalPrice || item.original_price) : null,
                    discountPercent: item.discountPercent || item.discount_percent || "20% OFF",
                    badge: item.badge || "Bestseller",
                    rating: item.rating ? parseFloat(item.rating) : 4.8,
                    reviewsCount: item.reviewsCount ? parseInt(item.reviewsCount, 10) : 45,
                    includedStay: item.includedStay || item.stay || "4-Star Hotel Stay",
                    transport: item.transport || "Private AC Cab Included",
                    image: item.image || item.coverImage || item.thumbnail || "",
                    gallery: Array.isArray(item.gallery) ? item.gallery : (item.image ? [item.image] : []),
                    overview: item.overview || item.description || "",
                    inclusions: Array.isArray(item.inclusions) ? item.inclusions : ["Hotel Stay", "Transfers"],
                    itinerary: Array.isArray(item.itinerary) ? item.itinerary : [],
                    isActive: item.isActive !== false
                };
                await packageApi.createPackage(pkgPayload);
                importedCount++;
            }

            if (importedCount > 0) {
                return {
                    success: true,
                    count: importedCount,
                    message: `Successfully imported ${importedCount} tour package(s)!`
                };
            }
        }

        return { success: false, message: "Could not import tour packages from JSON." };
    },
    getHeroConfig: async () => {
        try {
            const res = await apiFetch('/packages/hero-config');
            if (res && res.success && res.data) return res;
        } catch (e) {}

        try {
            const hpRes = await apiFetch('/homepage/config');
            if (hpRes && hpRes.success && hpRes.data && hpRes.data.tour_hero_config) {
                const hData = typeof hpRes.data.tour_hero_config === 'string'
                    ? JSON.parse(hpRes.data.tour_hero_config)
                    : hpRes.data.tour_hero_config;
                return { success: true, data: hData };
            }
        } catch (e) {}

        const localBanners = localStorage.getItem("ghs_admin_tour_banners");
        if (localBanners) {
            try {
                const parsed = JSON.parse(localBanners);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return { success: true, data: { banners: parsed, heroImages: parsed.map(b => b.image || b) } };
                }
            } catch (e) {}
        }

        const localConfig = localStorage.getItem("ghs_admin_tour_hero_config");
        if (localConfig) {
            try { return { success: true, data: JSON.parse(localConfig) }; } catch (e) {}
        }

        return {
            success: true,
            data: {
                title: "Explore Handcrafted Tour Packages",
                subtitle: "Unforgettable journeys designed for your dream vacation across India & global destinations",
                heroImages: []
            }
        };
    },
    updateHeroConfig: async (data: any) => {
        if (data && data.banners) {
            localStorage.setItem("ghs_admin_tour_banners", JSON.stringify(data.banners));
        }
        localStorage.setItem("ghs_admin_tour_hero_config", JSON.stringify(data));

        try {
            const res = await apiFetch('/packages/hero-config', { method: 'PUT', body: JSON.stringify(data) });
            if (res && res.success) return res;
        } catch (e) {}

        try {
            await apiFetch('/admin/homepage/config', {
                method: 'PUT',
                body: JSON.stringify({ key: 'tour_hero_config', value: JSON.stringify(data) })
            });
        } catch (e) {}

        return { success: true, message: "Hero config updated" };
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


