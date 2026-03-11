import { useState } from 'react';
import journalService from '../../services/journalService.js';
import '../../syles/HomePage.css';

/* ─────────────────────────────────────────
   Modal wrapper
───────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-box">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Journal Form — rendered inside the modal
   Props:
     existingJournal – journal object for edit mode, null for create
     onSuccess        – () => void  called after successful save
     onClose          – () => void  called to close the modal
───────────────────────────────────────── */
function JournalFormModal({ onSuccess, onClose, existingJournal = null }) {
    const [formData, setFormData] = useState({
        title:        existingJournal?.title        || '',
        content:      existingJournal?.content      || '',
        journal_date: existingJournal?.journal_date
            ? existingJournal.journal_date.toString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        image:        null,
    });
    const [errors, setErrors]             = useState({});
    const [loading, setLoading]           = useState(false);
    const [imagePreview, setImagePreview] = useState(existingJournal?.image_url || null);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

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
            if (existingJournal) {
                await journalService.update(existingJournal.id, formData);
            } else {
                await journalService.create(formData);
            }
            onSuccess();
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: 'Failed to save journal.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="modal-body">
                {errors.general && (
                    <div className="form-alert">{errors.general}</div>
                )}

                <form id="journal-modal-form" onSubmit={handleSubmit}>
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
                            rows="6"
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
                        {errors.journal_date && (
                            <span className="field-error">{errors.journal_date[0]}</span>
                        )}
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
                        <img className="image-preview" src={imagePreview} alt="Preview" />
                    )}
                </form>
            </div>

            <div className="modal-footer">
                <button className="modal-cancel-btn" type="button" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="modal-submit-btn"
                    type="submit"
                    form="journal-modal-form"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (existingJournal ? 'Update Journal' : 'Create Journal')}
                </button>
            </div>
        </>
    );
}

export default JournalFormModal;