import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { PixPayload, pixService } from "../services/pixService";

interface PixPaymentProps {
  orderId: string;
  amount: number;
  onCopyCode?: () => void;
}

const PixPayment: React.FC<PixPaymentProps> = ({
  orderId,
  amount,
  onCopyCode,
}) => {
  const [pixData, setPixData] = useState<PixPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generatePixCode();
  }, [orderId, amount]);

  const generatePixCode = async () => {
    try {
      setIsLoading(true);

      // Gerar dados PIX (em produção, viria do backend)
      const pixInput = pixService.generateMockPixData(orderId, amount);
      const payload = pixService.generatePixPayload(pixInput);

      setPixData(payload);
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

  const handleCopyCode = async () => {
    if (!pixData) return;

    try {
      await Clipboard.setStringAsync(pixData.payload);
      setCopied(true);
      onCopyCode?.();

      Alert.alert(
        "Sucesso",
        "Código PIX copiado para a área de transferência!"
      );

      // Resetar estado após 3 segundos
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Erro ao copiar código:", error);
      Alert.alert("Erro", "Não foi possível copiar o código PIX.");
    }
  };

  const handleShareCode = async () => {
    // Em uma implementação real, usaria o Share do React Native
    Alert.alert(
      "Compartilhar PIX",
      "Em uma versão futura, você poderá compartilhar o código PIX com outros apps.",
      [{ text: "OK" }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Gerando código PIX...</Text>
      </View>
    );
  }

  if (!pixData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao gerar código PIX</Text>
        <TouchableOpacity style={styles.retryButton} onPress={generatePixCode}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💰 Pagamento via PIX</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Escaneie o QR Code abaixo ou copie o código PIX para realizar o
          pagamento.
        </Text>
        <Text style={styles.amountText}>Valor: R$ {amount.toFixed(2)}</Text>
        <Text style={styles.orderText}>Pedido: {orderId}</Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCode}>
          <QRCode
            value={pixData.qrCode}
            size={200}
            color="#000000"
            backgroundColor="#FFFFFF"
          />
        </View>
        <Text style={styles.qrInstruction}>
          Aponte a câmera do seu banco para o QR Code
        </Text>
      </View>

      {/* Código PIX Copiável */}
      <View style={styles.codeContainer}>
        <Text style={styles.codeTitle}>Código PIX (Copie e Cole)</Text>
        <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode}>
          <Text style={styles.codeText} selectable>
            {pixData.copyPaste}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copyButtonCopied]}
          onPress={handleCopyCode}
          disabled={copied}
        >
          <Text style={styles.copyButtonText}>
            {copied ? "✓ Copiado!" : "📋 Copiar Código PIX"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
          <Text style={styles.shareButtonText}>📤 Compartilhar Código</Text>
        </TouchableOpacity>
      </View>

      {/* Instruções */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>📝 Como pagar:</Text>
        <Text style={styles.instruction}>1. Abra o app do seu banco</Text>
        <Text style={styles.instruction}>
          2. Escaneie o QR Code ou cole o código
        </Text>
        <Text style={styles.instruction}>3. Confirme o pagamento</Text>
        <Text style={styles.instruction}>
          4. Aguarde a confirmação automática
        </Text>

        <Text style={styles.note}>
          ⏰ O pedido será preparado assim que o pagamento for confirmado.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  infoCard: {
    backgroundColor: "#e8f4fd",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 5,
  },
  orderText: {
    fontSize: 14,
    color: "#666",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  qrCode: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  qrInstruction: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  codeContainer: {
    marginBottom: 25,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  codeBox: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  codeText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#333",
    lineHeight: 18,
  },
  copyButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  copyButtonCopied: {
    backgroundColor: "#2ecc71",
  },
  copyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  shareButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructions: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  instruction: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: "#e74c3c",
    fontStyle: "italic",
    marginTop: 10,
    lineHeight: 16,
  },
});

export default PixPayment;
