import api from './api';

const authService = {

    register: async (userData) => {
        const response = await api.post('/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('isAuthenticated', 'true');
        }
        return response.data;
    },

    // Call this on your /auth/callback page
    handleSocialCallback: () => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) throw new Error(error);

        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('isAuthenticated', 'true');
        }
        return token;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('isAuthenticated', 'true');
        }
        return response.data;
    },

    // Logout user
    logout: async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
    },

    // Get current user from localStorage (no network call)
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Check if user is logged in
    isAuthenticated: () => {
        return localStorage.getItem('isAuthenticated') === 'true';
    },

    // Fetch current user from server (requires valid token).
    // Always returns { user } shape consistently.
    me: async (forceRefresh = false) => {
        if (!forceRefresh) {
            const cached = localStorage.getItem('user');
            if (cached) return { user: JSON.parse(cached) };
        }
        const response = await api.get('/me');
        const user = response.data?.user ?? response.data;
        localStorage.setItem('user', JSON.stringify(user));
        return { user };   // ← always { user: ... }, never raw axios shape
    },
};

export default authService;