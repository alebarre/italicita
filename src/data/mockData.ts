import { MenuItem, PastaOption, SizeOption, SauceOption, AddOnOption, ExtraOption, ProductCategory } from '../types';

// Estrutura que simula como será no banco de dados
// No futuro, estas URLs virão do banco: "/uploads/produtos/massas/spaghetti.jpg"
const images = {
    // Massas
    spaghetti: require('../../assets/images/massas/alho-e-oleo-do-chefe.jpg'),
    fettuccine: require('../../assets/images/massas/fettucine.jpg'),
    penne: require('../../assets/images/massas/penne.jpg'),

    // Saladas
    caesarSalad: require('../../assets/images/saladas/ceasar-salad.jpg'),

    // Sobremesas
    tiramisu: require('../../assets/images/sobremesas/tiramissu.png'),

    // Acompanhamentos
    batataFrita: require('../../assets/images/acompanhamentos/batata-frita.jpg'),

    // Placeholders por categoria (para itens sem imagem)
    placeholderMassas: require('../../assets/images/placeholders/placeholder-massas.jpg'),
    placeholderSaladas: require('../../assets/images/placeholders/placeholder-saladas.jpg'),
    placeholderBebidas: require('../../assets/images/placeholders/placeholder-bebidas.jpg'),
};

// Função auxiliar para obter imagem baseada na categoria
const getImageByCategory = (category: ProductCategory, specificImage?: any) => {
    if (specificImage) return specificImage;

    switch (category) {
        case 'massas':
            return images.placeholderMassas;
        case 'saladas':
            return images.placeholderSaladas;
        case 'bebidas':
            return images.placeholderBebidas;
        default:
            return images.placeholderMassas;
    }
};

export const pastaOptions: PastaOption[] = [
    {
        id: 'pasta-1',
        name: 'Spaghetti',
        description: 'Massa longa e fina italiana',
        weight: '300g',
        priceAdjustment: 0,
        isAvailable: true,
    },
    {
        id: 'pasta-2',
        name: 'Fettuccine',
        description: 'Massa larga e achatada',
        weight: '300g',
        priceAdjustment: 2.00,
        isAvailable: true,
    },
    {
        id: 'pasta-3',
        name: 'Penne',
        description: 'Massa tubular com cortes diagonais',
        weight: '300g',
        priceAdjustment: 1.50,
        isAvailable: true,
    },
];

export const sizeOptions: SizeOption[] = [
    {
        id: 'size-1',
        name: 'Junior',
        description: 'Porção individual perfeita',
        weight: '300g',
        priceAdjustment: 0,
        isAvailable: true,
    },
    {
        id: 'size-2',
        name: 'Adulto',
        description: 'Porção completa e generosa',
        weight: '500g',
        priceAdjustment: 8.00,
        isAvailable: true,
    },
];

export const sauceOptions: SauceOption[] = [
    {
        id: 'sauce-1',
        name: 'Molho Bolonhesa',
        description: 'Molho de carne tradicional italiano',
        weight: '100ml',
        price: 3.00,
        isAvailable: true,
    },
    {
        id: 'sauce-2',
        name: 'Molho Alfredo',
        description: 'Molho cremoso de queijos nobres',
        weight: '100ml',
        price: 4.00,
        isAvailable: true,
    },
    {
        id: 'sauce-3',
        name: 'Molho Pesto',
        description: 'Molho de manjericão fresco e pinoli',
        weight: '80ml',
        price: 5.00,
        isAvailable: true,
    },
];

export const addOnOptions: AddOnOption[] = [
    {
        id: 'addon-1',
        name: 'Frango Grelhado',
        description: 'Tiras de frango grelhado na chapa',
        weight: '100g',
        price: 7.00,
        isAvailable: true,
    },
    {
        id: 'addon-2',
        name: 'Camarão',
        description: 'Camarões médios selecionados',
        weight: '80g',
        price: 12.00,
        isAvailable: true,
    },
    {
        id: 'addon-3',
        name: 'Bacon',
        description: 'Bacon crocante em tiras',
        weight: '50g',
        price: 4.00,
        isAvailable: true,
    },
];

export const extraOptions: ExtraOption[] = [
    {
        id: 'extra-1',
        name: 'Queijo Parmesão',
        description: 'Queijo parmesão ralado na hora',
        price: 2.00,
        isAvailable: true,
    },
    {
        id: 'extra-2',
        name: 'Pão de Alho',
        description: '2 unidades de pão de alho caseiro',
        price: 6.00,
        isAvailable: true,
    },
    {
        id: 'extra-3',
        name: 'Molho Extra',
        description: 'Porção adicional de molho',
        price: 3.00,
        isAvailable: true,
    },
];

// Pratos do menu com estrutura realista
export const menuItems: MenuItem[] = [
    {
        id: 'item-1',
        name: 'Spaghetti Clássico',
        description: 'Spaghetti com molho à escolha, finalizado com ervas frescas',
        category: 'massas',
        basePrice: 25.90,
        images: [images.spaghetti], // Imagem específica do prato
        isAvailable: true,
        preparationTime: 15,
        tags: ['clássico', 'tradicional', 'italiano'],
        allowedPasta: [pastaOptions[0]],
        allowedSizes: sizeOptions,
        allowedSauces: sauceOptions,
        allowedAddOns: [addOnOptions[0], addOnOptions[2]],
        allowedExtras: extraOptions,
    },
    {
        id: 'item-2',
        name: 'Fettuccine Premium',
        description: 'Fettuccine com opções gourmet e ingredientes selecionados',
        category: 'massas',
        basePrice: 32.90,
        images: [images.fettuccine], // Imagem específica
        isAvailable: true,
        preparationTime: 20,
        tags: ['premium', 'gourmet', 'especial'],
        allowedPasta: [pastaOptions[1]],
        allowedSizes: sizeOptions,
        allowedSauces: [sauceOptions[1], sauceOptions[2]],
        allowedAddOns: addOnOptions,
        allowedExtras: extraOptions,
    },
    {
        id: 'item-3',
        name: 'Penne Especial',
        description: 'Penne com molho bolonhesa e blend de queijos especiais',
        category: 'massas',
        basePrice: 28.90,
        images: [images.penne], // Imagem específica
        isAvailable: true,
        preparationTime: 18,
        tags: ['especial', 'queijos', 'tradicional'],
        allowedPasta: [pastaOptions[2]],
        allowedSizes: sizeOptions,
        allowedSauces: [sauceOptions[0]],
        allowedAddOns: [],
        allowedExtras: [extraOptions[0]],
    },
    {
        id: 'item-4',
        name: 'Risoto de Cogumelos',
        description: 'Risoto cremoso com cogumelos frescos e finalizado com trufas',
        category: 'risotos',
        basePrice: 34.90,
        images: [getImageByCategory('massas')], // Placeholder da categoria
        isAvailable: true,
        preparationTime: 25,
        tags: ['cremoso', 'vegetariano', 'sofisticado'],
        allowedSizes: sizeOptions,
        allowedAddOns: [],
        allowedExtras: extraOptions,
    },
    {
        id: 'item-5',
        name: 'Salada Caesar',
        description: 'Salada Caesar com molho cremoso, croutons e parmesão',
        category: 'saladas',
        basePrice: 22.90,
        images: [images.caesarSalad], // Imagem específica
        isAvailable: true,
        preparationTime: 10,
        tags: ['fresco', 'leve', 'saudável'],
        allowedSizes: sizeOptions,
        allowedAddOns: [addOnOptions[0]],
        allowedExtras: [extraOptions[0]],
    },
    {
        id: 'item-6',
        name: 'Tiramisu Classico',
        description: 'Sobremesa italiana com café, mascarpone e cacau',
        category: 'sobremesas',
        basePrice: 16.90,
        images: [images.tiramisu], // Imagem específica
        isAvailable: true,
        preparationTime: 5,
        tags: ['clássico', 'italiano', 'doce'],
        allowedSizes: [],
        allowedAddOns: [],
        allowedExtras: [],
    },
    {
        id: 'item-7',
        name: 'Refrigerante 2L',
        description: 'Coca-Cola, Guaraná Antarctica ou Fanta Laranja',
        category: 'bebidas',
        basePrice: 10.90,
        images: [getImageByCategory('bebidas')], // Placeholder da categoria
        isAvailable: true,
        preparationTime: 2,
        tags: ['gelada', 'refrescante'],
        allowedSizes: [],
        allowedAddOns: [],
        allowedExtras: [],
    },
    {
        id: 'item-8',
        name: 'Batata Frita',
        description: 'Porção de batata frita crocante temperada',
        category: 'acompanhamentos',
        basePrice: 12.90,
        images: [images.batataFrita], // Imagem específica
        isAvailable: true,
        preparationTime: 12,
        tags: ['crocante', 'tradicional'],
        allowedSizes: sizeOptions,
        allowedAddOns: [],
        allowedExtras: [extraOptions[1]],
    },
];