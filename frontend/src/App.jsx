import { useState, useEffect } from 'react';
import RegisterForm from './components/auth/RegisterForm';
import JournalForm from './components/journal/JournalForm';
import JournalList from './components/journal/JournalList';
import authService from './services/authService';
import LoginForm from "./components/LoginForm.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [refreshJournals, setRefreshJournals] = useState(0);

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleRegisterSuccess = () => {
        setIsAuthenticated(true);
        setShowRegister(false);
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const handleJournalSuccess = () => {
        setRefreshJournals(prev => prev + 1);
    };

    if (!isAuthenticated) {
        return (
            <div>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h1>Web Journal System</h1>
                    <button
                        onClick={() => setShowRegister(!showRegister)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {showRegister ? 'Go to Login' : 'Go to Register'}
                    </button>
                </div>

                {showRegister ? (
                    <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                ) : (
                    <LoginForm onLoginSuccess={handleLoginSuccess} />
                )}
            </div>
        );
    }

    return (
        <div>
            <div style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <h1 style={{ margin: 0 }}>Web Journal System</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Logout
                </button>
            </div>

            <JournalForm onSuccess={handleJournalSuccess} />
            <JournalList key={refreshJournals} />
        </div>
    );
}

export default App;