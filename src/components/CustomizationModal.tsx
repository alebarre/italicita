import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useCart } from "../contexts/CartContext";
import {
  MenuItem,
  PastaOption,
  SizeOption,
  SauceOption,
  AddOnOption,
  ExtraOption,
  CartItem,
  calculateItemPrice,
} from "../types";
import { getProductImage } from "../utils/imageLoader";

interface CustomizationModalProps {
  visible: boolean;
  menuItem: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: Omit<CartItem, "id">) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  visible,
  menuItem,
  onClose,
  onAddToCart,
}) => {
  const { addItem } = useCart();
  const [selectedPasta, setSelectedPasta] = useState<PastaOption | undefined>();
  const [selectedSize, setSelectedSize] = useState<SizeOption>();
  const [selectedSauce, setSelectedSauce] = useState<SauceOption | undefined>();
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);

  const defaultSizeFallback: SizeOption = {
    id: "size-default",
    name: "Junior",
    description: "Tamanho padrão",
    weight: "300g",
    priceAdjustment: 0,
    isAvailable: true,
  };

  useEffect(() => {
    if (menuItem && visible) {
      const defaultSize =
        menuItem.allowedSizes && menuItem.allowedSizes.length > 0
          ? menuItem.allowedSizes[0]
          : defaultSizeFallback;

      setSelectedSize(defaultSize);

      const defaultPastaFallback: PastaOption = {
        id: "pasta-default",
        name: "Massa Tradicional",
        description: "Massa padrão do prato",
        weight: "300g",
        priceAdjustment: 0,
        isAvailable: true,
      };

      if (menuItem.allowedPasta && menuItem.allowedPasta.length > 0) {
        setSelectedPasta(menuItem.allowedPasta[0]);
      }

      setSelectedSauce(undefined);
      setSelectedAddOns([]);
      setSelectedExtras([]);
    }
  }, [menuItem, visible]);

  const handleAddToCart = () => {
    if (!menuItem) return;

    if (!selectedSize) {
      Alert.alert(
        "Selecione um tamanho",
        "Por favor, escolha o tamanho do prato."
      );
      return;
    }

    if (
      menuItem.allowedPasta &&
      menuItem.allowedPasta.length > 0 &&
      !selectedPasta
    ) {
      Alert.alert("Selecione uma massa", "Por favor, escolha o tipo de massa.");
      return;
    }

    const customizations = {
      selectedPasta,
      selectedSize,
      selectedSauce,
      selectedAddOns,
      selectedExtras,
    };

    addItem(menuItem, customizations);

    Alert.alert("Sucesso!", "Item adicionado ao carrinho!", [
      { text: "OK", onPress: onClose },
    ]);
  };

  const toggleAddOn = (addOn: AddOnOption) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.id === addOn.id)
        ? prev.filter((a) => a.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const calculateCurrentPrice = (): number => {
    if (!menuItem) return 0;

    const tempItem: Omit<CartItem, "id" | "finalPrice"> = {
      menuItemId: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.basePrice,
      quantity: 1,
      selectedPasta,
      selectedSize: selectedSize || menuItem.allowedSizes[0],
      selectedSauce,
      selectedAddOns,
      selectedExtras,
    };

    return calculateItemPrice(tempItem);
  };

  const renderOptionSection = (
    title: string,
    options: any[],
    selected: any | any[],
    onSelect: (option: any) => void,
    isMultiple: boolean = false,
    renderOption: (option: any, isSelected: boolean) => React.ReactNode
  ) => {
    if (!options || options.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = isMultiple
              ? (selected as any[]).find((s) => s.id === option.id)
              : (selected as any)?.id === option.id;

            const isAvailable = option.isAvailable !== false;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  !isAvailable && styles.optionCardDisabled,
                ]}
                onPress={() => isAvailable && onSelect(option)}
                disabled={!isAvailable}
              >
                {renderOption(option, isSelected)}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (!menuItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Personalizar {menuItem.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* ✅ IMAGEM DO PRODUTO */}
          <View style={styles.imageSection}>
            <Image
              source={getProductImage(menuItem.images[0])}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{menuItem.name}</Text>
            <Text style={styles.itemDescription}>{menuItem.description}</Text>
            <Text style={styles.basePrice}>
              Preço base: R$ {menuItem.basePrice.toFixed(2)}
            </Text>
          </View>

          {renderOptionSection(
            "🍝 Escolha a Massa",
            menuItem.allowedPasta || [],
            selectedPasta,
            setSelectedPasta,
            false,
            (pasta: PastaOption, isSelected) => (
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>{pasta.name}</Text>
                  {pasta.priceAdjustment > 0 && (
                    <Text style={styles.optionPrice}>
                      + R$ {pasta.priceAdjustment.toFixed(2)}
                    </Text>
                  )}
                </View>
                <Text style={styles.optionDescription}>
                  {pasta.description}
                </Text>
                <Text style={styles.optionWeight}>{pasta.weight}</Text>
                {isSelected && (
                  <Text style={styles.selectedBadge}>✓ Selecionado</Text>
                )}
              </View>
            )
          )}

          {renderOptionSection(
            "📏 Escolha o Tamanho",
            menuItem.allowedSizes || [],
            selectedSize,
            setSelectedSize,
            false,
            (size: SizeOption, isSelected) => (
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>{size.name}</Text>
                  {size.priceAdjustment > 0 && (
                    <Text style={styles.optionPrice}>
                      + R$ {size.priceAdjustment.toFixed(2)}
                    </Text>
                  )}
                </View>
                <Text style={styles.optionDescription}>{size.description}</Text>
                <Text style={styles.optionWeight}>{size.weight}</Text>
                {isSelected && (
                  <Text style={styles.selectedBadge}>✓ Selecionado</Text>
                )}
              </View>
            )
          )}

          {renderOptionSection(
            "🥫 Escolha o Molho",
            menuItem.allowedSauces || [],
            selectedSauce,
            setSelectedSauce,
            false,
            (sauce: SauceOption, isSelected) => (
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>{sauce.name}</Text>
                  <Text style={styles.optionPrice}>
                    + R$ {sauce.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>
                  {sauce.description}
                </Text>
                <Text style={styles.optionWeight}>{sauce.weight}</Text>
                {isSelected && (
                  <Text style={styles.selectedBadge}>✓ Selecionado</Text>
                )}
              </View>
            )
          )}

          {renderOptionSection(
            "🍗 Adicionais",
            menuItem.allowedAddOns || [],
            selectedAddOns,
            toggleAddOn,
            true,
            (addOn: AddOnOption, isSelected) => (
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>{addOn.name}</Text>
                  <Text style={styles.optionPrice}>
                    + R$ {addOn.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>
                  {addOn.description}
                </Text>
                <Text style={styles.optionWeight}>{addOn.weight}</Text>
                {isSelected && (
                  <Text style={styles.selectedBadge}>✓ Adicionado</Text>
                )}
              </View>
            )
          )}

          {renderOptionSection(
            "🧀 Extras",
            menuItem.allowedExtras || [],
            selectedExtras,
            toggleExtra,
            true,
            (extra: ExtraOption, isSelected) => (
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>{extra.name}</Text>
                  <Text style={styles.optionPrice}>
                    + R$ {extra.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>
                  {extra.description}
                </Text>
                {isSelected && (
                  <Text style={styles.selectedBadge}>✓ Adicionado</Text>
                )}
              </View>
            )
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>
              R$ {calculateCurrentPrice().toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    backgroundColor: "white",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  itemInfo: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
    textAlign: "center",
  },
  basePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e74c3c",
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardSelected: {
    borderColor: "#e74c3c",
    backgroundColor: "#fff5f5",
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e74c3c",
    marginLeft: 10,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    lineHeight: 18,
  },
  optionWeight: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  selectedBadge: {
    fontSize: 12,
    color: "#2ecc71",
    fontWeight: "bold",
    marginTop: 5,
  },
  footer: {
    backgroundColor: "white",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  addButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomizationModal;
