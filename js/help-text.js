/**
 * Script pour gérer les textes d'aide dans le coin supérieur droit de la partie canvas
 */
document.addEventListener("DOMContentLoaded", function () {
  const canvasInfo = document.getElementById("canvas-info");
  const firstPage = document.getElementById("first-page");
  const secondPage = document.getElementById("second-page");
  const thirdPage = document.getElementById("third-page");
  // Textes d'aide pour chaque page
  const helpTexts = {
    "first-page": "Vous pouvez naviguer dans l'environnement 3D",
    "second-page":
      "Vous pouvez jouer en mettant la souris dans l'environnement 3D et en faisant un clic gauche",
    "third-page": "Appuyez sur espace",
  };

  // Fonction pour mettre à jour le texte d'aide
  function updateHelpText() {
    if (firstPage.style.display !== "none") {
      canvasInfo.textContent = helpTexts["first-page"];
    } else if (secondPage.style.display !== "none") {
      canvasInfo.textContent = helpTexts["second-page"];
    } else if (thirdPage.style.display !== "none") {
      canvasInfo.textContent = helpTexts["third-page"];
    }
  }

  // Observer les changements de visibilité des pages
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.target.classList.contains("page") &&
        mutation.attributeName === "style"
      ) {
        updateHelpText();
      }
    });
  });

  // Observer les changements de style (pour détecter les changements de display)
  observer.observe(firstPage, { attributes: true });
  observer.observe(secondPage, { attributes: true });
  observer.observe(thirdPage, { attributes: true });

  // Initialiser le texte d'aide
  updateHelpText();
});
