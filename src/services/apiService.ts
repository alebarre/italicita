// src/services/api.ts
import { MenuItem, CartItem, Order, DeliveryData, User } from '../types';

const API_BASE_URL = 'http://192.168.1.9:5000/api';

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

    // Payment methods
    async getPaymentConfig(): Promise<{
        expirationTime: number;
        instructions: string[];
        support: {
            phone: string;
            whatsapp: string;
            email: string;
            operatingHours: string;
        };
        pix: {
            merchantName: string;
            merchantCity: string;
            currency: string;
            countryCode: string;
        };
    }> {
        try {
            console.log("🔍 DEBUG - Buscando payment config...");

            const response = await this.request<{
                success: boolean;
                data: {
                    expirationTime: number;
                    instructions: string[];
                    support: {
                        phone: string;
                        whatsapp: string;
                        email: string;
                        operatingHours: string;
                    };
                    pix: {
                        merchantName: string;
                        merchantCity: string;
                        currency: string;
                        countryCode: string;
                    };
                };
            }>('/payments/config');

            console.log("✅ DEBUG - Config response:", response);

            // ✅ VERIFICAÇÃO DE SEGURANÇA
            if (!response || !response.data) {
                console.warn("⚠️ Config response inválida, retornando padrão");
                return this.getDefaultPaymentConfig();
            }

            return response.data;

        } catch (error) {
            console.error("❌ Erro ao buscar payment config:", error);
            // ✅ RETORNAR CONFIG PADRÃO EM CASO DE ERRO
            return this.getDefaultPaymentConfig();
        }
    }

    // ✅ ADICIONAR ESTA FUNÇÃO NO apiService
    private getDefaultPaymentConfig() {
        return {
            expirationTime: 30 * 60, // 30 minutos
            instructions: [
                "Abra o app do seu banco",
                "Acesse a área PIX",
                "Escaneie o QR Code ou cole o código",
                "Confirme o pagamento",
                "Aguarde a confirmação automática",
            ],
            support: {
                phone: "(11) 99999-9999",
                whatsapp: "5511999999999",
                email: "suporte@italicita.com",
                operatingHours: "11:00 às 22:00",
            },
            pix: {
                merchantName: "ITALICITA DELIVERY",
                merchantCity: "NITERÓI",
                currency: "986",
                countryCode: "BR",
            },
        };
    }

    async generatePixPayment(orderId: string, amount: number): Promise<{
        payload: string;
        qrCode: string;
        copyPaste: string;
        expiration: string;
        orderId: string;
        amount: number;
        createdAt: string;
    }> {
        try {
            console.log("🔍 DEBUG - Chamando generatePixPayment com:", { orderId, amount });

            // ✅ CORREÇÃO: O backend retorna os dados DIRETAMENTE, não dentro de {data}
            const pixData = await this.request<{
                payload: string;
                qrCode: string;
                copyPaste: string;
                expiration: string;
                orderId: string;
                amount: number;
                createdAt: string;
            }>('/payments/pix/generate', {
                method: 'POST',
                body: JSON.stringify({ orderId, amount }),
            });

            console.log("✅ DEBUG - Dados PIX recebidos diretamente:", pixData);

            // ✅ VERIFICAÇÃO DE SEGURANÇA
            if (!pixData) {
                throw new Error("Resposta da API é undefined");
            }

            if (!pixData.payload) {
                console.error("❌ DEBUG - pixData.payload é undefined");
                throw new Error("Payload PIX não gerado");
            }

            return pixData;

        } catch (error) {
            console.error("❌ DEBUG - Erro em generatePixPayment:", error);
            throw error;
        }
    }

    async getSupportInfo(): Promise<{
        support: {
            phone: string;
            whatsapp: string;
            email: string;
            operatingHours: string;
        };
        operatingHours: string;
    }> {
        // ✅ CORREÇÃO: Backend retorna {success, data} para esta rota  
        const response = await this.request<{
            success: boolean;
            data: {
                support: {
                    phone: string;
                    whatsapp: string;
                    email: string;
                    operatingHours: string;
                };
                operatingHours: string;
            };
        }>('/payments/support');

        return response.data;
    }

    async getPaymentStatus(orderId: string): Promise<{
        orderId: string;
        status: 'pending' | 'paid' | 'expired' | 'failed';
        lastChecked: string;
    }> {
        return this.request(`/payments/status/${orderId}`);
    }

}

export const apiService = new ApiService();