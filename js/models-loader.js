// models-loader.js
// Chargement des modèles 3D

let mixer,
  terrainModel,
  tennisBallModel,
  tennisRacketModel = false,
  tennisCourtVisible = true;

let padelRacketModel, padelCourtModel;
let padelModelsLoaded = false;

const loader = new THREE.GLTFLoader();
const loadingContainer = document.getElementById("loading-container");

// Fonction pour charger les modèles de tennis
export function loadTennisModels() {
  loadingContainer.style.display = "block";

  return new Promise((resolve) => {
    loader.load("models/tennis_court/scene.gltf", function (gltf) {
      terrainModel = gltf.scene;
      terrainModel.scale.set(0.1, 0.15, 0.15);
      scene.add(terrainModel);

      mixer = new THREE.AnimationMixer(terrainModel);

      if (gltf.animations && gltf.animations.length > 0) {
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.play();
          action.loop = THREE.LoopRepeat;
        });
      }

      Promise.all([loadTennisBallModel(), loadTennisRacketModel()]).then(() => {
        hideLoadingScreen();
        resolve();
      });
    });
  });
}

// Fonction pour charger le modèle de balle de tennis
function loadTennisBallModel() {
  return new Promise((resolve) => {
    loader.load("models/tennis_ball/scene.gltf", function (gltf) {
      tennisBallModel = gltf.scene;
      tennisBallModel.scale.set(3, 3, 3);
      centerPivot(tennisBallModel);
      tennisBallModel.visible = false;
      resetBall();
      scene.add(tennisBallModel);
      resolve();
    });
  });
}

// Fonction pour charger le modèle de raquette de tennis
function loadTennisRacketModel() {
  return new Promise((resolve) => {
    loader.load("models/tennis_racket/scene.gltf", function (gltf) {
      tennisRacketModel = gltf.scene;
      tennisRacketModel.scale.set(1.5, 1.5, 1.5);
      tennisRacketModel.visible = false;
      tennisRacketModel.position.z = 0;
      scene.add(tennisRacketModel);
      // On initialise la raquette dans main.js pour éviter les dépendances circulaires
      resolve();
    });
  });
}

// Fonction pour charger les modèles de padel
export function loadPadelModels(callback) {
  const promises = [
    new Promise((resolve) => {
      loader.load("models/padel_racket/scene.gltf", function (gltf) {
        padelRacketModel = gltf.scene;
        padelRacketModel.scale.set(100, 100, 100);
        padelRacketModel.rotation.y = 190;
        padelRacketModel.position.set(0, 0, -2);
        padelRacketModel.visible = false;
        scene.add(padelRacketModel);
        resolve();
      });
    }),
    new Promise((resolve) => {
      loader.load("models/padel_court/scene.gltf", function (gltf) {
        padelCourtModel = gltf.scene;
        padelCourtModel.scale.set(0.5, 0.5, 0.5);
        padelCourtModel.position.set(0, 40, 40);
        padelCourtModel.visible = false;
        scene.add(padelCourtModel);
        resolve();
      });
    }),
  ];

  Promise.all(promises).then(() => {
    padelModelsLoaded = true;
    console.log("Modèles de padel chargés.");
    if (callback) callback(padelRacketModel, padelCourtModel);
  });
}

// Fonction pour cacher l'écran de chargement
function hideLoadingScreen() {
  loadingContainer.style.opacity = "0";
  loadingContainer.style.transform = "translate(-50%, -50%) scale(0.9)";

  setTimeout(() => {
    loadingContainer.style.display = "none";
  }, 500);
}

// Autres fonctions utilitaires pour les modèles
export function resetTerrain() {
  terrainModel.position.set(0, 0, 0);
}

export function resetBall() {
  tennisBallModel.position.set(0, 1000, 0);
}

export function showRacket() {
  tennisRacketModel.visible = true;
}
