// main.js
// Point d'entrée principal pour l'application

// Télécharger le code js unifié
document.addEventListener("DOMContentLoaded", function () {
  fetch("module.js")
    .then((response) => response.text())
    .then((moduleCode) => {
      try {
        // Exécuter le code du module.js
        eval(moduleCode);
        console.log("Module chargé avec succès");
      } catch (error) {
        console.error("Erreur lors de l'exécution du module:", error);
      }
    })
    .catch((error) => {
      console.error("Erreur lors du chargement du module:", error);
    });
});
