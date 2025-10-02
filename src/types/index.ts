// Tipos para navegação (mantemos os existentes)
export type RootStackParamList = {
    MainTabs: undefined;
    Checkout: undefined;
    PixPayment: {
        orderId: string;
        amount: number;
        deliveryData: DeliveryData;
        items: CartItem[];
        clearCart?: () => void; // ✅ Adiciona clearCart opcional
    };
};

export type RootTabParamList = {
    Home: undefined;
    Cart: undefined;
    Orders: undefined;
    Profile: undefined;
};

// Tipos principais do sistema
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    category: ProductCategory;
    basePrice: number;
    images: string[];
    isAvailable: boolean;
    preparationTime: number; // em minutos
    tags: string[];
    // Configurações específicas do prato
    allowedPasta?: PastaOption[]; // Massas permitidas para este prato
    allowedSizes: SizeOption[]; // Tamanhos disponíveis
    allowedSauces?: SauceOption[]; // Molhos disponíveis
    allowedAddOns?: AddOnOption[]; // Adicionais disponíveis
    allowedExtras?: ExtraOption[]; // Extras disponíveis
}

// Categorias de produtos
export type ProductCategory =
    | 'massas'
    | 'risotos'
    | 'carnes'
    | 'saladas'
    | 'sobremesas'
    | 'bebidas'
    | 'acompanhamentos';

// Opção de Massa
export interface PastaOption {
    id: string;
    name: string;
    description: string;
    weight: string; // ex: "300g", "400g"
    priceAdjustment: number; // pode ser 0 se não tiver acréscimo
    isAvailable: boolean;
}

// Opção de Tamanho
export interface SizeOption {
    id: string;
    name: 'Junior' | 'Adulto';
    description: string;
    weight: string; // ex: "300g", "500g"
    priceAdjustment: number; // Junior: 0, Adulto: valor variável
    isAvailable: boolean;
}

// Opção de Molho
export interface SauceOption {
    id: string;
    name: string;
    description: string;
    weight: string; // ex: "50ml", "100ml"
    price: number; // preço adicional
    isAvailable: boolean;
}

// Item Adicional (com peso)
export interface AddOnOption {
    id: string;
    name: string;
    description: string;
    weight: string; // ex: "100g", "2 unidades"
    price: number; // preço adicional
    isAvailable: boolean;
}

// Item Extra (sem peso)
export interface ExtraOption {
    id: string;
    name: string;
    description: string;
    price: number; // preço adicional
    isAvailable: boolean;
}

// Item do Carrinho com customizações
export interface CartItem {
    id: string; // ID único do item no carrinho
    menuItemId: string; // Referência ao item do menu
    name: string;
    basePrice: number;
    quantity: number;

    // Customizações escolhidas
    selectedPasta?: PastaOption;
    selectedSize: SizeOption;
    selectedSauce?: SauceOption;
    selectedAddOns: AddOnOption[];
    selectedExtras: ExtraOption[];

    // Preço calculado
    finalPrice: number;
}

// Função para calcular preço final de um item
export const calculateItemPrice = (item: Omit<CartItem, 'id' | 'finalPrice'>): number => {
    let price = item.basePrice;

    // Adiciona ajuste da massa (se houver)
    if (item.selectedPasta) {
        price += item.selectedPasta.priceAdjustment;
    }

    // Adiciona ajuste do tamanho
    price += item.selectedSize.priceAdjustment || 0;

    // Adiciona preço do molho (se houver)
    if (item.selectedSauce) {
        price += item.selectedSauce.price || 0;
    }

    // Adiciona preços dos adicionais
    item.selectedAddOns.forEach(addOn => {
        price += addOn.price || 0;
    });

    // Adiciona preços dos extras
    item.selectedExtras.forEach(extra => {
        price += extra.price || 0;
    });

    return price;
};

// Tipos existentes (mantemos para compatibilidade)
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