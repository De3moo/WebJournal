import api from './api';

const dashboardService = {

    getStats: async () => {
        const response = await api.get('/dashboard');
        return response.data;
    },


    getCounts: async () => {
        const data = await dashboardService.getStats();
        return data.stats;
    },


    getMonthlyBreakdown: async () => {
        const data = await dashboardService.getStats();
        return data.monthly_breakdown;
    },


    getJournalDates: async () => {
        const data = await dashboardService.getStats();
        return data.journal_dates;
    },


    getRecentJournals: async () => {
        const data = await dashboardService.getStats();
        return data.recent_journals;
    },
};

export default dashboardService;