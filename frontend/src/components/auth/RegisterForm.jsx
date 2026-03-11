import { useState } from 'react';
import authService from '../../services/authService';
import '../../styles/form.css';

// ── Password policy rules ──────────────────────────────────────────────────
const RULES = [
    { id: 'length',    label: 'At least 8 characters',          test: (p) => p.length >= 8 },
    { id: 'upper',     label: 'At least one uppercase letter',   test: (p) => /[A-Z]/.test(p) },
    { id: 'lower',     label: 'At least one lowercase letter',   test: (p) => /[a-z]/.test(p) },
    { id: 'number',    label: 'At least one number',             test: (p) => /[0-9]/.test(p) },
    { id: 'symbol',    label: 'At least one special character',  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password) {
    const passed = RULES.filter((r) => r.test(password)).length;
    if (passed <= 1) return { label: 'Very Weak',   color: '#e53e3e', width: '20%'  };
    if (passed === 2) return { label: 'Weak',        color: '#ed8936', width: '40%'  };
    if (passed === 3) return { label: 'Fair',        color: '#ecc94b', width: '60%'  };
    if (passed === 4) return { label: 'Strong',      color: '#48bb78', width: '80%'  };
    return                    { label: 'Very Strong', color: '#38a169', width: '100%' };
}

// ── Component ──────────────────────────────────────────────────────────────
function RegisterForm({ onRegisterSuccess, onGoToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors]                   = useState({});
    const [loading, setLoading]                 = useState(false);
    const [showPassword, setShowPassword]       = useState(false);
    const [showConfirm, setShowConfirm]         = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Client-side policy check before hitting the server
        const failed = RULES.filter((r) => !r.test(formData.password));
        if (failed.length) {
            setErrors({ password: ['Password does not meet the required policy.'] });
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: ['Passwords do not match.'] });
            return;
        }

        setLoading(true);
        try {
            const response = await authService.register(formData);
            onRegisterSuccess();
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    const strength  = getStrength(formData.password);
    const rulesMet  = RULES.filter((r) => r.test(formData.password)).length;
    const allPassed = rulesMet === RULES.length;

    return (
        <>
            <h2 style={{ marginBottom: '20px', fontSize: '1.3rem', color: '#222' }}>Register</h2>

            {errors.general && <div className="form-alert">{errors.general}</div>}

            <form onSubmit={handleSubmit}>
                {/* Name */}
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

                {/* Email */}
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

                {/* Password */}
                <div className="form-group">
                    <label>Password:</label>
                    <div className="input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
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

                    {/* Strength bar */}
                    {formData.password.length > 0 && (
                        <div className="strength-bar-wrapper">
                            <div className="strength-bar-track">
                                <div
                                    className="strength-bar-fill"
                                    style={{ width: strength.width, backgroundColor: strength.color }}
                                />
                            </div>
                            <span className="strength-label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                        </div>
                    )}

                    {/* Live checklist */}
                    {(passwordFocused || (formData.password.length > 0 && !allPassed)) && (
                        <ul className="password-checklist">
                            {RULES.map((rule) => {
                                const ok = rule.test(formData.password);
                                return (
                                    <li key={rule.id} className={ok ? 'rule-pass' : 'rule-fail'}>
                                        <span className="rule-icon">{ok ? '✓' : '✗'}</span>
                                        {rule.label}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {errors.password && <span className="field-error">{errors.password[0]}</span>}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <div className="input-wrapper">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                            {showConfirm ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <span className="field-error">{errors.password_confirmation[0]}</span>
                    )}
                </div>

                <button className="btn" type="submit" disabled={loading || !allPassed}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </>
    );
}

export default RegisterForm;