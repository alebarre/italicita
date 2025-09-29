import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CartItem } from "../types";

// Mock data - depois substituiremos por Context API
const mockCart: CartItem[] = [
  {
    id: 1,
    name: "Fettuccine Alfredo",
    price: 32.9,
    quantity: 2,
  },
  {
    id: 4,
    name: "Pão de Alho",
    price: 12.9,
    quantity: 1,
  },
];

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const [cart, setCart] = React.useState<CartItem[]>(mockCart);

  const updateQuantity = (id: number, change: number) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex((item) => item.id === id);

      if (itemIndex === -1) return prevCart;

      const newCart = [...prevCart];
      const newQuantity = newCart[itemIndex].quantity + change;

      if (newQuantity <= 0) {
        // Remove item se quantidade for 0
        newCart.splice(itemIndex, 1);
      } else {
        // Atualiza quantidade
        newCart[itemIndex] = {
          ...newCart[itemIndex],
          quantity: newQuantity,
        };
      }

      return newCart;
    });
  };

  const removeItem = (id: number) => {
    Alert.alert(
      "Remover item",
      "Tem certeza que deseja remover este item do carrinho?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            setCart((prevCart) => prevCart.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert(
        "Carrinho vazio",
        "Adicione itens ao carrinho antes de finalizar o pedido."
      );
      return;
    }

    // Navegar para tela de checkout (vamos criar depois)
    Alert.alert("Checkout", "Redirecionando para checkout...");
  };

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Carrinho Vazio</Text>
          <Text style={styles.emptyText}>
            Adicione algumas massas deliciosas ao seu carrinho!
          </Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("Home" as never)}
          >
            <Text style={styles.continueShoppingText}>Continuar Comprando</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.cartContainer}>
        <Text style={styles.title}>Meu Carrinho</Text>

        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Itens ({totalItems})</Text>
            <Text style={styles.summaryValue}>R$ {totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de Entrega</Text>
            <Text style={styles.summaryValue}>R$ 5,00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              R$ {(totalPrice + 5).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={proceedToCheckout}
      >
        <Text style={styles.checkoutButtonText}>
          Finalizar Pedido - R$ {(totalPrice + 5).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  cartContainer: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  cartItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityButton: {
    backgroundColor: "#f0f0f0",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: {
    backgroundColor: "#ff6b6b",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  summary: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  checkoutButton: {
    backgroundColor: "#e74c3c",
    padding: 20,
    margin: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#999",
    marginBottom: 30,
  },
  continueShoppingButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CartScreen;
