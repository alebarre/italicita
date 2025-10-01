export interface PixPayload {
    payload: string;
    qrCode: string;
    copyPaste: string;
}

export interface PixData {
    key: string; // Chave PIX do restaurante (CPF, CNPJ, email, telefone)
    recipient: string; // Nome do recebedor
    city: string; // Cidade
    amount: number; // Valor
    orderId: string; // ID do pedido
    description?: string; // Descrição opcional
}

class PixService {
    // Gerar payload PIX no formato BR Code
    generatePixPayload(data: PixData): PixPayload {
        const { key, recipient, city, amount, orderId, description } = data;

        // Formatar valor para 2 casas decimais
        const formattedAmount = amount.toFixed(2);

        // Descrição do pagamento
        const paymentDescription = description || `Pedido ${orderId} - Italicita Delivery`;

        // Construir payload PIX no padrão BR Code
        const payload = this.buildPixPayload({
            recipient,
            city,
            key,
            amount: formattedAmount,
            description: paymentDescription,
        });

        return {
            payload,
            qrCode: payload, // O payload é o próprio QR Code
            copyPaste: this.formatCopyPasteCode(payload),
        };
    }

    private buildPixPayload(data: {
        recipient: string;
        city: string;
        key: string;
        amount: string;
        description: string;
    }): string {
        const { recipient, city, key, amount, description } = data;

        // Payload formatado conforme padrão PIX
        const payload = [
            '000201', // Payload Format Indicator
            '26580014br.gov.bcb.pix', // PIX Identifier
            `0136${key}`, // PIX Key (36 chars)
            '52040000', // Merchant Category Code
            '5303986', // Currency (BRL)
            `5802BR`, // Country Code
            `5909${this.formatString(recipient, 25)}`, // Merchant Name
            `6008${this.formatString(city, 15)}`, // Merchant City
            `6214${this.buildAdditionalData(description, amount)}`, // Additional Data
            '6304', // CRC16
        ].join('');

        // Calcular CRC16
        const crc = this.calculateCRC16(payload);
        return payload + crc;
    }

    private buildAdditionalData(description: string, amount: string): string {
        const referenceLabel = '05' + this.formatNumber(description.length, 2) + description;
        const amountLabel = '54' + this.formatNumber(amount.length, 2) + amount;

        return referenceLabel + amountLabel;
    }

    private formatString(str: string, maxLength: number): string {
        return this.formatNumber(str.length, 2) + str.substring(0, maxLength).toUpperCase();
    }

    private formatNumber(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }

    private formatCopyPasteCode(payload: string): string {
        // Formatar para exibição mais legível
        const chunks = payload.match(/.{1,50}/g) || [];
        return chunks.join('\n');
    }

    private calculateCRC16(payload: string): string {
        // Algoritmo CRC16 simplificado para PIX
        let crc = 0xFFFF;

        for (let i = 0; i < payload.length; i++) {
            crc ^= payload.charCodeAt(i) << 8;

            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }

        crc = crc & 0xFFFF;
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }

    // Validar se é uma chave PIX válida
    isValidPixKey(key: string): boolean {
        // Validar CPF/CNPJ
        if (/^\d{11}$|^\d{14}$/.test(key)) return true;

        // Validar email
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return true;

        // Validar telefone (com DDD)
        if (/^\d{10,11}$/.test(key)) return true;

        // Validar chave aleatória
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return true;

        return false;
    }

    // Gerar dados mock para desenvolvimento
    generateMockPixData(orderId: string, amount: number): PixData {
        return {
            key: '12345678900', // CPF mock
            recipient: 'ITALICITA DELIVERY',
            city: 'NITEROI',
            amount,
            orderId,
            description: `Pedido ${orderId}`,
        };
    }
}

export const pixService = new PixService();