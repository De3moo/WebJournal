import { useState, useEffect } from 'react';
import RegisterForm from './components/auth/RegisterForm';
import authService from './services/authService';
import LoginForm from './components/auth/LoginForm.jsx';
import './App.css';
import HomePage from "./components/page/HomePage.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRegister, setShowRegister]       = useState(false);
    const [user, setUser]                       = useState(null);

    // On mount: restore auth state + user from localStorage
    useEffect(() => {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
            // Try to get the cached user from localStorage first
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch {
                    // malformed JSON — fetch fresh
                }
            }
            // Always fetch fresh user data from /me on load
            authService.me()
                .then((res) => {
                    const freshUser = res.data?.user ?? res.data;
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch(() => {
                    // /me failed — token likely expired, force logout
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
        // Accept user object if authService.login() passes it back,
        // otherwise fall back to fetching from /me
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
        setShowRegister(false);
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

    /* ── Not logged in: show login or register ── */
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f2f5',
                padding: '20px',
            }}>
                <h1 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#222',
                    marginBottom: '8px',
                }}>
                    Web Journal System
                </h1>

                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '24px' }}>
                    {showRegister ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        onClick={() => setShowRegister(!showRegister)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#2c7a4b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: 'inherit',
                            textDecoration: 'underline',
                            padding: 0,
                        }}
                    >
                        {showRegister ? 'Login' : 'Register'}
                    </button>
                </p>

                <div style={{
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '36px 32px',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                    {showRegister ? (
                        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                    ) : (
                        <LoginForm onLoginSuccess={handleLoginSuccess} />
                    )}
                </div>
            </div>
        );
    }

    /* ── Logged in: show HomePage ── */
    return <HomePage user={user} onLogout={handleLogout} />;
}

export default App;