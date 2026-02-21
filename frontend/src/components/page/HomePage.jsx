import { useState, useEffect } from 'react';
import journalService from '../../services/journalService.js';
import authService from '../../services/authService.js';
import '../../syles/HomePage.css';
/* ─────────────────────────────────────────
   Journal Form — rendered inside the modal
───────────────────────────────────────── */
function JournalFormModal({ onSuccess, onClose, existingJournal = null }) {
    const [formData, setFormData] = useState({
        title:        existingJournal?.title        || '',
        content:      existingJournal?.content      || '',
        journal_date: existingJournal?.journal_date || new Date().toISOString().split('T')[0],
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

/* ─────────────────────────────────────────
   Modal wrapper
───────────────────────────────────────── */
function Modal({ title, onClose, children }) {
    // Close when clicking the dark backdrop
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
   HomePage
   Props:
     user     – { name, email } (optional)
     onLogout – () => void
───────────────────────────────────────── */
function HomePage({ user, onLogout }) {
    const [journals, setJournals]             = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState('');
    const [search, setSearch]                 = useState('');
    const [selectedId, setSelectedId]         = useState(null);
    const [modalMode, setModalMode]           = useState(null); // null | 'create' | 'edit'
    const [editingJournal, setEditingJournal] = useState(null);

    useEffect(() => { fetchJournals(); }, []);

    const fetchJournals = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await journalService.getAll();
            setJournals(response.data);
        } catch {
            setError('Failed to load journals.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this journal entry?')) return;
        try {
            await journalService.delete(id);
            if (selectedId === id) setSelectedId(null);
            fetchJournals();
        } catch {
            alert('Failed to delete journal.');
        }
    };

    const handleLogout = async () => {
        try { await authService.logout(); } catch { /* ignore */ }
        onLogout?.();
    };

    const openCreateModal = () => {
        setEditingJournal(null);
        setModalMode('create');
    };

    const openEditModal = (journal) => {
        setEditingJournal(journal);
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setEditingJournal(null);
    };

    const handleFormSuccess = () => {
        closeModal();
        fetchJournals();
    };

    const filtered = journals.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        (j.content || '').toLowerCase().includes(search.toLowerCase())
    );

    const selectedJournal = journals.find((j) => j.id === selectedId) ?? null;

    const fmtDate = (str) =>
        new Date(str).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        });

    const fmtDateLong = (str) =>
        new Date(str).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

    return (
        <div className="home-page">

            {/* ── Navbar ── */}
            <nav className="home-navbar">
                <h1>Web Journal System</h1>
                <div className="home-navbar-right">
                    {user?.name && <span className="navbar-user">Hello, {user.name}</span>}
                    <button className="navbar-logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            {/* ── Two-panel body ── */}
            <div className="home-body">

                {/* LEFT: Journal list */}
                <aside className="journal-list-panel">
                    <div className="journal-list-header">
                        <h2>My Journals</h2>
                        <button className="create-journal-btn" onClick={openCreateModal}>
                            + Create Journal
                        </button>
                    </div>

                    <div className="journal-list-search">
                        <input
                            type="text"
                            placeholder="Search journals..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="journal-list-count">
                        {loading
                            ? 'Loading...'
                            : `${filtered.length} journal${filtered.length !== 1 ? 's' : ''}`}
                    </div>

                    <div className="journal-list-items">
                        {error && (
                            <div className="journal-list-empty" style={{ color: '#c0392b' }}>
                                {error}
                            </div>
                        )}

                        {!loading && !error && filtered.length === 0 && (
                            <div className="journal-list-empty">
                                {search ? 'No results found.' : 'No journals yet. Create one!'}
                            </div>
                        )}

                        {!loading && filtered.map((journal) => (
                            <button
                                key={journal.id}
                                className={`journal-list-item${selectedId === journal.id ? ' active' : ''}`}
                                onClick={() => setSelectedId(journal.id)}
                            >
                                <div className="journal-item-title">{journal.title}</div>
                                <div className="journal-item-date">{fmtDate(journal.journal_date)}</div>
                                {journal.content && (
                                    <div className="journal-item-preview">{journal.content}</div>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* RIGHT: Journal content */}
                <main className="journal-content-panel">
                    {!selectedJournal ? (
                        <div className="journal-content-empty">
                            <h2>No journal selected</h2>
                            <p>Click a journal on the left to read it, or create a new one.</p>
                        </div>
                    ) : (
                        <div className="journal-detail-card">
                            {selectedJournal.image_url && (
                                <img
                                    className="journal-detail-image"
                                    src={selectedJournal.image_url}
                                    alt={selectedJournal.title}
                                />
                            )}

                            <div className="journal-detail-date">
                                {fmtDateLong(selectedJournal.journal_date)}
                            </div>

                            <h2 className="journal-detail-title">{selectedJournal.title}</h2>

                            <hr className="journal-detail-divider" />

                            <p className="journal-detail-content">{selectedJournal.content}</p>

                            <div className="journal-detail-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => openEditModal(selectedJournal)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(selectedJournal.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Modal ── */}
            {modalMode && (
                <Modal
                    title={modalMode === 'edit' ? 'Edit Journal' : 'Create New Journal'}
                    onClose={closeModal}
                >
                    <JournalFormModal
                        existingJournal={editingJournal}
                        onSuccess={handleFormSuccess}
                        onClose={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}

export default HomePage;