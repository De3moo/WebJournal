import { useState } from 'react';
import authService from '../../services/authService';
import '../../syles/form.css';
function RegisterForm({ onRegisterSuccess, onGoToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
                        required
                    />
                    {errors.password && <span className="field-error">{errors.password[0]}</span>}
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
                </div>

                <button className="btn" type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </>
    );
}

export default RegisterForm;