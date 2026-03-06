import { useState, useEffect } from 'react';
import authService from './services/authService';
import LandingPage from './components/page/LandingPage.jsx';
import AuthModal from './components/auth/Authmodal.jsx';
import './App.css';
import HomePage from "./components/page/HomePage.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser]                       = useState(null);
    const [authModal, setAuthModal]             = useState(null); // null | 'login' | 'register'

    // On mount: restore auth state + user from localStorage
    useEffect(() => {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
            // 1. Immediately restore from localStorage so the user sees the app right away
            const storedUser = authService.getCurrentUser();
            if (storedUser) setUser(storedUser);

            // 2. Silently refresh user data from the server in the background.
            //    Only log out if the token is explicitly rejected (401).
            //    Network errors / timeouts should NOT kick the user out.
            authService.me(true)   // forceRefresh=true → always hits the network
                .then((res) => {
                    const freshUser = res.user ?? res;
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch((err) => {
                    // Only clear session on a real 401 (invalid / expired token)
                    if (err?.response?.status === 401) {
                        setIsAuthenticated(false);
                        setUser(null);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('isAuthenticated');
                    }
                    // Any other error (network down, 500, etc.) — stay logged in
                });
        }
    }, []);

    const handleLoginSuccess = (loggedInUser) => {
        setIsAuthenticated(true);
        setAuthModal(null);
        if (loggedInUser) {
            setUser(loggedInUser);
            localStorage.setItem('user', JSON.stringify(loggedInUser));
        } else {
            authService.me(true)
                .then((res) => {
                    const freshUser = res.user ?? res;
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch(() => {});
        }
    };

    const handleRegisterSuccess = (registeredUser) => {
        setIsAuthenticated(true);
        setAuthModal(null);
        if (registeredUser) {
            setUser(registeredUser);
            localStorage.setItem('user', JSON.stringify(registeredUser));
        } else {
            authService.me(true)
                .then((res) => {
                    const freshUser = res.user ?? res;
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch(() => {});
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        }
    };

    /* ── Logged in ── */
    if (isAuthenticated) {
        return <HomePage user={user} onLogout={handleLogout} />;
    }

    /* ── Not logged in: landing page + modal overlay ── */
    return (
        <>
            <LandingPage
                onGetStarted={() => setAuthModal('register')}
                onLogin={() => setAuthModal('login')}
            />

            {authModal && (
                <AuthModal
                    defaultMode={authModal}
                    onClose={() => setAuthModal(null)}
                    onLoginSuccess={handleLoginSuccess}
                    onRegisterSuccess={handleRegisterSuccess}
                />
            )}
        </>
    );
}

export default App;