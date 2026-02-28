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
            const stored = localStorage.getItem('user');
            if (stored) {
                try { setUser(JSON.parse(stored)); } catch { /* malformed */ }
            }

            authService.me()
                .then((res) => {
                    const freshUser = res.data?.user ?? res.data;
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch(() => {
                    setIsAuthenticated(false);
                    setUser(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
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
            authService.me()
                .then((res) => {
                    const freshUser = res.data?.user ?? res.data;
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
            authService.me()
                .then((res) => {
                    const freshUser = res.data?.user ?? res.data;
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