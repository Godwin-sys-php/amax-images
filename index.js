const axios = require('axios');
const fs = require('fs');

const API_KEYS = [
  'AIzaSyDGXVKv_CNjVB5P31ybHvVmCs1pSn8aEs0',
  'AIzaSyCoFB0Ob1hFYFBU4_IR2OIkhvQX3orLM3o',
  'AIzaSyCz0iVm1Tskd_8GxCOs72oVxAHQu5ulW_w',
];
const CX = 'a55a7ff7e31824fc3'; // Remplacez par votre ID de moteur de recherche personnalisé

const brands = require("./products.json");

let currentApiKeyIndex = 0;

function getNextApiKey() {
  const apiKey = API_KEYS[currentApiKeyIndex];
  currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
  return apiKey;
}

async function searchImage(query) {
  const apiKey = getNextApiKey();
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query + ' logo')}&cx=${CX}&searchType=image&fileType=jpg,png,jpeg&key=${apiKey}&num=5`;

  try {
    const response = await axios.get(url);
    if (response.data.items && response.data.items.length > 0) {
      for (const item of response.data.items) {
        const imageUrl = item.link;
        if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.png')) {
          return imageUrl;
        }
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la recherche d'image pour ${query}:`, error.message);
    if (error.response && error.response.status === 429) {
      console.log('Rate limit atteint, pause de 5 secondes...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Pause de 5 secondes
    }
  }
  return null;
}

async function addImageUrls(brands) {
  const failedBrands = [];

  for (const brand of brands) {
    const imageUrl = await searchImage(brand.brandName + " " + brand.name);
    if (imageUrl) {
      brand.imageUrl = imageUrl;
      console.log(`URL du logo de ${brand.name} trouvé: ${imageUrl}`);
    } else {
      console.log(`Aucune image trouvée pour ${brand.name}`);
      failedBrands.push(brand);
    }

    // Sauvegarder les résultats au fur et à mesure
    saveProgress(brands, failedBrands);

    await new Promise(resolve => setTimeout(resolve, 2000)); // Pause de 2 secondes entre chaque requête
  }

  return { updatedBrands: brands, failedBrands };
}

function saveProgress(updatedBrands, failedBrands) {
  // Sauvegarder les résultats réussis
  const filePath = './products_with_images.json';
  fs.writeFileSync(filePath, JSON.stringify(updatedBrands, null, 2), 'utf-8');
  console.log(`Progression sauvegardée dans ${filePath}`);
  
  // Sauvegarder les échecs
  const failedFilePath = './failed_product.json';
  fs.writeFileSync(failedFilePath, JSON.stringify(failedBrands, null, 2), 'utf-8');
  console.log(`Progression des échecs sauvegardée dans ${failedFilePath}`);
}

async function saveBrandsWithImages(brands) {
  await addImageUrls(brands);
}

saveBrandsWithImages(brands);