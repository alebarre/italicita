// src/utils/imageLoader.ts

// Mapeamento das imagens locais
const localImages: { [key: string]: any } = {
    // Massas
    'alho-e-oleo-do-chefe.jpg': require('../../assets/images/massas/alho-e-oleo-do-chefe.jpg'),
    'basilico-especiale.jpg': require('../../assets/images/massas/basilico-especiale.jpg'),
    'bolonhesa-supremo.jpg': require('../../assets/images/massas/bolonhesa-supremo.jpg'),
    'camarao-divino.jpg': require('../../assets/images/massas/camarao-divino.jpg'),
    'camarao-real.jpg': require('../../assets/images/massas/camarao-real.jpg'),
    'carbolicita.jpg': require('../../assets/images/massas/carbolicita.jpg'),
    'chiken-alfredo.jpg': require('../../assets/images/massas/chiken-alfredo.jpg'),
    'fettucine.jpg': require('../../assets/images/massas/fettucine.jpg'),
    'fungheria.jpg': require('../../assets/images/massas/fungheria.jpg'),
    'mingnon-italianissimo.jpg': require('../../assets/images/massas/mingnon-italianissimo.jpg'),
    'penne.jpg': require('../../assets/images/massas/penne.jpg'),
    'pomodoro-italicita.jpg': require('../../assets/images/massas/pomodoro-italicita.jpg'),

    // Risotos (adicione conforme suas imagens)
    'risoto-fungheria.jpg': require('../../assets/images/risotos/risoto-fungheria.jpg'),

    // Placeholder padrão
    'placeholder.jpg': require('../../assets/images/placeholders/placeholder.jpg'),
};

export const getProductImage = (imageName: string) => {
    try {
        // Remove caminhos completos se houver, pega apenas o nome do arquivo
        const fileName = imageName.split('/').pop() || imageName;

        if (localImages[fileName]) {
            return localImages[fileName];
        }

        console.warn(`⚠️ Imagem não encontrada: ${fileName}`);
        return localImages['placeholder.jpg'];

    } catch (error) {
        console.error(`❌ Erro ao carregar imagem ${imageName}:`, error);
        return localImages['placeholder.jpg'];
    }
};

export const getProductImages = (imageNames: string[]) => {
    return imageNames.map(imageName => getProductImage(imageName));
};