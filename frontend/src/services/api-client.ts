import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { buildApiUrl } from '@/config/api';

// Extended interface for request metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime?: Date;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
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
  private retryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: any) => {
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }
  };

  constructor() {
    this.client = axios.create({
      baseURL: buildApiUrl(''),
      timeout: 15000, // Increased timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
          const config = response.config as ExtendedAxiosRequestConfig;
          const duration = new Date().getTime() - config.metadata?.startTime?.getTime() || 0;
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
            status: response.status,
            data: response.data,
          });
        }
        
        return response;
      },
      async (error) => {
        // Log error in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Handle retry logic
        const config = error.config;
        if (!config || !this.retryConfig.retryCondition(error)) {
          return this.handleError(error);
        }

        config.__retryCount = config.__retryCount || 0;
        
        if (config.__retryCount >= this.retryConfig.retries) {
          return this.handleError(error);
        }

        config.__retryCount += 1;
        
        // Exponential backoff
        const delay = this.retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.client(config);
      }
    );
  }

  // Generic request methods with retry logic
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return { success: true, data: response.data, statusCode: response.status };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return { success: true, data: response.data, statusCode: response.status };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return { success: true, data: response.data, statusCode: response.status };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return { success: true, data: response.data, statusCode: response.status };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const errorDetail = error.response?.data?.error || error;

    // Handle specific error cases
    if (statusCode === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (statusCode === 403) {
      // Forbidden - insufficient permissions
      console.error('Access forbidden: Insufficient permissions');
    }

    if (statusCode === 404) {
      // Not found
      console.error('Resource not found');
    }

    if (statusCode >= 500) {
      // Server error
      console.error('Server error occurred');
    }

    return {
      success: false,
      message,
      error: errorDetail,
      statusCode,
    };
  }

  // Health check method
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('health');
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
    apiClient.post<Bet>('bets', data),
  getUserBets: (userId: string) => apiClient.get<Bet[]>(`bets/user/${userId}`),
};

export const resolutionApi = {
  resolveMarket: (marketId: string) => apiClient.post(`resolution/resolve/${marketId}`),
  manualResolve: (marketId: string, outcome: number, reason: string) =>
    apiClient.post(`resolution/manual-resolve/${marketId}`, { outcome, reason }),
  getPendingMarkets: () => apiClient.get<Market[]>('resolution/pending'),
};

export const authApi = {
  login: (walletAddress: string) => 
    apiClient.post<{ token: string; user: User }>('auth/login', { walletAddress }),
  register: (data: { walletAddress: string; username?: string; email?: string }) =>
    apiClient.post<{ token: string; user: User }>('auth/register', data),
  getProfile: () => apiClient.get<User>('auth/profile'),
};
