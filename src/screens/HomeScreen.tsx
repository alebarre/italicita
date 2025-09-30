import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MenuItem } from "../types";
import { useCart } from "../contexts/CartContext";

const HomeScreen: React.FC = () => {
  const { state, addItem } = useCart();

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
    {
      id: 6,
      name: "Tiramisu",
      description: "Sobremesa italiana clássica",
      price: 16.9,
      category: "sobremesas",
    },
    {
      id: 7,
      name: "Refrigerante 2L",
      description: "Coca-Cola, Guaraná ou Fanta",
      price: 10.9,
      category: "bebidas",
    },
  ];

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => addItem(item)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const getItemsByCategory = (category: MenuItem["category"]) => {
    return menuItems.filter((item) => item.category === category);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>🍝 Massas Especiais</Text>
        <FlatList
          data={getItemsByCategory("massas")}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>🥗 Acompanhamentos</Text>
        <FlatList
          data={getItemsByCategory("acompanhamentos")}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>🍰 Sobremesas</Text>
        <FlatList
          data={getItemsByCategory("sobremesas")}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>🥤 Bebidas</Text>
        <FlatList
          data={getItemsByCategory("bebidas")}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </ScrollView>

      {state.itemCount > 0 && (
        <View style={styles.cartSummary}>
          <Text style={styles.cartText}>
            {state.itemCount} {state.itemCount === 1 ? "item" : "itens"} no
            carrinho
          </Text>
          <Text style={styles.cartTotal}>
            Total: R$ {state.total.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Mesmos styles do anterior
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
