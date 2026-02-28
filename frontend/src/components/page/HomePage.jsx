import { useState, useEffect } from 'react';
import journalService from '../../services/journalService.js';
import authService from '../../services/authService.js';
import JournalFormModal, { Modal } from '../journal/JournalFormModal.jsx';
import DashboardPanel from './DashboardPanel.jsx';
import Footer from './Footer.jsx';
import '../../styles/HomePage.css';
import JournalDetail from "../journal/JournalDetail.jsx";

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

    // From dashboard Recent Entries — select journal in the middle panel
    const handleDashboardJournalSelect = (id) => {
        setSelectedId(id);
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

            {/* ── Three-column body ── */}
            <div className="home-body">

                {/* COL 1 — Journal list */}
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

                {/* COL 2 — Journal content */}
                <main className="journal-content-panel">
                    {!selectedJournal ? (
                        <div className="journal-content-empty">
                            <h2>No journal selected</h2>
                            <p>Click a journal on the left to read it, or create a new one.</p>
                        </div>
                    ) : (
                        <JournalDetail
                            journal={selectedJournal}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    )}
                </main>

                {/* COL 3 — Dashboard (always visible) */}
                <aside className="dashboard-panel-col">
                    <DashboardPanel
                        journals={journals}
                        onSelectJournal={handleDashboardJournalSelect}
                    />
                </aside>

            </div>

            {/* ── Footer ── */}
            <Footer />

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