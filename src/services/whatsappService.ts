import { Linking, Platform, Alert } from 'react-native';
import { CartItem, DeliveryData, PaymentData } from '../types';

export interface OrderDetails {
    orderNumber: string;
    items: CartItem[];
    total: number;
    deliveryData: DeliveryData;
    paymentMethod: string;
    deliveryFee: number;
}

class WhatsAppService {
    // Mensagem formatada do pedido
    generateOrderMessage(order: OrderDetails): string {
        const { orderNumber, items, total, deliveryData, paymentMethod, deliveryFee } = order;

        let message = `🍝 *PEDIDO ITALICITA DELIVERY* 🍝\n\n`;
        message += `*Nº do Pedido:* ${orderNumber}\n\n`;

        // Itens
        message += `*ITENS DO PEDIDO:*\n`;
        items.forEach((item, index) => {
            message += `• ${item.quantity}x ${item.name} - R$ ${(item.basePrice * item.quantity).toFixed(2)}\n`;
        });

        // Totais
        message += `\n*RESUMO DO PEDIDO:*\n`;
        message += `Subtotal: R$ ${(total - deliveryFee).toFixed(2)}\n`;
        message += `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}\n`;
        message += `*Total: R$ ${total.toFixed(2)}*\n\n`;

        // Dados de entrega
        message += `*DADOS DE ENTREGA:*\n`;
        message += `Nome: ${deliveryData.name}\n`;
        message += `Endereço: ${deliveryData.address}\n`;
        if (deliveryData.complement) {
            message += `Complemento: ${deliveryData.complement}\n`;
        }
        message += `Telefone: ${deliveryData.phone}\n\n`;

        // Pagamento
        message += `*FORMA DE PAGAMENTO:*\n`;
        message += `${paymentMethod === 'pix' ? 'PIX' : 'Cartão'}\n\n`;

        // Instruções
        if (paymentMethod === 'pix') {
            message += `💰 *INSTRUÇÕES PIX:*\n`;
            message += `1. Aguarde o código PIX\n`;
            message += `2. Realize o pagamento\n`;
            message += `3. Seu pedido será preparado após confirmação\n`;
        } else {
            message += `💳 *PAGAMENTO VIA CARTÃO:*\n`;
            message += `Pagamento processado com sucesso!\n`;
        }

        message += `\n⏰ *TEMPO DE ENTREGA:*\n`;
        message += `Previsão: 30-45 minutos\n\n`;

        message += `📞 *DÚVIDAS?* Entre em contato!\n`;

        return message;
    }

    // Abrir WhatsApp com mensagem pré-formatada
    async openWhatsAppWithOrder(order: OrderDetails): Promise<boolean> {
        try {
            const message = this.generateOrderMessage(order);
            const encodedMessage = encodeURIComponent(message);

            // Número do restaurante (substitua pelo número real)
            const restaurantPhone = '5521998526500'; // Formato: 55 + DDD + número

            let url = '';

            if (Platform.OS === 'ios') {
                url = `https://wa.me/${restaurantPhone}?text=${encodedMessage}`;
            } else {
                url = `https://api.whatsapp.com/send?phone=${restaurantPhone}&text=${encodedMessage}`;
            }

            const canOpen = await Linking.canOpenURL(url);

            if (canOpen) {
                await Linking.openURL(url);
                return true;
            } else {
                Alert.alert(
                    'WhatsApp não encontrado',
                    'Por favor, instale o WhatsApp para acompanhar seu pedido.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Erro ao abrir WhatsApp:', error);
            Alert.alert(
                'Erro',
                'Não foi possível abrir o WhatsApp. Tente novamente.',
                [{ text: 'OK' }]
            );
            return false;
        }
    }

    // WhatsApp suporte geral
    async openWhatsAppSupport(phone: string, customMessage?: string): Promise<boolean> {
        try {
            const message = customMessage || 'Olá! Gostaria de tirar uma dúvida sobre meu pedido.';
            const encodedMessage = encodeURIComponent(message);

            const formattedPhone = phone.replace(/\D/g, '');

            let url = '';

            if (Platform.OS === 'ios') {
                url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
            } else {
                url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
            }

            const canOpen = await Linking.canOpenURL(url);

            if (canOpen) {
                await Linking.openURL(url);
                return true;
            } else {
                Alert.alert(
                    'WhatsApp não encontrado',
                    'Por favor, instale o WhatsApp para entrar em contato.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Erro ao abrir WhatsApp:', error);
            return false;
        }
    }
}

export const whatsappService = new WhatsAppService();