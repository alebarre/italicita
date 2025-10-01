import { MenuItem, PastaOption, SizeOption, SauceOption, AddOnOption, ExtraOption, ProductCategory } from '../types';

// Opções compartilhadas entre pratos
export const pastaOptions: PastaOption[] = [
    {
        id: 'pasta-1',
        name: 'Spaghetti',
        description: 'Massa longa e fina',
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
        description: 'Massa tubular',
        weight: '300g',
        priceAdjustment: 1.50,
        isAvailable: true,
    },
];

export const sizeOptions: SizeOption[] = [
    {
        id: 'size-1',
        name: 'Junior',
        description: 'Porção individual',
        weight: '300g',
        priceAdjustment: 0,
        isAvailable: true,
    },
    {
        id: 'size-2',
        name: 'Adulto',
        description: 'Porção completa',
        weight: '500g',
        priceAdjustment: 8.00,
        isAvailable: true,
    },
];

export const sauceOptions: SauceOption[] = [
    {
        id: 'sauce-1',
        name: 'Molho Bolonhesa',
        description: 'Molho de carne tradicional',
        weight: '100ml',
        price: 3.00,
        isAvailable: true,
    },
    {
        id: 'sauce-2',
        name: 'Molho Alfredo',
        description: 'Molho cremoso de queijos',
        weight: '100ml',
        price: 4.00,
        isAvailable: true,
    },
    {
        id: 'sauce-3',
        name: 'Molho Pesto',
        description: 'Molho de manjericão e pinoli',
        weight: '80ml',
        price: 5.00,
        isAvailable: true,
    },
];

export const addOnOptions: AddOnOption[] = [
    {
        id: 'addon-1',
        name: 'Frango Grelhado',
        description: 'Tiras de frango grelhado',
        weight: '100g',
        price: 7.00,
        isAvailable: true,
    },
    {
        id: 'addon-2',
        name: 'Camarão',
        description: 'Camarões médios',
        weight: '80g',
        price: 12.00,
        isAvailable: true,
    },
    {
        id: 'addon-3',
        name: 'Bacon',
        description: 'Bacon crocante',
        weight: '50g',
        price: 4.00,
        isAvailable: true,
    },
];

export const extraOptions: ExtraOption[] = [
    {
        id: 'extra-1',
        name: 'Queijo Parmesão',
        description: 'Queijo parmesão ralado',
        price: 2.00,
        isAvailable: true,
    },
    {
        id: 'extra-2',
        name: 'Pão de Alho',
        description: '2 unidades',
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

// Pratos do menu
export const menuItems: MenuItem[] = [
    {
        id: 'item-1',
        name: 'Spaghetti Clássico',
        description: 'Spaghetti com molho à escolha',
        category: 'massas',
        basePrice: 25.90,
        images: ['https://example.com/spaghetti.jpg'],
        isAvailable: true,
        preparationTime: 15,
        tags: ['clássico', 'tradicional'],
        allowedPasta: [pastaOptions[0]], // Apenas spaghetti
        allowedSizes: sizeOptions,
        allowedSauces: sauceOptions,
        allowedAddOns: [addOnOptions[0], addOnOptions[2]], // Frango e Bacon
        allowedExtras: extraOptions,
    },
    {
        id: 'item-2',
        name: 'Fettuccine Premium',
        description: 'Fettuccine com opções gourmet',
        category: 'massas',
        basePrice: 32.90,
        images: ['https://example.com/fettuccine.jpg'],
        isAvailable: true,
        preparationTime: 20,
        tags: ['premium', 'gourmet'],
        allowedPasta: [pastaOptions[1]], // Apenas fettuccine
        allowedSizes: sizeOptions,
        allowedSauces: [sauceOptions[1], sauceOptions[2]], // Apenas Alfredo e Pesto
        allowedAddOns: addOnOptions, // Todos os adicionais
        allowedExtras: extraOptions,
    },
    {
        id: 'item-3',
        name: 'Penne Especial',
        description: 'Penne com molho bolonhesa e queijos',
        category: 'massas',
        basePrice: 28.90,
        images: ['https://example.com/penne.jpg'],
        isAvailable: true,
        preparationTime: 18,
        tags: ['especial', 'queijos'],
        allowedPasta: [pastaOptions[2]], // Apenas penne
        allowedSizes: sizeOptions,
        allowedSauces: [sauceOptions[0]], // Apenas bolonhesa
        allowedAddOns: [],
        allowedExtras: [extraOptions[0]], // Apenas queijo parmesão
    },
    {
        id: 'item-4',
        name: 'Risoto de Cogumelos',
        description: 'Risoto cremoso com cogumelos frescos',
        category: 'risotos',
        basePrice: 34.90,
        images: ['https://example.com/risoto.jpg'],
        isAvailable: true,
        preparationTime: 25,
        tags: ['cremoso', 'vegetariano'],
        allowedSizes: sizeOptions,
        allowedAddOns: [],
        allowedExtras: extraOptions,
    },
    {
        id: 'item-5',
        name: 'Salada Caesar',
        description: 'Salada com molho caesar e croutons',
        category: 'saladas',
        basePrice: 22.90,
        images: ['https://thumbs.dreamstime.com/b/ceasar-salad-grilled-chicken-fillets-red-onion-rings-lettuce-orange-cherry-tomatoes-croutons-grated-parmesan-cheese-seasoned-74092071.jpg?w=261'],
        isAvailable: true,
        preparationTime: 10,
        tags: ['fresco', 'leve'],
        allowedSizes: sizeOptions,
        allowedAddOns: [addOnOptions[0]], // Frango grelhado
        allowedExtras: [extraOptions[0]], // Queijo parmesão
    },
];