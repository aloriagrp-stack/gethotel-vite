const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('10.') || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('172.')
);
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? `http://${window.location.hostname}:5000/api` : 'https://gethotelstays.com/api');

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
    getMe: () => apiFetch('/auth/me'),
    googleLogin: (idToken: string) => apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
};

export const aiApi = {
    chat: (messages: { role: string; content: string }[], userMemory?: any, conversationId?: string) =>
        apiFetch('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, userMemory, conversationId }) }),
    getRooms: (hotelId: number) =>
        apiFetch('/ai/rooms', { method: 'POST', body: JSON.stringify({ hotelId }) }),
};

export const bookingApi = {
    createBooking: (bookingData: any) => apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
};

export const paymentApi = {
    createOrder: (bookingId: number) => apiFetch('/payments/create-order', { method: 'POST', body: JSON.stringify({ bookingId }) }),
    verifyPayment: (paymentData: any) => apiFetch('/payments/verify', { method: 'POST', body: JSON.stringify(paymentData) }),
};

export const conversationApi = {
    list: () => apiFetch('/conversations'),
    create: (title: string) => apiFetch('/conversations', { method: 'POST', body: JSON.stringify({ title }) }),
    get: (id: string) => apiFetch(`/conversations/${id}`),
    update: (id: string, data: { title?: string; archived?: boolean }) =>
        apiFetch(`/conversations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch(`/conversations/${id}`, { method: 'DELETE' }),
    saveMessage: (conversationId: string, msg: { role: string; content: string; metadata?: any }) =>
        apiFetch(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(msg) }),
    syncGuestConversations: (conversationIds: string[]) =>
        apiFetch('/conversations/sync', { method: 'POST', body: JSON.stringify({ conversationIds }) }),
};
