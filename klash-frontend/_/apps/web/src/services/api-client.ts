import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const marketApi = {
    getAll: async () => {
        const response = await apiClient.get('/api/markets');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await apiClient.get(`/api/markets/${id}`);
        return response.data;
    },
};

export const betApi = {
    placeBet: async (data: any) => {
        const response = await apiClient.post('/api/bets', data);
        return response.data;
    },
    getUserBets: async (wallet: string) => {
        const response = await apiClient.get(`/api/bets/portfolio/${wallet}`); // Adjusted based on previous backend investigation
        return response.data;
    },
    getPortfolio: async (wallet: string) => {
        const response = await apiClient.get(`/api/bets/portfolio/${wallet}`);
        return response.data;
    }
};
