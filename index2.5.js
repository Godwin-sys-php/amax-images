const products = require("./products.json");
const fs = require('fs');

// map the products and put in another json file with only id, name and brandName

let newArr = [];

for (el of products) {
  newArr.push({
    id: el.id,
    nom: el.name,
    marque: el.brandName,
  })
}

const jsonData = JSON.stringify(newArr, null, 2); // le paramètre `null, 2` permet d'obtenir une indentation de 2 espaces

// Écrire dans un fichier JSON
fs.writeFile('products_simplified.json', jsonData, (err) => {
    if (err) {
        console.error('Une erreur est survenue lors de l\'écriture dans le fichier JSON:', err);
    } else {
        console.log('Le fichier JSON a été écrit avec succès');
    }
});
