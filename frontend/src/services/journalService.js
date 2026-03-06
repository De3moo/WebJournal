import api from './api';

const journalService = {
    // Get all journals
    getAll: async (page = 1) => {
        const response = await api.get(`/journals?page=${page}`);
        return response.data;
    },

    // Get single journal
    getById: async (id) => {
        const response = await api.get(`/journals/${id}`);
        return response.data;
    },

    // Create journal
    create: async (journalData) => {
        const formData = new FormData();
        formData.append('title', journalData.title);
        formData.append('content', journalData.content);
        formData.append('journal_date', journalData.journal_date);

        if (journalData.image) {
            formData.append('image', journalData.image);
        }

        const response = await api.post('/journals', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Update journal
    update: async (id, journalData) => {
        const formData = new FormData();
        if (journalData.title) formData.append('title', journalData.title);
        if (journalData.content !== undefined && journalData.content !== null)
            formData.append('content', journalData.content);
        if (journalData.journal_date) formData.append('journal_date', journalData.journal_date);

        if (journalData.image) {
            formData.append('image', journalData.image);
        }

        const response = await api.post(`/journals/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-HTTP-Method-Override': 'PUT',
            },
        });
        return response.data;
    },

    // Delete journal
    delete: async (id) => {
        const response = await api.delete(`/journals/${id}`);
        return response.data;
    },

    // Export journal as PDF
    exportPdf: async (id) => {
        const response = await api.get(`/journals/${id}/export-pdf`, {
            responseType: 'blob',
        });

        const url     = window.URL.createObjectURL(new Blob([response.data]));
        const link    = document.createElement('a');
        link.href     = url;
        link.download = `journal-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

export default journalService;