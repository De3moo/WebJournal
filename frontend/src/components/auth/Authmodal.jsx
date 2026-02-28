import { useState } from 'react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import '../../styles/AuthModal.css';

function AuthModal({ onClose, onLoginSuccess, onRegisterSuccess, defaultMode = 'login' }) {
    const [mode, setMode] = useState(defaultMode); // 'login' | 'register'

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="auth-backdrop" onClick={handleBackdropClick}>
            <div className="auth-modal">

                {/* ── Header ── */}
                <div className="auth-modal-header">
                    <div className="auth-modal-brand">
                        <span>📓</span>
                        <span>Web Journal</span>
                    </div>
                    <button className="auth-modal-close" onClick={onClose}>✕</button>
                </div>

                {/* ── Tab switcher ── */}
                <div className="auth-modal-tabs">
                    <button
                        className={`auth-tab${mode === 'login' ? ' active' : ''}`}
                        onClick={() => setMode('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-tab${mode === 'register' ? ' active' : ''}`}
                        onClick={() => setMode('register')}
                    >
                        Create Account
                    </button>
                </div>

                {/* ── Form body ── */}
                <div className="auth-modal-body">
                    {mode === 'login' ? (
                        <LoginForm
                            onLoginSuccess={onLoginSuccess}
                            onGoToRegister={() => setMode('register')}
                        />
                    ) : (
                        <RegisterForm
                            onRegisterSuccess={onRegisterSuccess}
                            onGoToLogin={() => setMode('login')}
                        />
                    )}
                </div>

                {/* ── Footer toggle ── */}
                <div className="auth-modal-footer">
                    {mode === 'login' ? (
                        <p>
                            Don't have an account?{' '}
                            <button onClick={() => setMode('register')}>Create one</button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <button onClick={() => setMode('login')}>Sign in</button>
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default AuthModal;