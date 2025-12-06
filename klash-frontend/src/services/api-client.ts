import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildApiUrl } from '@/config/api';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Market types
export interface Market {
  marketId: string;
  question: string;
  outcomes: string[];
  originalTweetId: string;
  originalTweetText: string;
  originalTweetAuthor: string;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
  closingTime: string;
  resolutionTime?: string;
  winningOutcome?: number;
  pools: {
    total: number;
    outcomeA: number;
    outcomeB: number;
  };
  metadata: {
    category: string;
    tags: string[];
    controversyScore: number;
    createdBy: string;
  };
  totalBets: number;
  uniqueBettors: number;
  createdAt: string;
  updatedAt: string;
  trending?: boolean;
  isLive?: boolean;
}

// Bet types
export interface Bet {
  betId: string;
  userId: string;
  marketId: string;
  outcome: number;
  amount: number;
  walletAddress: string;
  status: 'PENDING' | 'ACTIVE' | 'WON' | 'LOST' | 'REFUNDED' | 'PAID';
  payout?: number;
  profit?: number;
  transactionHash?: string;
  placedAt: string;
  resolvedAt?: string;
  paidAt?: string;
  odds: {
    atPlacement: number;
    poolRatio: number;
  };
}

// User types
export interface User {
  userId: string;
  walletAddress: string;
  username?: string;
  email?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  stats: {
    totalBets: number;
    totalWon: number;
    totalLost: number;
    totalProfit: number;
    winRate: number;
  };
  createdAt: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    console.log("ApiClient Base URL:", buildApiUrl(''));
    this.client = axios.create({
      baseURL: buildApiUrl(''),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const errorDetail = error.response?.data?.error || error;

    return {
      success: false,
      message,
      error: errorDetail,
    };
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export specific API methods
export const marketApi = {
  getMarkets: () => apiClient.get<Market[]>('markets'),
  getMarket: (id: string) => apiClient.get<Market>(`markets/${id}`),
  createMarket: (data: Partial<Market>) => apiClient.post<Market>('markets', data),
};

export const betApi = {
  placeBet: (data: { marketId: string; outcome: number; amount: number; walletAddress: string }) =>
    apiClient.post<Bet>(`markets/${data.marketId}/bets`, data),
  getUserBets: (userId: string) => apiClient.get<Bet[]>(`users/${userId}/bets`),
};

export const resolutionApi = {
  resolveMarket: (marketId: string) => apiClient.post(`resolution/resolve/${marketId}`),
  manualResolve: (marketId: string, outcome: number, reason: string) =>
    apiClient.post(`resolution/manual-resolve/${marketId}`, { outcome, reason }),
  getPendingMarkets: () => apiClient.get<Market[]>('resolution/pending'),
};

export const authApi = {
  login: (walletAddress: string) => apiClient.post<{ token: string; user: User }>('auth/login', { walletAddress }),
  register: (data: { walletAddress: string; username?: string; email?: string }) =>
    apiClient.post<{ token: string; user: User }>('auth/register', data),
  getProfile: () => apiClient.get<User>('auth/profile'),
};
