import { useState, useEffect } from 'react';
import '../../syles/JournalViewPage.css';
import journalService from "../../services/journalService.js";
/**
 * JournalViewPage
 *
 * Props:
 *   journalId  – number | string  — ID of the journal to display
 *   onBack     – () => void       — navigate back
 *   onEdit     – (journal) => void
 *   onDelete   – (id) => void
 *
 * If you use React Router, swap props for:
 *   const { id } = useParams();
 *   const navigate = useNavigate();
 */
function JournalViewPage({ journalId, onBack, onEdit, onDelete }) {
    const [journal, setJournal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        if (!journalId) return;
        fetchJournal();
    }, [journalId]);

    const fetchJournal = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await journalService.getById(journalId);
            setJournal(response.data);
        } catch {
            setError('Could not load this journal entry.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this journal entry?')) return;
        try {
            await journalService.delete(journalId);
            onDelete?.(journalId);
        } catch {
            alert('Failed to delete journal.');
        }
    };

    const fmtDate = (str) =>
        new Date(str).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

    return (
        <div className="journal-view-page">

            {/* Top bar */}
            <header className="journal-view-topbar">
                <button className="back-btn" onClick={onBack}>
                    ← Back
                </button>

                {journal && (
                    <div className="journal-view-actions">
                        <button className="btn-edit" onClick={() => onEdit?.(journal)}>
                            Edit
                        </button>
                        <button className="btn-delete" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                )}
            </header>

            {/* Loading */}
            {loading && (
                <div className="journal-view-state">Loading...</div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="journal-view-state error">{error}</div>
            )}

            {/* Article */}
            {!loading && !error && journal && (
                <div className="journal-view-body">
                    <div className="journal-view-card">

                        {journal.image_url && (
                            <img
                                className="journal-hero-img"
                                src={journal.image_url}
                                alt={journal.title}
                            />
                        )}

                        <div className="journal-date">{fmtDate(journal.journal_date)}</div>
                        <h1>{journal.title}</h1>
                        <hr />
                        <p className="journal-content">{journal.content}</p>

                    </div>
                </div>
            )}

        </div>
    );
}

export default JournalViewPage;