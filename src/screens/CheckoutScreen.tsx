import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCart } from "../contexts/CartContext";
import { DeliveryData, PaymentData, RootStackParamList } from "../types";
import { whatsappService, OrderDetails } from "../services/whatsappService";

type CheckoutStep = "delivery" | "payment" | "review" | "success";

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("delivery");
  const [isLoading, setIsLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Estados do formulário
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    name: "",
    address: "",
    phone: "",
    complement: "",
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: "pix",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const deliveryFee = 5.0;
  const finalTotal = state.total + deliveryFee;

  // Validação dos passos
  const validateDeliveryData = (): boolean => {
    if (!deliveryData.name.trim()) {
      Alert.alert("Erro", "Por favor, informe seu nome completo.");
      return false;
    }
    if (!deliveryData.address.trim()) {
      Alert.alert("Erro", "Por favor, informe seu endereço de entrega.");
      return false;
    }
    if (!deliveryData.phone.trim()) {
      Alert.alert("Erro", "Por favor, informe seu telefone.");
      return false;
    }
    return true;
  };

  const validatePaymentData = (): boolean => {
    if (paymentData.method === "card") {
      if (!paymentData.cardNumber?.trim()) {
        Alert.alert("Erro", "Por favor, informe o número do cartão.");
        return false;
      }
      if (!paymentData.cardName?.trim()) {
        Alert.alert("Erro", "Por favor, informe o nome no cartão.");
        return false;
      }
      if (!paymentData.cardExpiry?.trim()) {
        Alert.alert("Erro", "Por favor, informe a validade do cartão.");
        return false;
      }
      if (!paymentData.cardCvv?.trim()) {
        Alert.alert("Erro", "Por favor, informe o CVV do cartão.");
        return false;
      }
    }
    return true;
  };

  // Navegação entre passos
  const goToNextStep = () => {
    if (currentStep === "delivery" && validateDeliveryData()) {
      setCurrentStep("payment");
    } else if (currentStep === "payment" && validatePaymentData()) {
      setCurrentStep("review");
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("delivery");
    } else if (currentStep === "review") {
      setCurrentStep("payment");
    }
  };

  // Gerar número de pedido único
  const generateOrderNumber = (): string => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `IT${timestamp}${random}`;
  };

  // Processar pagamento com cartão (fluxo WhatsApp)
  const processCardPayment = async () => {
    setIsLoading(true);

    try {
      // Gerar número do pedido
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);

      // Criar detalhes do pedido
      const orderDetails: OrderDetails = {
        orderNumber: newOrderNumber,
        items: state.items,
        total: finalTotal,
        deliveryData,
        paymentMethod: paymentData.method,
        deliveryFee,
      };

      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Abrir WhatsApp com detalhes do pedido
      const whatsappSuccess = await whatsappService.openWhatsAppWithOrder(
        orderDetails
      );

      if (whatsappSuccess) {
        setCurrentStep("success");
        clearCart();
      } else {
        Alert.alert(
          "Pedido Confirmado",
          `Seu pedido ${newOrderNumber} foi recebido, mas não foi possível abrir o WhatsApp. Entre em contato pelo telefone (11) 9999-9999.`,
          [{ text: "OK" }]
        );
        setCurrentStep("success");
        clearCart();
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      Alert.alert(
        "Erro",
        "Não foi possível processar seu pedido. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Processar pagamento com PIX
  const processPixPayment = () => {
    const orderNumber = generateOrderNumber();
    setOrderNumber(orderNumber);

    // Navegar para tela de pagamento PIX
    navigation.navigate("PixPayment", {
      orderId: orderNumber,
      amount: finalTotal,
      deliveryData,
      items: state.items,
    });

    // Limpar carrinho após navegação
    setTimeout(() => {
      clearCart();
    }, 1000);
  };

  // Finalizar pedido
  const handlePlaceOrder = async () => {
    if (paymentData.method === "pix") {
      processPixPayment();
    } else {
      await processCardPayment();
    }
  };

  // Renderizar conteúdo baseado no passo atual
  const renderStepContent = () => {
    switch (currentStep) {
      case "delivery":
        return renderDeliveryStep();
      case "payment":
        return renderPaymentStep();
      case "review":
        return renderReviewStep();
      case "success":
        return renderSuccessStep();
    }
  };

  // Passo 1: Dados de Entrega
  const renderDeliveryStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📦 Dados de Entrega</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput
          style={styles.input}
          value={deliveryData.name}
          onChangeText={(text) =>
            setDeliveryData({ ...deliveryData, name: text })
          }
          placeholder="Seu nome completo"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Endereço de Entrega *</Text>
        <TextInput
          style={styles.input}
          value={deliveryData.address}
          onChangeText={(text) =>
            setDeliveryData({ ...deliveryData, address: text })
          }
          placeholder="Rua, número, bairro"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Complemento</Text>
        <TextInput
          style={styles.input}
          value={deliveryData.complement}
          onChangeText={(text) =>
            setDeliveryData({ ...deliveryData, complement: text })
          }
          placeholder="Apartamento, bloco, referência"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Telefone *</Text>
        <TextInput
          style={styles.input}
          value={deliveryData.phone}
          onChangeText={(text) =>
            setDeliveryData({ ...deliveryData, phone: text })
          }
          placeholder="(11) 99999-9999"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  // Passo 2: Pagamento
  const renderPaymentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>💳 Forma de Pagamento</Text>

      <View style={styles.paymentMethods}>
        <TouchableOpacity
          style={[
            styles.paymentMethod,
            paymentData.method === "pix" && styles.paymentMethodActive,
          ]}
          onPress={() => setPaymentData({ ...paymentData, method: "pix" })}
        >
          <Text style={styles.paymentMethodText}>PIX</Text>
          <Text style={styles.paymentMethodDescription}>
            Pagamento instantâneo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethod,
            paymentData.method === "card" && styles.paymentMethodActive,
          ]}
          onPress={() => setPaymentData({ ...paymentData, method: "card" })}
        >
          <Text style={styles.paymentMethodText}>Cartão</Text>
          <Text style={styles.paymentMethodDescription}>Crédito/Débito</Text>
        </TouchableOpacity>
      </View>

      {paymentData.method === "card" && (
        <View style={styles.cardForm}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Número do Cartão</Text>
            <TextInput
              style={styles.input}
              value={paymentData.cardNumber}
              onChangeText={(text) =>
                setPaymentData({ ...paymentData, cardNumber: text })
              }
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome no Cartão</Text>
            <TextInput
              style={styles.input}
              value={paymentData.cardName}
              onChangeText={(text) =>
                setPaymentData({ ...paymentData, cardName: text })
              }
              placeholder="Como está no cartão"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Validade</Text>
              <TextInput
                style={styles.input}
                value={paymentData.cardExpiry}
                onChangeText={(text) =>
                  setPaymentData({ ...paymentData, cardExpiry: text })
                }
                placeholder="MM/AA"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={paymentData.cardCvv}
                onChangeText={(text) =>
                  setPaymentData({ ...paymentData, cardCvv: text })
                }
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        </View>
      )}

      {paymentData.method === "pix" && (
        <View style={styles.pixInfo}>
          <Text style={styles.pixDescription}>
            Você será redirecionado para uma tela segura de pagamento PIX. O
            pedido será confirmado automaticamente após o pagamento.
          </Text>
        </View>
      )}
    </View>
  );

  // Passo 3: Revisão do Pedido
  const renderReviewStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📋 Revise seu Pedido</Text>

      <View style={styles.orderSummary}>
        <Text style={styles.sectionTitle}>Itens do Pedido</Text>
        {state.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.orderItemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.orderItemPrice}>
              R$ {(item.basePrice * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.deliveryInfo}>
        <Text style={styles.sectionTitle}>Entrega</Text>
        <Text style={styles.deliveryText}>{deliveryData.name}</Text>
        <Text style={styles.deliveryText}>{deliveryData.address}</Text>
        {deliveryData.complement && (
          <Text style={styles.deliveryText}>{deliveryData.complement}</Text>
        )}
        <Text style={styles.deliveryText}>{deliveryData.phone}</Text>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.sectionTitle}>Pagamento</Text>
        <Text style={styles.paymentText}>
          {paymentData.method === "pix" ? "PIX" : "Cartão"}
        </Text>
        {paymentData.method === "card" && paymentData.cardNumber && (
          <Text style={styles.paymentText}>
            **** **** **** {paymentData.cardNumber.slice(-4)}
          </Text>
        )}
      </View>

      <View style={styles.finalSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
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
    </View>
  );

  // Passo 4: Sucesso (apenas para pagamento com cartão)
  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>🎉</Text>
      <Text style={styles.successTitle}>Pedido Confirmado!</Text>
      <Text style={styles.successMessage}>
        Seu pedido #{orderNumber} foi recebido e está sendo preparado.
      </Text>

      <Text style={styles.successInfo}>
        Verifique a conversa no WhatsApp para acompanhar seu pedido.
      </Text>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={async () => {
          // Reabrir WhatsApp
          const orderDetails: OrderDetails = {
            orderNumber,
            items: [],
            total: finalTotal,
            deliveryData,
            paymentMethod: paymentData.method,
            deliveryFee,
          };
          await whatsappService.openWhatsAppWithOrder(orderDetails);
        }}
      >
        <Text style={styles.whatsappButtonText}>📱 Ver Pedido no WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate("MainTabs")}
      >
        <Text style={styles.continueButtonText}>🍝 Fazer Novo Pedido</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {currentStep !== "success" && (
        <View style={styles.header}>
          <Text style={styles.title}>Finalizar Pedido</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        {currentStep !== "success" && (
          <View style={styles.stepIndicator}>
            <View
              style={[
                styles.step,
                currentStep === "delivery" && styles.stepActive,
              ]}
            >
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View
              style={[
                styles.step,
                currentStep === "payment" && styles.stepActive,
              ]}
            >
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={styles.stepLine} />
            <View
              style={[
                styles.step,
                currentStep === "review" && styles.stepActive,
              ]}
            >
              <Text style={styles.stepText}>3</Text>
            </View>
          </View>
        )}

        {renderStepContent()}
      </ScrollView>

      {currentStep !== "success" && currentStep !== "review" && (
        <View style={styles.footer}>
          {currentStep !== "delivery" && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={goToPreviousStep}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={goToNextStep}>
            <Text style={styles.nextButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentStep === "review" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousStep}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, styles.confirmButton]}
            onPress={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {paymentData.method === "pix"
                  ? "Pagar com PIX"
                  : "Confirmar Pedido"}
              </Text>
            )}
          </TouchableOpacity>
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
  header: {
    backgroundColor: "#e74c3c",
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: {
    backgroundColor: "#e74c3c",
  },
  stepText: {
    color: "white",
    fontWeight: "bold",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 10,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethod: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  paymentMethodActive: {
    borderColor: "#e74c3c",
    backgroundColor: "#fff5f5",
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cardForm: {
    marginTop: 10,
  },
  pixInfo: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  pixDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  orderSummary: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  deliveryInfo: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  paymentInfo: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  deliveryText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  finalSummary: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 8,
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
  footer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },
  backButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  nextButton: {
    flex: 2,
    padding: 15,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#2ecc71",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2ecc71",
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
    lineHeight: 22,
  },
  successInfo: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    lineHeight: 20,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  whatsappButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
