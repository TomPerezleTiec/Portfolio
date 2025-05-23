// page-transitions.js
// Gestion des transitions entre les pages

import {
  scene,
  camera,
  controls,
  renderer,
  setCameraForCourt,
  setCameraForBall,
} from "./scene-setup.js";
import {
  terrainModel,
  tennisBallModel,
  tennisRacketModel,
  padelRacketModel,
  padelCourtModel,
  resetTerrain,
  resetBall,
} from "./models-loader.js";
import { updateScoreVisibility } from "./tennis-game.js";
import {
  createModels,
  firstPageProjects,
  secondPageProjects,
  thirdPageProjects,
} from "./project-carousel.js";
import { balls, ballModels, clearBalls } from "./padel-game.js";

let currentPage = 1;
let isScrolling = false;
let secondPageInitialized = false;
let thirdPageInitialized = false;

// Transition vers la première page
export function transitionToFirstPage() {
  if (isScrolling) return;
  isScrolling = true;
  document.getElementById("first-page").style.display = "block";
  document.getElementById("second-page").style.display = "none";
  document.getElementById("third-page").style.display = "none";

  resetTerrain();
  updateScoreVisibility();

  gsap.to(tennisBallModel.position, {
    duration: 1,
    y: 1000,
    ease: "power2.inOut",
    onComplete: function () {
      tennisBallModel.visible = false;
      terrainModel.visible = true;
      gsap.fromTo(
        terrainModel.position,
        { y: -1000 },
        { y: 0, duration: 1, ease: "power2.inOut" }
      );

      setCameraForCourt();
      gsap.to(camera.position, {
        duration: 2,
        x: camera.position.x + 50,
        y: camera.position.y - 270,
        z: camera.position.z - 1420,
        ease: "power2.inOut",
        onComplete: function () {
          isScrolling = false;
          currentPage = 1;
        },
      });
    },
  });
}

// Transition vers la deuxième page
export function transitionToSecondPage() {
  if (isScrolling) return;
  isScrolling = true;
  document.getElementById("first-page").style.display = "none";
  document.getElementById("second-page").style.display = "block";
  document.getElementById("third-page").style.display = "none";

  tennisBallModel.scale.set(3, 3, 3);
  tennisBallModel.position.set(0, 35, 50);
  tennisBallModel.visible = true;

  resetBall();
  updateScoreVisibility();

  if (!secondPageInitialized) {
    createModels({
      containerId: "number-3d-container-2",
      leftArrowId: "left-arrow-2",
      rightArrowId: "right-arrow-2",
      titleId: "title-2",
      descriptionId: "description-2",
      topTitleId: "top-title-2",
      bottomTitleId: "bottom-title-2",
      data: secondPageProjects,
      numberOfItems: Object.keys(secondPageProjects).length,
    });

    secondPageInitialized = true;
  }

  gsap.to(terrainModel.position, {
    duration: 0.1,
    y: 0,
    ease: "power2.inOut",
    onComplete: function () {
      terrainModel.visible = true;
      tennisBallModel.visible = true;
      document.getElementById("score-container").style.display = "block";

      tennisBallModel.position.set(-50, 1000, 0);

      gsap.to(terrainModel.position, {
        duration: 0.1,
        y: 0,
        ease: "power2.inOut",
        onComplete: function () {
          tennisBallModel.position.set(-2000, 2000, 0);
          tennisBallModel.visible = true;

          let rotationY = 0;
          let rotationX = 0;

          gsap.to(tennisBallModel.position, {
            x: -10,
            y: 15,
            z: 35,
            duration: 2,
            ease: "power2.out",
            onUpdate: function () {
              rotationY += 0.15;
              rotationX += 0.05;
              tennisBallModel.rotation.set(rotationX, rotationY, 0);
            },
            onComplete: function () {
              gsap.to(terrainModel.position, {
                y: -1000,
                duration: 1.5,
                ease: "power2.inOut",
                onComplete: function () {
                  terrainModel.visible = false;
                },
              });
              gsap.to(tennisBallModel.position, {
                x: 0,
                y: 35,
                z: 50,
                duration: 1.2,
                ease: "power2.out",
              });
              gsap.to(tennisBallModel.rotation, {
                x: Math.PI + rotationX,
                y: Math.PI + rotationY,
                duration: 1.5,
                ease: "power2.out",
              });
              isScrolling = false;
              currentPage = 2;
            },
          });

          gsap.to(camera.position, {
            duration: 0.5,
            x: camera.position.x - 0,
            y: camera.position.y + 50,
            z: camera.position.z + 200,
            ease: "power2.out",
            onComplete: function () {
              gsap.to(camera.position, {
                delay: 0.2,
                duration: 2.5,
                x: 0,
                y: 50,
                z: 100,
                ease: "power2.inOut",
                onUpdate: function () {
                  camera.lookAt(tennisBallModel.position);
                },
              });
            },
          });
        },
      });
    },
  });
}

// Transition vers la troisième page
export function transitionToThirdPage() {
  document.getElementById("first-page").style.display = "none";
  document.getElementById("second-page").style.display = "none";
  document.getElementById("third-page").style.display = "block";

  updateScoreVisibility();

  if (!thirdPageInitialized) {
    createModels({
      containerId: "number-3d-container-3",
      leftArrowId: "left-arrow-3",
      rightArrowId: "right-arrow-3",
      titleId: "title-3",
      descriptionId: "description-3",
      topTitleId: "top-title-3",
      bottomTitleId: "bottom-title-3",
      data: thirdPageProjects,
      numberOfItems: Object.keys(thirdPageProjects).length,
    });
    thirdPageInitialized = true;
  }

  if (isScrolling || !padelRacketModel || !padelCourtModel) return;
  isScrolling = true;

  gsap.to(tennisBallModel.scale, {
    duration: 1,
    x: 32,
    y: 33,
    z: 32,
    ease: "power2.inOut",
    onComplete: function () {
      terrainModel.visible = false;
      padelRacketModel.visible = true;
      padelCourtModel.visible = true;
      tennisBallModel.visible = false;

      camera.position.set(0, 5, 1);
      console.log(
        "Transition vers la troisième page commencée : caméra en position de départ."
      );

      gsap.to(camera.position, {
        duration: 4,
        x: 0,
        y: 7,
        z: 60,
        ease: "power2.inOut",
        onComplete: () => {
          console.log(
            "Transition vers la troisième page terminée : caméra en position finale."
          );
          isScrolling = false;
          currentPage = 3;
        },
      });
    },
  });
}

// Retour à la deuxième page
export function returnToSecondPage() {
  updateScoreVisibility();
  if (isScrolling) return;
  isScrolling = true;
  unloadPage3Elements();
  document.getElementById("third-page").style.display = "none";
  document.getElementById("second-page").style.display = "block";
  document.getElementById("score-container").style.display = "block";
  currentPage = 2;
  isScrolling = false;
}

// Déchargement des éléments de la page 3
export function unloadPage3Elements() {
  if (padelRacketModel) padelRacketModel.visible = false;
  if (padelCourtModel) padelCourtModel.visible = false;

  clearBalls();

  camera.position.set(0, 50, 150);
  camera.lookAt(0, 0, 0);

  console.log("Les éléments de la page 3 ont été déchargés.");
}

// Initialisation du premier carrousel
export function initFirstPageCarousel() {
  createModels({
    containerId: "number-3d-container",
    leftArrowId: "left-arrow",
    rightArrowId: "right-arrow",
    titleId: "title",
    descriptionId: "description",
    topTitleId: "top-title",
    bottomTitleId: "bottom-title",
    data: firstPageProjects,
    numberOfItems: Object.keys(firstPageProjects).length,
  });
}

// Gestionnaire d'événements
export function setupNavigationEvents() {
  window.addEventListener("wheel", function (event) {
    if (isScrolling) return;
    if (event.deltaY > 0) {
      if (currentPage === 1) transitionToSecondPage();
      else if (currentPage === 2) transitionToThirdPage();
    } else {
      if (currentPage === 3) returnToSecondPage();
      else if (currentPage === 2) transitionToFirstPage();
    }
  });

  window.addEventListener("keydown", function (event) {
    if (event.code === "Space" && currentPage === 3) {
      // Cette fonction est importée dans main.js
    }
  });
}

export function getCurrentPage() {
  return currentPage;
}
