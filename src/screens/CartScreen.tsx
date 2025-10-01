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
import { useCart } from "../contexts/CartContext";
import { CartItem } from "../types";

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  const updateItemQuantity = (id: string, change: number) => {
    const item = state.items.find((item) => item.id === id);
    if (item) {
      const newQuantity = item.quantity + change;

      if (newQuantity <= 0) {
        handleRemoveItem(id);
      } else {
        updateQuantity(id, newQuantity);
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      "Remover item",
      "Tem certeza que deseja remover este item do carrinho?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => removeItem(id),
        },
      ]
    );
  };

  const handleClearCart = () => {
    if (state.items.length === 0) return;

    Alert.alert(
      "Limpar carrinho",
      "Tem certeza que deseja remover todos os itens do carrinho?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar Tudo",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const renderCustomizationDetail = (item: CartItem) => {
    const details = [];

    // Massa selecionada
    if (item.selectedPasta) {
      details.push(
        <Text key="pasta" style={styles.customizationText}>
          • Massa: {item.selectedPasta.name}{" "}
          {item.selectedPasta.priceAdjustment > 0
            ? `(+ R$ ${item.selectedPasta.priceAdjustment.toFixed(2)})`
            : ""}
        </Text>
      );
    }

    // Tamanho selecionado
    if (item.selectedSize) {
      details.push(
        <Text key="size" style={styles.customizationText}>
          • Tamanho: {item.selectedSize.name} {item.selectedSize.weight}{" "}
          {item.selectedSize.priceAdjustment > 0
            ? `(+ R$ ${item.selectedSize.priceAdjustment.toFixed(2)})`
            : ""}
        </Text>
      );
    }

    // Molho selecionado
    if (item.selectedSauce) {
      details.push(
        <Text key="sauce" style={styles.customizationText}>
          • Molho: {item.selectedSauce.name} {item.selectedSauce.weight} (+ R${" "}
          {item.selectedSauce.price.toFixed(2)})
        </Text>
      );
    }

    // Adicionais selecionados
    if (item.selectedAddOns.length > 0) {
      item.selectedAddOns.forEach((addOn, index) => {
        details.push(
          <Text key={`addon-${index}`} style={styles.customizationText}>
            • {addOn.name} {addOn.weight} (+ R$ {addOn.price.toFixed(2)})
          </Text>
        );
      });
    }

    // Extras selecionados
    if (item.selectedExtras.length > 0) {
      item.selectedExtras.forEach((extra, index) => {
        details.push(
          <Text key={`extra-${index}`} style={styles.customizationText}>
            • {extra.name} (+ R$ {extra.price.toFixed(2)})
          </Text>
        );
      });
    }

    return details;
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>

        {/* Customizações */}
        {renderCustomizationDetail(item)}

        <View style={styles.priceRow}>
          <Text style={styles.itemUnitPrice}>
            R$ {item.finalPrice.toFixed(2)} cada
          </Text>
          <Text style={styles.itemSubtotal}>
            Subtotal: R$ {(item.finalPrice * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateItemQuantity(item.id, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateItemQuantity(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const deliveryFee = 5.0;
  const finalTotal = state.total + deliveryFee;

  const proceedToCheckout = () => {
    if (state.items.length === 0) {
      Alert.alert(
        "Carrinho vazio",
        "Adicione itens ao carrinho antes de finalizar o pedido."
      );
      return;
    }

    navigation.navigate("Checkout" as never);
  };

  if (state.items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🛒 Carrinho Vazio</Text>
          <Text style={styles.emptyText}>
            Personalize e adicione algumas massas deliciosas ao seu carrinho!
          </Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("Home" as never)}
          >
            <Text style={styles.continueShoppingText}>Explorar Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.cartContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🛒 Meu Carrinho</Text>
          <TouchableOpacity
            style={styles.clearCartButton}
            onPress={handleClearCart}
          >
            <Text style={styles.clearCartText}>Limpar Tudo</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={state.items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>📊 Resumo do Pedido</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Itens ({state.itemCount})</Text>
            <Text style={styles.summaryValue}>R$ {state.total.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de Entrega</Text>
            <Text style={styles.summaryValue}>R$ {deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Detalhes dos Itens */}
        <View style={styles.itemsDetail}>
          <Text style={styles.detailTitle}>🧾 Itens no Carrinho</Text>
          {state.items.map((item, index) => (
            <View key={item.id} style={styles.detailItem}>
              <Text style={styles.detailItemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.detailItemPrice}>
                R$ {(item.finalPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={proceedToCheckout}
      >
        <Text style={styles.checkoutButtonText}>
          Finalizar Pedido - R$ {finalTotal.toFixed(2)}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  clearCartButton: {
    padding: 8,
    backgroundColor: "#ff6b6b",
    borderRadius: 6,
  },
  clearCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cartItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  customizationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  itemUnitPrice: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  itemSubtotal: {
    fontSize: 14,
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  itemsDetail: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailItemName: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
    lineHeight: 22,
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
