import { useState } from 'react';
import journalService from '../../services/journalService';
import '../../syles/form.css';

function JournalForm({ onSuccess, existingJournal = null }) {
    const [formData, setFormData] = useState({
        title: existingJournal?.title || '',
        content: existingJournal?.content || '',
        journal_date: existingJournal?.journal_date || new Date().toISOString().split('T')[0],
        image: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(existingJournal?.image_url || null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            let response;
            if (existingJournal) {
                response = await journalService.update(existingJournal.id, formData);
            } else {
                response = await journalService.create(formData);
            }
            console.log('Journal saved:', response);
            onSuccess();

            if (!existingJournal) {
                setFormData({
                    title: '',
                    content: '',
                    journal_date: new Date().toISOString().split('T')[0],
                    image: null,
                });
                setImagePreview(null);
            }
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: 'Failed to save journal' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-card form-card--wide">
                <h2>{existingJournal ? 'Edit Journal' : 'Create New Journal'}</h2>

                {errors.general && <div className="form-alert">{errors.general}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title:</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        {errors.title && <span className="field-error">{errors.title[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label>Content:</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows="7"
                        />
                        {errors.content && <span className="field-error">{errors.content[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label>Date:</label>
                        <input
                            type="date"
                            name="journal_date"
                            value={formData.journal_date}
                            onChange={handleChange}
                            required
                        />
                        {errors.journal_date && <span className="field-error">{errors.journal_date[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label>Image (optional):</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {errors.image && <span className="field-error">{errors.image[0]}</span>}
                    </div>

                    {imagePreview && (
                        <img
                            className="image-preview"
                            src={imagePreview}
                            alt="Preview"
                        />
                    )}

                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (existingJournal ? 'Update Journal' : 'Create Journal')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default JournalForm;