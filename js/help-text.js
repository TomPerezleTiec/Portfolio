/**
 * Script pour gérer les textes d'aide d  // Observer les changements de style (pour détecter les changements de display)
  observer.observe(firstPage, { attributes: true });
  observer.observe(secondPage, { attributes: true });
  observer.observe(thirdPage, { attributes: true }); le coin supérieur droit de la partie canvas
 * Ce script est simplifié car la gestion des textes est maintenant faite par le système de langues
 */
document.addEventListener("DOMContentLoaded", function () {
  const canvasInfo = document.getElementById("canvas-info");
  const firstPage = document.getElementById("first-page");
  const secondPage = document.getElementById("second-page");
  const thirdPage = document.getElementById("third-page"); // La fonction de mise à jour du texte d'aide
  function updateHelpText() {
    // Accéder au gestionnaire de langues si disponible
    if (window.languageManager) {
      const texts = window.languageManager.getTexts();

      // Vérifier quelle page est actuellement visible
      const firstPageVisible =
        firstPage &&
        (firstPage.style.display === "block" || firstPage.style.display === "");
      const secondPageVisible =
        secondPage && secondPage.style.display === "block";
      const thirdPageVisible = thirdPage && thirdPage.style.display === "block";

      if (thirdPageVisible) {
        canvasInfo.textContent = texts.helpTextThirdPage;
      } else if (secondPageVisible) {
        canvasInfo.textContent = texts.helpTextSecondPage;
      } else if (firstPageVisible) {
        canvasInfo.textContent = texts.helpTextFirstPage;
      }
    } else {
      // Fallback si le gestionnaire de langues n'est pas disponible
      const firstPageVisible =
        firstPage &&
        (firstPage.style.display === "block" || firstPage.style.display === "");
      const secondPageVisible =
        secondPage && secondPage.style.display === "block";
      const thirdPageVisible = thirdPage && thirdPage.style.display === "block";

      if (thirdPageVisible) {
        canvasInfo.textContent =
          "Appuyez sur espace pour faire tomber une raquette de padel (maximum 5 raquettes)";
      } else if (secondPageVisible) {
        canvasInfo.textContent =
          "Vous pouvez jouer en mettant la souris dans l'environnement 3D et en faisant un clic gauche";
      } else if (firstPageVisible) {
        canvasInfo.textContent = "Vous pouvez naviguer dans l'environnement 3D";
      }
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
