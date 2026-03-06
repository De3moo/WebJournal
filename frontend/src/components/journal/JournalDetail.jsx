import '../../styles/JournalDetails.css';
import journalService from '../../services/journalService.js';

function JournalDetail({ journal, onEdit, onDelete }) {
    const fmtDateLong = (str) =>
        new Date(str).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

    const handleExportPdf = async () => {
        try {
            await journalService.exportPdf(journal.id);
        } catch {
            alert('Failed to export PDF. Please try again.');
        }
    };

    return (
        <div className="journal-detail">
            <div className="journal-detail-actions">
                <button className="btn-export-pdf" onClick={handleExportPdf}>
                    Export
                </button>
                <button className="btn-edit" onClick={() => onEdit(journal)}>
                    Edit
                </button>
                <button className="btn-delete" onClick={() => onDelete(journal.id)}>
                    Delete
                </button>

            </div>

            {journal.image_url && (
                <img
                    className="journal-detail-image"
                    src={journal.image_url}
                    alt={journal.title}
                />
            )}

            <div className="journal-detail-date">
                {fmtDateLong(journal.journal_date)}
            </div>

            <h2 className="journal-detail-title">{journal.title}</h2>

            <hr className="journal-detail-divider" />

            <p className="journal-detail-content">{journal.content}</p>
        </div>
    );
}

export default JournalDetail;