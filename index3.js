const products = require("./products_cleaned_v2.json");
const fetch = require("node-fetch");
const fs = require("fs");
const { exec } = require('child_process');

// Liste des serveurs NordVPN
const nordvpnServers = [
  { name: "France #123", cliName: "fr123.nordvpn.com" },
  { name: "Germany #456", cliName: "de456.nordvpn.com" },
  { name: "United States #789", cliName: "us789.nordvpn.com" },
  { name: "Canada #101", cliName: "ca101.nordvpn.com" },
  { name: "Netherlands #202", cliName: "nl202.nordvpn.com" },
  { name: "United Kingdom #303", cliName: "uk303.nordvpn.com" },
  { name: "Australia #404", cliName: "au404.nordvpn.com" }
];

let currentServerIndex = 0;

// Fonction pour ajouter un objet à un fichier JSON
function ajouterObjetAuFichierJson(fichier, nouvelObjet) {
  fs.readFile(fichier, "utf8", (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier:", err);
      return;
    }

    let tableau;
    try {
      tableau = JSON.parse(data);
      if (!Array.isArray(tableau)) {
        console.error("Le fichier JSON ne contient pas un tableau.");
        return;
      }
    } catch (err) {
      console.error("Erreur lors du parsing du JSON:", err);
      return;
    }

    tableau.push(nouvelObjet);
    fs.writeFile(fichier, JSON.stringify(tableau, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Erreur lors de l'écriture dans le fichier:", err);
      } else {
        console.log("Objet ajouté avec succès au fichier JSON !");
      }
    });
  });
}

function extractQuantity(nom) {
  const quantityMatch = nom.match(/\b(\d{1,4})\s?ML\b/i);
  return quantityMatch ? parseInt(quantityMatch[1]) : null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour se connecter à un serveur NordVPN
function connectToNordVPN(server, callback) {
  console.log(`Connexion au serveur : ${server.name} (${server.cliName})`);
  exec(`nordvpn connect ${server.cliName}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Erreur de connexion : ${err}`);
      return;
    }
    console.log(`Connecté à ${server.name}`);
    callback();
  });
}

// Fonction pour déconnecter de NordVPN
function disconnectNordVPN(callback) {
  exec('nordvpn disconnect', (err, stdout, stderr) => {
    if (err) {
      console.error(`Erreur de déconnexion : ${err}`);
      return;
    }
    console.log('Déconnecté de NordVPN');
    callback();
  });
}

// Fonction pour changer de serveur en cas de code 429
function rotateServers(callback) {
  currentServerIndex = (currentServerIndex + 1) % nordvpnServers.length;
  const server = nordvpnServers[currentServerIndex];

  // Déconnexion du serveur actuel puis connexion au suivant
  disconnectNordVPN(() => {
    connectToNordVPN(server, callback);
  });
}

// Fonction principale de scraping
async function fetchProductDetails(products) {
  for (let el of products) {
    const nom = el.nom_nettoye;
    const taille = extractQuantity(el.nom);

    const url = `https://fgvi612dfz-3.algolianet.com/1/indexes/*/queries?x-algolia-agent=Algolia for JavaScript (4.23.3); Browser (lite)&x-algolia-api-key=MDM2ODQ3OTZlZDgyMTExY2NkNmExNmFiZjEwYjdiMjQwNDAzODg2MDRlMjMzMjFiNjVmYzIwODYxMWJiNmVmOXZhbGlkVW50aWw9MTcyNzMwMDY4NA==&x-algolia-application-id=FGVI612DFZ`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            indexName: "fragrantica_perfumes",
            query: nom,
            params: "hitsPerPage=30",
          },
          {
            indexName: "fr_articles",
            query: nom,
            params: "hitsPerPage=30",
          },
          {
            indexName: "fragrantica_designers",
            query: nom,
            params: "hitsPerPage=30",
          },
        ],
      }),
    };

    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        console.log("Code 429 reçu, rotation des serveurs...");
        rotateServers(() => {
          fetchProductDetails([el]); // Relancer la requête pour ce produit après la rotation
        });
        return;
      }

      const data = await response.json();
      if (!data.results[0].hits[0]) {
        console.log(`Aucun résultat pour ${nom}`);
        ajouterObjetAuFichierJson("products_with_details_failed.json", { nom: nom, taille: taille });
        continue;
      }

      console.log(nom);
      console.log(data.results[0].hits[0].opis); // description
      console.log(data.results[0].hits[0].picture); // image
      console.log(data.results[0].hits[0].spol); // gender
      console.log(data.results[0].hits[0].ingredients.FR[0]); // note
      console.log(taille); // taille

      // Ajouter l'objet au fichier JSON
      ajouterObjetAuFichierJson("products_with_details.json", {
        nom: nom,
        description: data.results[0].hits[0].opis,
        imageUrl: data.results[0].hits[0].picture,
        gender: data.results[0].hits[0].spol,
        note: data.results[0].hits[0].ingredients.FR[0],
        taille: taille,
      });

      console.log("====================================");
    } catch (error) {
      ajouterObjetAuFichierJson("products_with_details_failed.json", { nom: nom, taille: taille });
      console.error(`Erreur lors de la recherche d'image pour ${nom}:`, error.message);
    }

    await sleep(2000); // Attendre avant la prochaine requête
  }
}

// Connexion au premier serveur NordVPN et démarrage du scraping
connectToNordVPN(nordvpnServers[currentServerIndex], () => {
  fetchProductDetails(products);
});
