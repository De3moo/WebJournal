import { useState } from 'react';
import authService from '../../services/authService';
import '../../styles/form.css';

const PASSWORD_REQUIREMENTS = [
    { key: 'length',  label: 'At least 8 characters',           test: (p) => p.length >= 8 },
    { key: 'upper',   label: 'One uppercase letter (A–Z)',       test: (p) => /[A-Z]/.test(p) },
    { key: 'lower',   label: 'One lowercase letter (a–z)',       test: (p) => /[a-z]/.test(p) },
    { key: 'number',  label: 'One number (0–9)',                 test: (p) => /[0-9]/.test(p) },
    { key: 'special', label: 'One special character (!@#$ …)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function getStrength(password) {
    if (!password) return 0;
    const passed = PASSWORD_REQUIREMENTS.filter(r => r.test(password)).length;
    if (passed <= 1) return 1;
    if (passed === 2) return 2;
    if (passed === 3) return 3;
    return 4;
}

function RegisterForm({ onRegisterSuccess, onGoToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const strength = getStrength(formData.password);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const response = await authService.register(formData);
            console.log('Registration successful:', response);
            onRegisterSuccess();
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 style={{ marginBottom: '20px', fontSize: '1.3rem', color: '#222' }}>Register</h2>

            {errors.general && <div className="form-alert">{errors.general}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    {errors.name && <span className="field-error">{errors.name[0]}</span>}
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {errors.email && <span className="field-error">{errors.email[0]}</span>}
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setPasswordTouched(true)}
                        required
                    />
                    {errors.password && <span className="field-error">{errors.password[0]}</span>}

                    {passwordTouched && (
                        <div className="password-strength">
                            <div className="strength-bar-track">
                                <div
                                    className="strength-bar-fill"
                                    data-strength={formData.password ? strength : 0}
                                />
                            </div>
                            {formData.password && (
                                <span
                                    className="strength-label"
                                    data-strength={strength}
                                >
                                    {STRENGTH_LABELS[strength]}
                                </span>
                            )}
                            <ul className="password-requirements">
                                {PASSWORD_REQUIREMENTS.map(req => {
                                    const met = req.test(formData.password);
                                    const attempted = formData.password.length > 0;
                                    return (
                                        <li
                                            key={req.key}
                                            className={attempted ? (met ? 'met' : 'unmet') : ''}
                                        >
                                            {req.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required
                    />
                    {formData.password_confirmation &&
                        formData.password !== formData.password_confirmation && (
                            <span className="field-error">Passwords do not match</span>
                        )}
                </div>

                <button className="btn" type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </>
    );
}

export default RegisterForm;