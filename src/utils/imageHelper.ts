export const getProductImage = (imageName: string, category: string) => {
    try {
        return require(`../../assets/images/${category}/${imageName}`);
    } catch (error) {
        // Fallback para placeholder
        return require('../../assets/images/placeholders/placeholder-massas.jpg');
    }
};