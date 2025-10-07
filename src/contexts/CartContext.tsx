import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  CartItem,
  MenuItem,
  calculateItemPrice,
  Order,
  DeliveryData,
} from "../types";
import { apiService } from "../services/apiService";

// Estado do carrinho
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Ações disponíveis
type CartAction =
  | {
      type: "ADD_ITEM";
      payload: {
        menuItem: MenuItem;
        customizations: Omit<
          CartItem,
          "id" | "menuItemId" | "name" | "basePrice" | "quantity" | "finalPrice"
        >;
      };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

// Context com estado e funções
interface CartContextData {
  state: CartState;
  addItem: (
    menuItem: MenuItem,
    customizations: Omit<
      CartItem,
      "id" | "menuItemId" | "name" | "basePrice" | "quantity" | "finalPrice"
    >
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderData: {
    paymentMethod: "card" | "pix";
    deliveryData: DeliveryData;
  }) => Promise<Order>;
}

// Criar Context
const CartContext = createContext<CartContextData | undefined>(undefined);

// Função auxiliar para gerar ID único baseado nas customizações
const generateItemId = (menuItemId: string, customizations: any): string => {
  const customizationString = JSON.stringify({
    pasta: customizations.selectedPasta?.id,
    size: customizations.selectedSize?.id,
    sauce: customizations.selectedSauce?.id,
    addOns: customizations.selectedAddOns?.map((a: any) => a.id) || [],
    extras: customizations.selectedExtras?.map((e: any) => e.id) || [],
  });

  // Gera um hash simples baseado nas customizações
  let hash = 0;
  for (let i = 0; i < customizationString.length; i++) {
    const char = customizationString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `${menuItemId}-${Math.abs(hash).toString(36).substring(0, 8)}`;
};

// Reducer para gerenciar estado
const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log(
    "Cart Action:",
    action.type,
    "payload" in action ? action.payload : undefined
  );

  switch (action.type) {
    case "ADD_ITEM": {
      const { menuItem, customizations } = action.payload;

      // Gera ID único baseado nas customizações
      const itemId = generateItemId(menuItem.id, customizations);

      const existingItem = state.items.find((item) => item.id === itemId);

      if (existingItem) {
        // Se item idêntico já existe, aumenta quantidade
        const updatedItems = state.items.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );

        return calculateTotals(updatedItems);
      } else {
        // Cria o item completo com preço calculado
        const baseItem = {
          id: itemId,
          menuItemId: menuItem.id,
          name: menuItem.name,
          basePrice: menuItem.basePrice,
          quantity: 1,
          ...customizations,
        };

        const finalItem: CartItem = {
          ...baseItem,
          finalPrice: calculateItemPrice(baseItem),
        };

        const updatedItems = [...state.items, finalItem];
        return calculateTotals(updatedItems);
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload
      );
      return calculateTotals(updatedItems);
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove se quantidade for 0 ou negativa
        const updatedItems = state.items.filter((item) => item.id !== id);
        return calculateTotals(updatedItems);
      }

      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      return calculateTotals(updatedItems);
    }

    case "CLEAR_CART":
      console.log("🛒 REDUCER: CLEAR_CART - resetando estado");
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };

    default:
      return state;
  }
};

// Função auxiliar para calcular totais
const calculateTotals = (items: CartItem[]): CartState => {
  const total = items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    total,
    itemCount,
  };
};

// Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  const addItem = (
    menuItem: MenuItem,
    customizations: Omit<
      CartItem,
      "id" | "menuItemId" | "name" | "basePrice" | "quantity" | "finalPrice"
    >
  ) => {
    console.log("🛒 ADD_ITEM with customizations:", {
      menuItem,
      customizations,
    });
    dispatch({ type: "ADD_ITEM", payload: { menuItem, customizations } });
  };

  const removeItem = (id: string) => {
    console.log("🛒 REMOVE_ITEM called with id:", id);
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    console.log("🛒 UPDATE_QUANTITY called:", id, quantity);
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    console.log("🔄 Carrinho limpo pelo contexto");
  };

  // ✅ FUNÇÃO PARA CRIAR PEDIDO NO BACKEND
  const createOrder = async (orderData: {
    paymentMethod: "card" | "pix";
    deliveryData: DeliveryData;
  }): Promise<Order> => {
    try {
      console.log("🛒 Criando pedido no backend...");

      const order = await apiService.createOrder({
        userId: "user-demo-1",
        items: state.items,
        total: state.total + 5.0, // ✅ Mesmo cálculo do frontend
        paymentMethod: orderData.paymentMethod,
        deliveryData: orderData.deliveryData,
      });

      console.log("✅ Pedido criado com sucesso:", order.id);

      // ✅ LIMPAR CARRINHO APÓS PEDIDO CRIADO
      dispatch({ type: "CLEAR_CART" });
      console.log("🔄 Carrinho limpo após criar pedido");

      return order;
    } catch (error) {
      console.error("❌ Erro ao criar pedido:", error);
      throw error;
    }
  };

  console.log("🛒 Current cart state:", state);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        createOrder, // ✅ Exportar a função
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar o Context
export const useCart = (): CartContextData => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
