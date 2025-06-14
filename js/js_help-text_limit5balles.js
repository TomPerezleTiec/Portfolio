/**
 * Script to manage help texts in the upper right corner of the canvas part
 */
document.addEventListener("DOMContentLoaded", function () {
  const canvasInfo = document.getElementById("canvas-info");
  const firstPage = document.getElementById("first-page");
  const secondPage = document.getElementById("second-page");
  const thirdPage = document.getElementById("third-page");
  // Help texts for each page
  const helpTexts = {
    "first-page": "You can navigate in the 3D environment",
    "second-page":
      "You can play by putting the mouse in the 3D environment and left clicking",
    "third-page": "Press space",
  };

  // Function to update help text
  function updateHelpText() {
    if (firstPage.style.display !== "none") {
      canvasInfo.textContent = helpTexts["first-page"];
    } else if (secondPage.style.display !== "none") {
      canvasInfo.textContent = helpTexts["second-page"];
    } else if (thirdPage.style.display !== "none") {
      canvasInfo.textContent = helpTexts["third-page"];
    }
  }

  // Observe page visibility changes
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
  // Observe style changes (to detect display changes)
  observer.observe(firstPage, { attributes: true });
  observer.observe(secondPage, { attributes: true });
  observer.observe(thirdPage, { attributes: true });

  // Initialize help text
  updateHelpText();
});
