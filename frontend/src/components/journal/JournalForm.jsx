import { useState } from 'react';
import journalService from '../../services/journalService';

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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
            });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
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

            // Reset form if creating new
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
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>{existingJournal ? 'Edit Journal' : 'Create New Journal'}</h2>

            {errors.general && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title[0]}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Content:</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows="6"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    {errors.content && <span style={{ color: 'red', fontSize: '12px' }}>{errors.content[0]}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Date:</label>
                    <input
                        type="date"
                        name="journal_date"
                        value={formData.journal_date}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    {errors.journal_date && <span style={{ color: 'red', fontSize: '12px' }}>{errors.journal_date[0]}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Image (optional):</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    {errors.image && <span style={{ color: 'red', fontSize: '12px' }}>{errors.image[0]}</span>}
                </div>

                {imagePreview && (
                    <div style={{ marginBottom: '15px' }}>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {loading ? 'Saving...' : (existingJournal ? 'Update Journal' : 'Create Journal')}
                </button>
            </form>
        </div>
    );
}

export default JournalForm;