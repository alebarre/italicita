import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MenuItem, CartItem } from "../types";

const HomeScreen: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: "Fettuccine Alfredo",
      description: "Massa fresca com molho cremoso de queijo parmesão",
      price: 32.9,
      category: "massas",
    },
    {
      id: 2,
      name: "Lasanha Bolonhesa",
      description: "Camadas de massa com carne moída e molho de tomate",
      price: 38.5,
      category: "massas",
    },
    {
      id: 3,
      name: "Spaghetti Carbonara",
      description: "Massa com bacon, ovos e queijo pecorino",
      price: 35.9,
      category: "massas",
    },
    {
      id: 4,
      name: "Pão de Alho",
      description: "4 unidades",
      price: 12.9,
      category: "acompanhamentos",
    },
    {
      id: 5,
      name: "Salada Caesar",
      description: "Alface, croutons e molho especial",
      price: 18.9,
      category: "acompanhamentos",
    },
  ];

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Massas Especiais</Text>
        <FlatList
          data={menuItems.filter((item) => item.category === "massas")}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Acompanhamentos</Text>
        <FlatList
          data={menuItems.filter((item) => item.category === "acompanhamentos")}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </ScrollView>

      {totalItems > 0 && (
        <View style={styles.cartSummary}>
          <Text style={styles.cartText}>
            {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
          </Text>
          <Text style={styles.cartTotal}>
            Total: R$ {totalPrice.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  menuContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#f39c12",
    paddingBottom: 5,
  },
  menuItem: {
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
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  addButton: {
    backgroundColor: "#e74c3c",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  cartSummary: {
    backgroundColor: "white",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartText: {
    fontSize: 16,
    color: "#333",
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
  },
});

export default HomeScreen;
