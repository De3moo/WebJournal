import { useState, useEffect } from 'react';
import journalService from '../../services/journalService';

function JournalList() {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            setLoading(true);
            const response = await journalService.getAll();
            setJournals(response.data);
        } catch (err) {
            setError('Failed to load journals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this journal?')) {
            try {
                await journalService.delete(id);
                fetchJournals(); // Refresh list
            } catch (err) {
                alert('Failed to delete journal');
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
            <h2>My Journals</h2>

            {journals.length === 0 ? (
                <p>No journals yet. Create your first one!</p>
            ) : (
                <div>
                    {journals.map((journal) => (
                        <div
                            key={journal.id}
                            style={{
                                border: '1px solid #ddd',
                                padding: '15px',
                                marginBottom: '15px',
                                borderRadius: '5px',
                            }}
                        >
                            <h3>{journal.title}</h3>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                {new Date(journal.journal_date).toLocaleDateString()}
                            </p>
                            <p style={{ marginTop: '10px' }}>{journal.content}</p>

                            {journal.image_url && (
                                <img
                                    src={journal.image_url}
                                    alt={journal.title}
                                    style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
                                />
                            )}

                            <div style={{ marginTop: '10px' }}>
                                <button
                                    onClick={() => handleDelete(journal.id)}
                                    style={{
                                        padding: '5px 15px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default JournalList;