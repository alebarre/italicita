import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { RootStackParamList, DeliveryData, CartItem } from "../types";
import { pixService } from "../services/pixService";

type PixPaymentScreenRouteProp = RouteProp<RootStackParamList, "PixPayment">;
type PixPaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PixPayment"
>;

const PixPaymentScreen: React.FC = () => {
  const navigation = useNavigation<PixPaymentScreenNavigationProp>();
  const route = useRoute<PixPaymentScreenRouteProp>();

  const {
    orderId = "IT000001",
    amount = 0,
    deliveryData = {} as DeliveryData,
    items = [] as CartItem[],
    clearCart, // ✅ Agora recebe clearCart dos params
  } = route.params || {};

  const [pixPayload, setPixPayload] = useState<string>("");
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [copyPasteCode, setCopyPasteCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30 * 60);

  useEffect(() => {
    generatePixCode();
    startCountdown();

    // Configurar o back handler corretamente
    const backAction = () => {
      showCancelAlert();
      return true; // Sempre retorna true para prevenir o comportamento padrão
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      backHandler.remove(); // Remove o listener quando o componente desmonta
    };
  }, []);

  // Função separada para mostrar o alerta de cancelamento
  const showCancelAlert = () => {
    Alert.alert(
      "Pagamento em Andamento",
      "Você tem um pagamento PIX pendente. Deseja realmente cancelar?",
      [
        {
          text: "Continuar Pagamento",
          style: "cancel",
          onPress: () => {}, // Não faz nada, só fecha o alerta
        },
        {
          text: "Cancelar Pedido",
          style: "destructive",
          onPress: () => {
            // Navega para MainTabs e limpa a stack de navegação
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          },
        },
      ]
    );
    return true;
  };

  const generatePixCode = async () => {
    try {
      setIsLoading(true);

      const pixInput = pixService.generateMockPixData(orderId, amount);
      const pixData = pixService.generatePixPayload(pixInput);

      setPixPayload(pixData.payload);
      setQrCodeValue(pixData.qrCode);
      setCopyPasteCode(pixData.copyPaste);
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      Alert.alert(
        "Erro",
        "Não foi possível gerar o código PIX. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExpiredPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleExpiredPayment = () => {
    Alert.alert(
      "Tempo Esgotado",
      "O código PIX expirou. Por favor, inicie um novo pedido.",
      [
        {
          text: "Fazer Novo Pedido",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(pixPayload);
      setCopied(true);

      Alert.alert(
        "Sucesso",
        "Código PIX copiado para a área de transferência!"
      );

      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Erro ao copiar código:", error);
      Alert.alert("Erro", "Não foi possível copiar o código PIX.");
    }
  };

  const handlePaymentConfirmed = () => {
    Alert.alert(
      "Pagamento Confirmado?",
      "Se você já realizou o pagamento PIX, seu pedido será preparado automaticamente.",
      [
        { text: "Ainda não paguei", style: "cancel" },
        {
          text: "Já efetuei o pagamento",
          onPress: () => {
            // ✅ LIMPA O CARRINHO ANTES DE NAVEGAR
            if (clearCart) {
              clearCart();
            }

            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });

            Alert.alert(
              "Pedido Confirmado!",
              `Seu pedido ${orderId} está sendo preparado. Você receberá atualizações pelo WhatsApp.`
            );
          },
        },
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert("Suporte", "Entre em contato pelo WhatsApp: (11) 99999-9999", [
      { text: "OK" },
    ]);
  };

  // Função para cancelar pedido manualmente (usada pelo botão)
  const handleCancelOrder = () => {
    Alert.alert(
      "Cancelar Pedido",
      "Tem certeza que deseja cancelar este pedido?",
      [
        {
          text: "Continuar Pagamento",
          style: "cancel",
        },
        {
          text: "Sim, Cancelar",
          style: "destructive",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingTitle}>Gerando código PIX...</Text>
        <Text style={styles.loadingText}>Aguarde um momento</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💰 Pagamento PIX</Text>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Tempo restante:</Text>
          <Text style={styles.timer}>{formatTime(countdown)}</Text>
        </View>
      </View>

      {/* Resumo do Pedido */}
      <View style={styles.orderSummary}>
        <Text style={styles.sectionTitle}>📋 Resumo do Pedido</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Nº do Pedido:</Text>
          <Text style={styles.summaryValue}>{orderId}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Valor Total:</Text>
          <Text style={styles.amount}>R$ {amount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Itens:</Text>
          <Text style={styles.summaryValue}>{items.length} itens</Text>
        </View>
      </View>

      {/* QR Code */}
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>📷 Escaneie o QR Code</Text>
        <View style={styles.qrContainer}>
          <QRCode
            value={qrCodeValue}
            size={220}
            color="#000000"
            backgroundColor="#FFFFFF"
          />
        </View>
        <Text style={styles.qrInstruction}>
          Abra o app do seu banco e escaneie o código acima
        </Text>
      </View>

      {/* Código PIX Copiável */}
      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>📋 Ou copie o código PIX</Text>
        <TouchableOpacity style={styles.codeContainer} onPress={handleCopyCode}>
          <Text style={styles.codeText} selectable>
            {copyPasteCode}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copiedButton]}
          onPress={handleCopyCode}
        >
          <Text style={styles.copyButtonText}>
            {copied ? "✓ Código Copiado!" : "📋 Copiar Código PIX"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instruções */}
      <View style={styles.instructions}>
        <Text style={styles.sectionTitle}>📝 Como pagar com PIX</Text>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Abra o app do seu banco</Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Acesse a área PIX</Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>
            Escaneie o QR Code ou cole o código
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepText}>
            Confirme o pagamento de R$ {amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>5</Text>
          <Text style={styles.stepText}>Aguarde a confirmação automática</Text>
        </View>

        <Text style={styles.note}>
          ⚡ O pagamento PIX é instantâneo. Seu pedido será preparado
          automaticamente.
        </Text>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePaymentConfirmed}
        >
          <Text style={styles.confirmButtonText}>
            ✅ Já efetuei o pagamento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportButton} onPress={handleSupport}>
          <Text style={styles.supportButtonText}>💬 Preciso de ajuda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelOrder} // Usa a nova função corrigida
        >
          <Text style={styles.cancelButtonText}>❌ Cancelar Pedido</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Mantenha os mesmos styles do arquivo anterior...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
    marginBottom: 10,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timerLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  timer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  orderSummary: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  qrSection: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  qrInstruction: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  codeSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 15,
  },
  codeText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#333",
    lineHeight: 16,
    textAlign: "center",
  },
  copyButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  copiedButton: {
    backgroundColor: "#2ecc71",
  },
  copyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructions: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e74c3c",
    color: "white",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "bold",
    marginRight: 12,
    fontSize: 12,
  },
  stepText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: "#e74c3c",
    fontStyle: "italic",
    marginTop: 15,
    lineHeight: 16,
    textAlign: "center",
  },
  actions: {
    gap: 10,
  },
  confirmButton: {
    backgroundColor: "#2ecc71",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  supportButton: {
    backgroundColor: "#3498db",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
  },
  supportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PixPaymentScreen;
