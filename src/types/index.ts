export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: 'massas' | 'acompanhamentos' | 'bebidas' | 'sobremesas';
    image?: string;
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: 'preparing' | 'on_the_way' | 'delivered' | 'canceled';
    createdAt: Date;
    deliveryAddress: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: 'card' | 'pix';
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface PaymentData {
    method: 'card' | 'pix';
    cardNumber?: string;
    cardName?: string;
    cardExpiry?: string;
    cardCvv?: string;
}

export interface DeliveryData {
    name: string;
    address: string;
    phone: string;
    complement?: string;
}


// Tipos para navegação
export type RootStackParamList = {
    MainTabs: undefined;
    Checkout: undefined;
};

export type RootTabParamList = {
    Home: undefined;
    Cart: undefined;
    Orders: undefined;
    Profile: undefined;
};