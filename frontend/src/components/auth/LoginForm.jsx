import { useState } from 'react';
import '../../styles/form.css';
import authService from '../../services/authService.js';

function LoginForm({ onLoginSuccess, onGoToRegister }) {
    const [formData, setFormData]       = useState({ email: '', password: '' });
    const [error, setError]             = useState('');
    const [loading, setLoading]         = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authService.login(formData);
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 style={{ marginBottom: '20px', fontSize: '1.3rem', color: '#222' }}>Login</h2>

            {error && <div className="form-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <div className="input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>

                <button className="btn" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </>
    );
}

export default LoginForm;