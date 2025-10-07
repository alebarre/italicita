import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCart } from "../contexts/CartContext";
import { MenuItem, RootTabParamList } from "../types";
import { apiService } from "../services/apiService";
import { getProductImage } from "../utils/imageLoader";

// ✅ CATEGORIAS DISPONÍVEIS
const CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: "all", label: "Todos", emoji: "🍽️" },
  { key: "massas", label: "Massas", emoji: "🍝" },
  { key: "risotos", label: "Risotos", emoji: "🍚" },
  { key: "carnes", label: "Carnes", emoji: "🥩" },
  { key: "saladas", label: "Saladas", emoji: "🥗" },
  { key: "sobremesas", label: "Sobremesas", emoji: "🍰" },
  { key: "bebidas", label: "Bebidas", emoji: "🥤" },
];

const HomeScreen: React.FC = () => {
  const { addItem, state } = useCart();
  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>();
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await apiService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA ADICIONAR COM FEEDBACK
  const handleAddItem = (item: MenuItem) => {
    addItem(item, {
      selectedSize: item.allowedSizes[0],
      selectedAddOns: [],
      selectedExtras: [],
    });

    Alert.alert("✅ Adicionado!", `${item.name} foi adicionado ao carrinho!`, [
      { text: "Continuar Comprando", style: "cancel" },
      {
        text: "Ver Carrinho",
        onPress: () => navigation.navigate("Cart"),
      },
    ]);
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const renderCategoryItem = ({ item }: { item: (typeof CATEGORIES)[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.key && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text
        style={[
          styles.categoryLabel,
          selectedCategory === item.key && styles.categoryLabelActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleAddItem(item)}
    >
      <Image
        source={getProductImage(item.images[0])}
        style={styles.productImage}
        resizeMode="cover"
      />

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.productPrice}>R$ {item.basePrice.toFixed(2)}</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddItem(item)}
        >
          <Text style={styles.addButtonText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ HEADER COM CARRINHO */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🍝 Italicita Delivery</Text>
          <Text style={styles.headerSubtitle}>Cardápio</Text>
        </View>

        {/* ✅ BADGE DO CARRINHO */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {state.itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {state.itemCount > 99 ? "99+" : state.itemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ✅ CATEGORIAS */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* ✅ PRODUTOS */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all"
            ? "Todos os Produtos"
            : CATEGORIES.find((cat) => cat.key === selectedCategory)?.label}
        </Text>

        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#e74c3c",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    marginTop: 5,
  },
  cartButton: {
    padding: 10,
    position: "relative",
  },
  cartIcon: {
    fontSize: 24,
    color: "white",
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
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
  categoriesSection: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    paddingHorizontal: 15,
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    alignItems: "center",
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    minWidth: 70,
  },
  categoryButtonActive: {
    backgroundColor: "#e74c3c",
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  categoryLabelActive: {
    color: "white",
  },
  productsSection: {
    flex: 1,
    padding: 15,
  },
  productsGrid: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  productDescription: {
    fontSize: 11,
    color: "#666",
    marginBottom: 8,
    lineHeight: 14,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default HomeScreen;
