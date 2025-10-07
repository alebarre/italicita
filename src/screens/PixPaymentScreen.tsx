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
import { apiService } from "../services/apiService";
import { useCart } from "../contexts/CartContext";

type PixPaymentScreenRouteProp = RouteProp<RootStackParamList, "PixPayment">;
type PixPaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PixPayment"
>;

const PixPaymentScreen: React.FC = () => {
  const { clearCart, state } = useCart();
  const navigation = useNavigation<PixPaymentScreenNavigationProp>();
  const route = useRoute<PixPaymentScreenRouteProp>();

  // ✅ CORREÇÃO: Garantir que os parâmetros sejam extraídos corretamente
  const {
    orderId = "IT000001",
    amount = 0,
    deliveryData = {} as DeliveryData,
    items = [] as CartItem[],
  } = route.params || {};

  const [pixPayload, setPixPayload] = useState<string>("");
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [copyPasteCode, setCopyPasteCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30 * 60);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [supportInfo, setSupportInfo] = useState<any>(null);

  useEffect(() => {
    console.log("🔄 PixPaymentScreen montado - Parâmetros:", {
      orderId,
      amount,
      itemsCount: items.length,
    });

    loadPaymentData();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      showCancelAlert
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  // ✅ CORREÇÃO: Função simplificada para carregar dados
  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 DEBUG - Iniciando loadPaymentData");

      // ✅ 1. Buscar PIX e Config em PARALELO para melhor performance
      const [pixData, config] = await Promise.all([
        apiService.generatePixPayment(orderId, amount),
        apiService.getPaymentConfig().catch((configError) => {
          console.warn("❌ Config falhou, usando padrão:", configError);
          return { expirationTime: 30 * 60 }; // Fallback
        }),
      ]);

      console.log("✅ DEBUG - Dados PIX recebidos:", pixData);
      console.log("✅ DEBUG - Config recebida:", config);

      // ✅ 2. VERIFICAR CONFIG ANTES DE USAR
      if (!config) {
        console.warn("⚠️ Config é undefined, usando valor padrão");
        setCountdown(30 * 60); // 30 minutos padrão
      } else {
        setCountdown(config.expirationTime || 30 * 60);
      }

      // ✅ 3. SETAR DADOS PIX
      setPixPayload(pixData.payload);
      setQrCodeValue(pixData.qrCode);
      setCopyPasteCode(pixData.copyPaste);
    } catch (error: any) {
      console.error("❌ Erro ao carregar PIX:", error);

      // ✅ 4. FALLBACK COMPLETO EM CASO DE ERRO
      Alert.alert(
        "Atenção",
        "Pagamento em modo demonstração. Use os dados fictícios para teste."
      );

      // ✅ DADOS FICTÍCIOS PARA CONTINUAR O FLUXO
      setPixPayload(
        `00020126580014br.gov.bcb.pix0136123456789005204000053039865406${amount.toFixed(
          2
        )}5802BR5913ITALICITA DELIVERY6008NITERÓI62070503${orderId}6304`
      );
      setQrCodeValue(
        `00020126580014br.gov.bcb.pix0136123456789005204000053039865406${amount.toFixed(
          2
        )}5802BR5913ITALICITA DELIVERY6008NITERÓI62070503${orderId}6304`
      );
      setCopyPasteCode(
        `00020126580014br.gov.bcb.pix013612345678900\n5204000053039865406${amount.toFixed(
          2
        )}\n5802BR5913ITALICITA DELIVERY\n6008NITERÓI62070503${orderId}\n6304`
      );
      setCountdown(30 * 60); // 30 minutos padrão
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CORREÇÃO: Countdown simplificado
  useEffect(() => {
    if (!isLoading) {
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
    }
  }, [isLoading]);

  const showCancelAlert = () => {
    Alert.alert(
      "Pagamento em Andamento",
      "Você tem um pagamento PIX pendente. Deseja realmente cancelar?",
      [
        {
          text: "Continuar Pagamento",
          style: "cancel",
        },
        {
          text: "Cancelar Pedido",
          style: "destructive",
          onPress: handleCancelOrder,
        },
      ]
    );
    return true;
  };

  // ✅ CORREÇÃO: Função unificada para limpar carrinho e navegar
  const handleCancelOrder = () => {
    console.log("❌ Cancelando pedido e limpando carrinho...");
    clearCart();
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  const handleExpiredPayment = () => {
    Alert.alert(
      "Tempo Esgotado",
      "O código PIX expirou. Por favor, inicie um novo pedido.",
      [
        {
          text: "Fazer Novo Pedido",
          onPress: () => {
            console.log("🔄 PIX expirado - limpando carrinho...");
            clearCart();
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
      Alert.alert("Sucesso", "Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Erro ao copiar código:", error);
      Alert.alert("Erro", "Não foi possível copiar o código PIX.");
    }
  };

  // ✅ CORREÇÃO: Função simplificada para confirmação de pagamento
  const handlePaymentConfirmed = () => {
    Alert.alert(
      "Pagamento Confirmado?",
      "Se você já realizou o pagamento PIX, seu pedido será preparado automaticamente.",
      [
        { text: "Ainda não paguei", style: "cancel" },
        {
          text: "Já efetuei o pagamento",
          onPress: () => {
            console.log("✅ Pagamento confirmado - limpando carrinho...");
            clearCart();
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
            Alert.alert(
              "Pedido Confirmado!",
              `Seu pedido ${orderId} está sendo preparado.`
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingTitle}>Carregando pagamento...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
      </View>

      {/* QR Code */}
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>📷 Escaneie o QR Code</Text>
        <View style={styles.qrContainer}>
          <QRCode value={qrCodeValue} size={220} />
        </View>
      </View>

      {/* Código PIX */}
      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>📋 Ou copie o código PIX</Text>
        <TouchableOpacity style={styles.codeContainer} onPress={handleCopyCode}>
          <Text style={styles.codeText}>{copyPasteCode}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copiedButton]}
          onPress={handleCopyCode}
        >
          <Text style={styles.copyButtonText}>
            {copied ? "✓ Copiado!" : "📋 Copiar Código PIX"}
          </Text>
        </TouchableOpacity>
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
          <Text style={styles.supportButtonText}>💬 Ajuda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelOrder}
        >
          <Text style={styles.cancelButtonText}>❌ Cancelar Pedido</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Mantenha os styles (estão corretos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
    padding: 20,
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  codeSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
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
  actions: {
    gap: 10,
    padding: 20,
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
