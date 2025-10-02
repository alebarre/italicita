// src/services/api.ts
import { MenuItem, CartItem, Order, DeliveryData, User } from '../types';

const API_BASE_URL = 'http://192.168.0.11:5000/api';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

class ApiService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data: ApiResponse<T> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Products
    async getProducts(): Promise<MenuItem[]> {
        return this.request<MenuItem[]>('/products');
    }

    async getProductById(id: string): Promise<MenuItem> {
        return this.request<MenuItem>(`/products/${id}`);
    }

    // Orders
    async createOrder(orderData: {
        userId?: string;
        items: CartItem[];
        total: number;
        paymentMethod: 'card' | 'pix';
        deliveryData: DeliveryData;
    }): Promise<Order> {
        return this.request<Order>('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getOrderById(id: string): Promise<Order> {
        return this.request<Order>(`/orders/${id}`);
    }

    // Auth (mock para desenvolvimento)
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        return this.request<{ user: User; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(userData: {
        name: string;
        email: string;
        password: string;
        phone: string;
    }): Promise<{ user: User; token: string }> {
        return this.request<{ user: User; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }
}

export const apiService = new ApiService();