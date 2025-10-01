import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";
import { MenuItem, ProductCategory } from "../types";
import { menuItems } from "../data/mockData";
import CustomizationModal from "../components/CustomizationModal";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state } = useCart();
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("massas");
  const [customizationModalVisible, setCustomizationModalVisible] =
    useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );

  // Categorias disponíveis
  const categories: { id: ProductCategory; name: string; emoji: string }[] = [
    { id: "massas", name: "Massas", emoji: "🍝" },
    { id: "risotos", name: "Risotos", emoji: "🍚" },
    { id: "carnes", name: "Carnes", emoji: "🥩" },
    { id: "saladas", name: "Saladas", emoji: "🥗" },
    { id: "sobremesas", name: "Sobremesas", emoji: "🍰" },
    { id: "bebidas", name: "Bebidas", emoji: "🥤" },
    { id: "acompanhamentos", name: "Acompanhamentos", emoji: "🍟" },
  ];

  // Filtra itens por categoria
  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  const handleAddToCart = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setCustomizationModalVisible(true);
  };

  const handleCustomizationComplete = (cartItem: any) => {
    // Esta função será chamada pelo modal quando o usuário finalizar a customização
    // O cartItem já vem com todas as customizações e preço calculado
    console.log("Item customizado adicionado:", cartItem);
    setCustomizationModalVisible(false);
    setSelectedMenuItem(null);
  };

  const renderCategoryItem = ({ item }: { item: (typeof categories)[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.categoryNameActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      {/* Imagem do prato */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>📷</Text>
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Informações de personalização disponível */}
        <View style={styles.customizationInfo}>
          {item.allowedPasta && item.allowedPasta.length > 0 && (
            <Text style={styles.customizationText}>⚙️ Escolha a massa</Text>
          )}
          {item.allowedSauces && item.allowedSauces.length > 0 && (
            <Text style={styles.customizationText}>🥫 Molhos disponíveis</Text>
          )}
          {item.allowedAddOns && item.allowedAddOns.length > 0 && (
            <Text style={styles.customizationText}>
              🍗 Adicionais opcionais
            </Text>
          )}
          <Text style={styles.customizationText}>
            📏 Tamanhos: {item.allowedSizes.map((s) => s.name).join(", ")}
          </Text>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>
            A partir de R$ {item.basePrice.toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>Personalizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header com carrinho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍝 Italicita Delivery</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart" as never)}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {state.itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{state.itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categorias */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Lista de Itens */}
      <View style={styles.menuContainer}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🍽️</Text>
            <Text style={styles.emptyStateText}>
              Nenhum item encontrado nesta categoria
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Em breve teremos novidades!
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuList}
          />
        )}
      </View>

      {/* Modal de Customização */}
      <CustomizationModal
        visible={customizationModalVisible}
        menuItem={selectedMenuItem}
        onClose={() => {
          setCustomizationModalVisible(false);
          setSelectedMenuItem(null);
        }}
        onAddToCart={handleCustomizationComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingTop: 50, // Para status bar
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  cartButton: {
    position: "relative",
    padding: 8,
  },
  cartIcon: {
    fontSize: 20,
    color: "white",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#2ecc71",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  categoriesContainer: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    minWidth: 80,
  },
  categoryItemActive: {
    backgroundColor: "#e74c3c",
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  categoryNameActive: {
    color: "white",
  },
  menuContainer: {
    flex: 1,
    padding: 15,
  },
  menuList: {
    paddingBottom: 20,
  },
  menuItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 160, // Aumentei um pouco para melhor visualização
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 40,
    color: "#ccc",
  },
  itemInfo: {
    padding: 15,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 5,
  },
  tag: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: "#3498db",
    fontWeight: "600",
    textTransform: "lowercase",
  },
  customizationInfo: {
    marginBottom: 15,
  },
  customizationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  addButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default HomeScreen;
