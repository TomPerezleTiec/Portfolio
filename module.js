console.log("Module.js loaded");

// Dependency check
console.log("THREE available:", typeof THREE !== "undefined");
console.log("GLTFLoader available:", typeof THREE.GLTFLoader !== "undefined");
console.log(
  "OrbitControls available:",
  typeof THREE.OrbitControls !== "undefined"
);

const scene = new THREE.Scene();
const aspectRatio = (window.innerWidth * 0.5) / window.innerHeight;
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();

// Function to enable/disable orbit controls
function setOrbitControlsEnabled(enabled) {
  if (enabled) {
    // Re-enable controls
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    // Remove our blocking event listeners
    renderer.domElement.removeEventListener(
      "mousedown",
      blockMouseEvents,
      true
    );
    renderer.domElement.removeEventListener("wheel", blockMouseEvents, true);
    renderer.domElement.removeEventListener(
      "contextmenu",
      blockMouseEvents,
      true
    );
    renderer.domElement.removeEventListener(
      "mousemove",
      blockMouseEvents,
      true
    );
  } else {
    // Disable controls completely
    controls.enabled = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    // Add our blocking event listeners with capture = true (highest priority)
    renderer.domElement.addEventListener("mousedown", blockMouseEvents, true);
    renderer.domElement.addEventListener("wheel", blockMouseEvents, true);
    renderer.domElement.addEventListener("contextmenu", blockMouseEvents, true);
    renderer.domElement.addEventListener("mousemove", blockMouseEvents, true);
  }
}

// Function to block mouse events that could trigger orbit controls
function blockMouseEvents(event) {
  // Block specific interactions that cause camera rotation/zoom on pages 2 and 3
  if (currentPage !== 1) {
    // Block right-click and middle-click completely
    if (
      event.type === "mousedown" &&
      (event.button === 1 || event.button === 2)
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    // Block mouse move when any button is pressed (prevents dragging rotation)
    if (event.type === "mousemove" && event.buttons > 0) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    // Block wheel events completely (prevents zoom)
    if (event.type === "wheel") {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    // Block context menu
    if (event.type === "contextmenu") {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }
}

// Initialize with controls enabled (page 1 is the starting page)
setOrbitControlsEnabled(true);

const BALL_POSITION = { x: 0, y: 24, z: 50 };

setTimeout(function () {
  const width = window.innerWidth * 0.5;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.render(scene, camera);
}, 50);

function centerPivot(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const group = new THREE.Group();
  object.position.sub(center);
  group.add(object);

  group.position.copy(center);

  return group;
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const container = document.getElementById("canvas-container");
const racketDepth = 0;

renderer.setSize(window.innerWidth * 0.4, window.innerHeight);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(1, 1, 1).normalize();
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-1, 1, -1).normalize();
scene.add(directionalLight2);

const pointLight = new THREE.PointLight(0xffffff, 0.3);
pointLight.position.set(100, 200, 0);
scene.add(pointLight);

let mixer,
  terrainModel,
  tennisBallModel,
  tennisRacketModel = false,
  tennisCourtVisible = true;

function createModels({
  containerId,
  leftArrowId,
  rightArrowId,
  titleId,
  descriptionId,
  topTitleId,
  bottomTitleId,
  data,
  numberOfItems,
}) {
  const container = document.getElementById(containerId);
  const titleElement = document.getElementById(titleId);
  const descriptionElement = document.getElementById(descriptionId);
  const topTitleElement = document.getElementById(topTitleId);
  const bottomTitleElement = document.getElementById(bottomTitleId);

  const numberScene = new THREE.Scene();
  const numberCamera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  numberCamera.position.set(0, 0, 150);

  const numberRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  numberRenderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(numberRenderer.domElement);

  const radius = 50;

  let angles = Array.from(
    { length: numberOfItems },
    (_, index) => Math.PI / 2 + (2 * Math.PI * index) / numberOfItems
  );

  const models = [];

  const loader = new THREE.FontLoader();
  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      const numbers = Object.keys(data);
      numbers.forEach((number, index) => {
        const textGeometry = new THREE.TextGeometry(number, {
          font: font,
          size: 25,
          height: 15,
          curveSegments: 12,
        });

        const textMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        textMesh.userData.number = number;

        const boundingBox = new THREE.Box3().setFromObject(textMesh);
        const center = boundingBox.getCenter(new THREE.Vector3());
        textMesh.geometry.translate(-center.x, -center.y, -center.z);
        const angle = angles[index];
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        textMesh.position.set(x, 0, z);

        const depthFactor = (z + radius) / (2 * radius);
        const scaleFactor = 0.5 + 0.5 * depthFactor;
        // Seul le chiffre ├á l'avant est en blanc, tous les autres en gris
        const isFrontModel = z >= radius - 5;
        const color = isFrontModel ? 0xffffff : 0x888888;

        textMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        textMesh.material.color.set(color);

        numberScene.add(textMesh);
        models.push(textMesh);
      });

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 50, 50);
      numberScene.add(ambientLight);
      numberScene.add(directionalLight);

      updateTextVisibility();

      function animate() {
        requestAnimationFrame(animate);
        numberRenderer.render(numberScene, numberCamera);
      }
      animate();
    }
  );
  function updateTextVisibility() {
    models.forEach((model) => {
      const depthFactor = (model.position.z + radius) / (2 * radius);
      const scaleFactor = 0.5 + 0.5 * depthFactor;
      // Only change color for models that are close to the front
      const color = model.position.z >= radius - 5 ? 0xffffff : 0x888888;

      model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      model.material.color.set(color);
    });

    const activeModel = models.find((model) => model.position.z >= radius - 5);
    if (activeModel) {
      const activeNumber = activeModel.userData.number;
      const projectData = data[activeNumber];

      titleElement.innerText = projectData.title;
      descriptionElement.innerText = projectData.description;
      topTitleElement.innerText = projectData.topTitle;
      bottomTitleElement.innerText = projectData.bottomTitle;

      const textContainer = titleElement.parentElement;
      textContainer.style.cursor = "pointer";
      textContainer.onclick = () => {
        window.location.href = projectData.link;
      };
      textContainer.style.display = "block";
    } else {
      titleElement.parentElement.style.display = "none";
    }
  }

  function animateModelPositions(direction) {
    const targetAngles = [...angles];
    const angleShift = (2 * Math.PI) / numberOfItems;

    if (direction === "left") {
      angles = angles.map((angle) => angle + angleShift);
    } else if (direction === "right") {
      angles = angles.map((angle) => angle - angleShift);
    }

    const animationDuration = 500;
    const startTime = performance.now();

    function updateAnimation() {
      const elapsedTime = performance.now() - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);

      const interpolatedAngles = targetAngles.map((targetAngle, index) => {
        const currentAngle = angles[index];
        return targetAngle + progress * (currentAngle - targetAngle);
      });

      models.forEach((model, index) => {
        const angle = interpolatedAngles[index];
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        model.position.set(x, 0, z);
        const depthFactor = (z + radius) / (2 * radius);
        const scaleFactor = 0.5 + 0.5 * depthFactor;

        // On utilise une approche simple pour les couleurs: blanc devant, gris ailleurs
        const color = z >= radius - 5 ? 0xffffff : 0x888888;

        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.material.color.set(color);
      });

      if (progress < 1) {
        requestAnimationFrame(updateAnimation);
      } else {
        updateTextVisibility();
      }
    }

    updateAnimation();
  }

  document.getElementById(leftArrowId).addEventListener("click", () => {
    animateModelPositions("left");
  });

  document.getElementById(rightArrowId).addEventListener("click", () => {
    animateModelPositions("right");
  });

  window.addEventListener("resize", () => {
    numberCamera.aspect = container.clientWidth / container.clientHeight;
    numberCamera.updateProjectionMatrix();
    numberRenderer.setSize(container.clientWidth, container.clientHeight);
  });
}

createModels({
  containerId: "number-3d-container",
  leftArrowId: "left-arrow",
  rightArrowId: "right-arrow",
  titleId: "title",
  descriptionId: "description",
  topTitleId: "top-title",
  bottomTitleId: "bottom-title",
  data: {
    1: {
      title: "Worldwide Weather Watcher",
      description:
        "The 'Worldwide Weather Watcher' project is a weather station that collects, records and displays environmental data (temperature, humidity, pressure, brightness, GPS) according to different modes. It uses sensors, an SD card and LEDs for intuitive and efficient data and state management.",
      topTitle: "2nd year",
      bottomTitle: "Embedded System - C",
      link: "https://github.com/TomPerezleTiec/Projet-Syst-me-Embarqu-",
    },
    2: {
      title: "Application",
      description:
        "The project aims to digitize key processes of an online sales company (staff, customer, order, stock and statistics management) by modeling its information system for clear and efficient implementation.",
      topTitle: "2nd year",
      bottomTitle: "OOP - C++",
      link: "https://github.com/BDF172/Projet-POO",
    },
    3: {
      title: "Screening",
      description:
        "The project consists of creating a website centralizing internship offers and storing company data, to facilitate students' internship search via a dedicated platform. It's important to note that the project was almost finished and an error in overwriting the main branch made many pages incomplete and filled with errors made at the beginning of training.",
      topTitle: "2nd year",
      bottomTitle: "Website - HTML / CSS / JAVASCRIPT / PHP",
      link: "https://github.com/JeremyMaille/ProjetWeb",
    },
  },
  numberOfItems: 3,
});

function setCameraForCourt() {
  camera.position.set(0, 305, 1500);
  camera.lookAt(0, 0, 0);
}

function setCameraForBall() {
  camera.position.set(0, 35, 100);
  camera.lookAt(0, 25, 0);
}

setCameraForBall();

function initializeRacket() {
  if (tennisRacketModel) {
    tennisRacketModel.rotation.x = Math.PI / 2;
    tennisRacketModel.rotation.z = 50;
  }
}

function resetTerrain() {
  terrainModel.position.set(0, 0, 0);
}

function resetBall() {
  tennisBallModel.position.set(BALL_POSITION.x, 1000, BALL_POSITION.z);
}

function showRacket() {
  tennisRacketModel.visible = true;
}

const originalBallScale = { x: 1.8, y: 1.8, z: 1.8 };
const bottomPortal = document.getElementById("bottom-portal");

// Variable globale pour tracker la position de la souris
let mouseInsideContainer = false;

container.addEventListener("mouseenter", function () {
  mouseInsideContainer = true;
  container.style.cursor = "none";
  if (tennisBallModel.visible && !terrainModel.visible) {
    gsap.to(tennisBallModel.scale, {
      x: originalBallScale.x * 0.25,
      y: originalBallScale.y * 0.25,
      z: originalBallScale.z * 0.25,
      duration: 0.5,
      ease: "power2.inOut",
    });
    tennisRacketModel.visible = true;
    bottomPortal.classList.add("active");
  }
});

container.addEventListener("mouseleave", function () {
  mouseInsideContainer = false;
  container.style.cursor = "default";
  if (tennisBallModel.visible && !ballRecomposing) {
    gsap.to(tennisBallModel.scale, {
      x: originalBallScale.x,
      y: originalBallScale.y,
      z: originalBallScale.z,
      duration: 0.5,
      ease: "power2.inOut",
    });
    tennisBallModel.position.set(
      BALL_POSITION.x,
      BALL_POSITION.y,
      BALL_POSITION.z
    );
    racketHit = false;
    lastHitTime = 0;
    initialSpeed = 1;
    resetScore();
    bottomPortal.classList.remove("active");
  }
  tennisRacketModel.visible = false;
});

container.addEventListener("mousemove", function (event) {
  const rect = container.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  tennisRacketModel.position.x = mouseX * 150 - 32;
  tennisRacketModel.position.y = mouseY * 80 + 27;
  tennisRacketModel.position.z = 50;
});

window.addEventListener("click", onMouseClick, false);
function onMouseClick(event) {
  spinVelocity += 0.2;
}

function explodeAndRecomposeBall() {
  ballRecomposing = true;
  gsap.to(tennisBallModel.scale, {
    x: 0.01,
    y: 0.01,
    z: 0.01,
    duration: 0.4,
    ease: "power2.out",
    onComplete: function () {
      tennisBallModel.visible = false;
      resetScore();
      gsap.delayedCall(0.2, function () {
        tennisBallModel.position.set(
          BALL_POSITION.x,
          BALL_POSITION.y,
          BALL_POSITION.z
        );
        tennisBallModel.scale.set(0.01, 0.01, 0.01);
        tennisBallModel.visible = true;

        // Animer vers la taille appropriée selon la position de la souris
        gsap.to(tennisBallModel.scale, {
          x: mouseInsideContainer
            ? originalBallScale.x * 0.25
            : originalBallScale.x,
          y: mouseInsideContainer
            ? originalBallScale.y * 0.25
            : originalBallScale.y,
          z: mouseInsideContainer
            ? originalBallScale.z * 0.25
            : originalBallScale.z,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: function () {
            ballRecomposing = false;
          },
        });
      });
    },
  });
}

let racketHit = false;
let ballVelocity = new THREE.Vector3(0, 0, 0);
const damping = 0.98;

let initialSpeed = 0.5;
let speedIncrement = 1.05;
let maxSpeed = 5;
let lastHitTime = 0;

let spinVelocity = 0;
const spinDecay = 0.98;
let ballRecomposing = false;

function applyForceToBall(force) {
  // Calculer une vitesse qui tient compte de la vitesse actuelle
  let currentSpeed = ballVelocity.length();

  // Limiter la vitesse maximale pour ├®viter des comportements erratiques
  const newSpeed = Math.min(currentSpeed * speedIncrement, maxSpeed);

  // If current speed is very low, use force as new direction
  if (currentSpeed < 0.1) {
    ballVelocity.copy(force);
  } else {
    // Autrement, combiner les deux vecteurs pour un comportement plus r├®aliste
    // Cette m├®thode conserve une partie de la dynamique pr├®c├®dente
    ballVelocity.multiplyScalar(0.2); // R├®duire l'influence de la direction pr├®c├®dente
    ballVelocity.add(force.multiplyScalar(0.8)); // Donner plus de poids ├á la nouvelle direction

    // S'assurer que la vitesse r├®sultante a la bonne magnitude
    ballVelocity.normalize().multiplyScalar(newSpeed);
  }

  // Ajouter un effet de rotation bas├® sur la direction lat├®rale
  spinVelocity = Math.max(-0.3, Math.min(0.3, force.x * 0.15));
}

let scoreContainer = document.getElementById("score-container");
if (!scoreContainer) {
  scoreContainer = document.createElement("div");
  scoreContainer.id = "score-container";
  scoreContainer.style.position = "fixed";
  scoreContainer.style.top = "20px";
  scoreContainer.style.left = "20px";
  scoreContainer.style.zIndex = "100";
  scoreContainer.style.fontSize = "24px";
  scoreContainer.style.color = "#ffffff";
  scoreContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  scoreContainer.style.borderRadius = "8px";
  scoreContainer.style.padding = "10px 15px";
  scoreContainer.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.3)";
  scoreContainer.style.transition = "transform 0.2s";
  scoreContainer.style.display = "none";
  document.body.appendChild(scoreContainer);

  const scoreTitle = document.createElement("span");
  scoreTitle.textContent = "Score: ";
  scoreTitle.style.fontWeight = "bold";
  scoreTitle.style.marginRight = "5px";
  scoreContainer.appendChild(scoreTitle);

  const scoreDisplay = document.createElement("span");
  scoreDisplay.id = "score";
  scoreDisplay.textContent = "0";
  scoreDisplay.style.fontSize = "28px";
  scoreDisplay.style.color = "#00ff88";
  scoreDisplay.style.fontWeight = "bold";
  scoreDisplay.style.transition = "color 0.2s ease";
  scoreContainer.appendChild(scoreDisplay);

  const recordTitle = document.createElement("span");
  recordTitle.style.marginLeft = "15px";
  recordTitle.style.fontWeight = "bold";
  recordTitle.style.color = "#ffffff";
  recordTitle.textContent = "Record: ";
  scoreContainer.appendChild(recordTitle);

  const recordDisplay = document.createElement("span");
  recordDisplay.id = "record";
  recordDisplay.textContent = "0";
  recordDisplay.style.fontSize = "28px";
  recordDisplay.style.color = "#ffcc00";
  recordDisplay.style.fontWeight = "bold";
  recordDisplay.style.transition = "transform 0.3s ease";
  scoreContainer.appendChild(recordDisplay);
}

let score = 0;
let record = 0;

const scoreDisplay = document.getElementById("score");
const recordDisplay = document.getElementById("record");

function updateScore() {
  score += 1;
  if (scoreDisplay) scoreDisplay.textContent = score;

  gsap.fromTo(
    scoreContainer,
    { scale: 1 },
    { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 }
  );

  if (score > record) {
    record = score;
    if (recordDisplay) recordDisplay.textContent = record;

    gsap.fromTo(
      recordDisplay,
      { scale: 1 },
      { scale: 1.2, duration: 0.3, ease: "elastic.out(1, 0.3)" }
    );
  }
}

function resetScore() {
  score = 0;
  if (scoreDisplay) scoreDisplay.textContent = score;
  ballVelocity.set(0, 0, 0);
  initialSpeed = 1;
}

function updateScoreVisibility() {
  if (!scoreContainer) {
    console.warn("scoreContainer n'est pas encore disponible");
    return;
  }
  if (currentPage === 2) {
    scoreContainer.style.display = "block";
  } else {
    scoreContainer.style.display = "none";
  }
}

function checkCollision() {
  const currentTime = performance.now();
  const distance = tennisRacketModel.position.distanceTo(
    tennisBallModel.position
  );

  if (distance < 10 && currentTime - lastHitTime > 200) {
    lastHitTime = currentTime;
    updateScore();

    // Calculer un vecteur de direction bas├® sur la position relative de la balle et de la raquette
    // Cela permet des rebonds plus r├®alistes bas├®s sur l'angle de frappe
    const directionVector = new THREE.Vector3()
      .subVectors(tennisBallModel.position, tennisRacketModel.position)
      .normalize();

    // Ajouter une composante upward (vers le haut) pour s'assurer que la balle va toujours vers le haut
    directionVector.y = Math.max(0.5, directionVector.y);

    // Ajouter une variation lat├®rale mais plus subtile
    const lateralVariation = (Math.random() - 0.5) * 1.2;
    directionVector.x += lateralVariation;

    // Normaliser ├á nouveau et appliquer la force
    directionVector.normalize().multiplyScalar(initialSpeed);

    // Calcul de l'effet de spin (rotation) en fonction de la position de l'impact
    const spinEffect =
      (tennisBallModel.position.x - tennisRacketModel.position.x) * 0.05;
    spinVelocity = Math.max(-0.3, Math.min(0.3, spinEffect));

    applyForceToBall(directionVector);
    initialSpeed *= speedIncrement;
  }
}

let sceneWidth, sceneHeight;
let containerCenterX, containerCenterY;

function updateSceneBounds() {
  const rect = container.getBoundingClientRect();
  const aspect = rect.width / rect.height;
  const distance = camera.position.z;

  // Ajuster les facteurs pour correspondre mieux à la zone de jeu visible
  sceneHeight = distance * Math.tan((camera.fov * Math.PI) / 360); // Augmenter la hauteur
  sceneWidth = sceneHeight * aspect; // Augmenter la largeur

  // Centrer horizontalement sur la position de la balle
  containerCenterX = BALL_POSITION.x;

  // Ajuster la position verticale pour que la bordure basse soit vraiment en bas
  const maxY = sceneHeight / 2;
  containerCenterY = maxY - 10; // Descendre le centre pour que la bordure basse soit plus basse
}
updateSceneBounds();
window.addEventListener("resize", updateSceneBounds);

function updateBallPhysics() {
  if (ballVelocity.length() > 0.01) {
    // Appliquer l'effet de gravit├® pour une trajectoire plus naturelle
    ballVelocity.y -= 0.08; // Light gravity

    // Appliquer un amortissement global (r├®sistance ├á l'air)
    ballVelocity.multiplyScalar(0.995);

    // Mettre ├á jour la position de la balle
    tennisBallModel.position.add(ballVelocity);

    const halfBallSize = tennisBallModel.scale.x * 1.5;
    const maxX = sceneWidth / 2 - halfBallSize;
    const maxY = sceneHeight / 2 - halfBallSize;

    // Rebond sur les murs lat├®raux
    if (tennisBallModel.position.x < containerCenterX - maxX) {
      // Calcul d'un rebond plus naturel
      ballVelocity.x = Math.abs(ballVelocity.x) * 0.9; // Amortissement de 10%
      tennisBallModel.position.x = containerCenterX - maxX;
      // Ajouter un l├®ger effet al├®atoire ├á la rotation
      spinVelocity += Math.random() * 0.1 - 0.05;
    } else if (tennisBallModel.position.x > containerCenterX + maxX) {
      ballVelocity.x = -Math.abs(ballVelocity.x) * 0.9; // Amortissement de 10%
      tennisBallModel.position.x = containerCenterX + maxX;
      // Ajouter un l├®ger effet al├®atoire ├á la rotation
      spinVelocity += Math.random() * 0.1 - 0.05;
    }

    // Rebond sur le plafond
    if (tennisBallModel.position.y > containerCenterY + maxY) {
      // Rebond avec amortissement
      ballVelocity.y = -Math.abs(ballVelocity.y) * 0.85; // Amortissement de 15%
      tennisBallModel.position.y = containerCenterY + maxY;
      // Ajouter un l├®ger effet de rotation
      spinVelocity += ballVelocity.x * 0.03;
    }
    // Si la balle tombe en bas
    else if (tennisBallModel.position.y < containerCenterY - maxY) {
      resetScore();
      explodeAndRecomposeBall();
    }

    // Appliquer une rotation plus naturelle bas├®e sur la direction du mouvement
    if (Math.abs(ballVelocity.x) > 0.1) {
      tennisBallModel.rotation.z -= ballVelocity.x * 0.03;
    }
  } else {
    ballVelocity.set(0, 0, 0);
    racketHit = false;
  }
}

const loader = new THREE.GLTFLoader();
// Ajouter une fonction pour g├®rer les erreurs de chargement
loader.manager = new THREE.LoadingManager();
loader.manager.onError = function (url) {
  console.error("Erreur lors du chargement de:", url);
};

let padelRacketModel, padelCourtModel;
let padelModelsLoaded = false;
let allModelsLoaded = false; // Variable pour tracker si tous les modèles sont chargés

// Bloquer le scroll pendant le chargement
document.body.classList.add("loading");

// Fonction pour bloquer les événements de scroll pendant le chargement
function blockScrollEvents(event) {
  if (!allModelsLoaded) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}

// Ajouter les listeners pour bloquer le scroll
window.addEventListener("wheel", blockScrollEvents, { passive: false });
window.addEventListener("scroll", blockScrollEvents, { passive: false });
window.addEventListener("touchmove", blockScrollEvents, { passive: false });

console.log("Start loading models - Check model paths");
console.log("Chemin actuel:", window.location.href);

function loadPadelModels(callback) {
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
        padelCourtModel.position.set(0, 0, 40);
        padelCourtModel.visible = false;
        scene.add(padelCourtModel);
        resolve();
      });
    }),
  ];

  Promise.all(promises).then(() => {
    padelModelsLoaded = true;
    console.log("Mod├¿les de padel charg├®s.");
    if (callback) callback(padelRacketModel, padelCourtModel);
  });
}

const loadingContainer = document.getElementById("loading-container");
loadingContainer.style.display = "block";

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
    initializeCameraAndScene();

    // Tous les modèles principaux sont chargés, débloquer le scroll
    allModelsLoaded = true;
    document.body.classList.remove("loading");

    // Retirer les listeners de blocage du scroll
    window.removeEventListener("wheel", blockScrollEvents);
    window.removeEventListener("scroll", blockScrollEvents);
    window.removeEventListener("touchmove", blockScrollEvents);

    console.log("Tous les modèles sont chargés, scroll débloqué");

    loadingContainer.style.opacity = "0";
    loadingContainer.style.transform = "translate(-50%, -50%) scale(0.9)";

    setTimeout(() => {
      loadingContainer.style.display = "none";
    }, 500);
  });
});

function loadTennisBallModel() {
  return new Promise((resolve) => {
    loader.load("models/tennis_ball/scene.gltf", function (gltf) {
      tennisBallModel = gltf.scene;
      tennisBallModel.scale.set(1.5, 1.5, 1.5);
      tennisBallModel = centerPivot(tennisBallModel);
      tennisBallModel.visible = false;
      resetBall();
      scene.add(tennisBallModel);
      resolve();
    });
  });
}

function loadTennisRacketModel() {
  return new Promise((resolve) => {
    loader.load("models/tennis_racket/scene.gltf", function (gltf) {
      tennisRacketModel = gltf.scene;
      tennisRacketModel.scale.set(1.5, 1.5, 1.5);
      tennisRacketModel.visible = false;
      tennisRacketModel.position.z = 0;
      scene.add(tennisRacketModel);
      initializeRacket();
      resolve();
    });
  });
}

function initializeCameraAndScene() {
  const width = window.innerWidth * 0.5;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);

  setCameraForCourt();

  gsap.to(camera.position, {
    duration: 3,
    x: camera.position.x + 50,
    y: camera.position.y - 270,
    z: camera.position.z - 1420,
    ease: "power2.inOut",
  });

  controls.target.set(0, 0, 0);
  controls.update();
}

function transitionToPadel() {
  terrainModel.visible = false;
  tennisBallModel.visible = false;
  scoreContainer.style.display = "none";

  padelRacketModel.visible = true;

  gsap.to(camera.position, {
    duration: 3,
    x: padelRacketModel.position.x + 50,
    y: padelRacketModel.position.y + 20,
    z: padelRacketModel.position.z + 100,
    ease: "power2.inOut",
    onUpdate: () => camera.lookAt(padelRacketModel.position),
    onComplete: () => {
      gsap.to(camera.position, {
        duration: 3,
        x: padelCourtModel.position.x,
        y: padelCourtModel.position.y + 150,
        z: padelCourtModel.position.z + 400,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(padelCourtModel.position),
        onComplete: () => {
          padelCourtModel.visible = true;
          document.getElementById("third-page").style.display = "block";
          thirdPageVisible = true;
        },
      });
    },
  });
}

let currentPage = 1;
let isScrolling = false;

function transitionToFirstPage() {
  if (isScrolling) return;
  isScrolling = true;
  document.getElementById("first-page").style.display = "block";
  document.getElementById("second-page").style.display = "none";
  document.getElementById("third-page").style.display = "none";

  // Enable orbit controls for page 1
  setOrbitControlsEnabled(true);

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
          updateScoreVisibility();
        },
      });
    },
  });
}

let secondPageInitialized = false;

function transitionToSecondPage() {
  if (isScrolling) return;
  isScrolling = true;
  document.getElementById("first-page").style.display = "none";
  document.getElementById("second-page").style.display = "block";
  document.getElementById("third-page").style.display = "none";

  // Disable orbit controls for page 2
  setOrbitControlsEnabled(false);

  tennisBallModel.scale.set(1.8, 1.8, 1.8);
  tennisBallModel.position.set(
    BALL_POSITION.x,
    BALL_POSITION.y,
    BALL_POSITION.z
  );
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
      data: {
        1: {
          title: "VRTPW",
          description:
            "The project aims to plan the shortest routes to deliver customers in Barcelona within specific time slots, with return to depot. Random addresses and time windows have been simulated, and the addition of multiple trucks has been tested, although the solution remains non-optimal due to lack of time.",
          topTitle: "3rd year",
          bottomTitle: "Advanced Algorithm - Python",
          link: "https://github.com/TomPerezleTiec/Advanced_Algorithm_Project",
        },
        2: {
          title: "Attrition Prediction",
          description:
            "AI project predicting employee attrition using ML models (logistic regression, random forest, SVM, neural networks). Analyzes HR factors (satisfaction, salary, overtime, training). Built with Python, scikit-learn, and TensorFlow.",
          topTitle: "3rd year",
          bottomTitle: "AI - Python",
          link: "https://github.com/TomPerezleTiec/AI-ML-Bloc",
        },
        3: {
          title: "EasySave",
          description:
            "EasySave is a backup software developed across multiple versions as part of an engineering project. The goal is to deliver a robust, cross-platform, and interactive application that integrates advanced features for backup management, security, and network optimization. We are engaged by Prosoft for this project.",
          topTitle: "3rd year",
          bottomTitle: "Software Engineering",
          link: "https://github.com/Mohamed-Gueye/Easy_save_orig",
        },
        4: {
          title: "Not yet completed",
          description: "The project description has not yet been completed.",
          topTitle: "3rd year",
          bottomTitle: "BIG DATA",
          link: "",
        },
      },
      numberOfItems: 4,
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
                x: BALL_POSITION.x,
                y: BALL_POSITION.y,
                z: BALL_POSITION.z,
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
              updateScoreVisibility();
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

let thirdPageInitialized = false;

function transitionToThirdPage(padelRacket, padelCourt) {
  document.getElementById("first-page").style.display = "none";
  document.getElementById("second-page").style.display = "none";
  document.getElementById("third-page").style.display = "block";

  // Disable orbit controls for page 3
  setOrbitControlsEnabled(false);

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
      data: {
        1: {
          title: "Tennis Tournament Live Tracker",
          description:
            "The project consists of developing a solution to track in real time the scores, match scheduling, results and photos of a tennis tournament, in order to simplify tracking for parents, players and supervisors.",
          topTitle: "My Projects",
          bottomTitle: "Website - Real-time data",
          link: "https://website-tournee.vercel.app",
        },
        2: {
          title: "Portfolio",
          description:
            "The project traces all the projects I have been able to carry out in groups or individually.",
          topTitle: "My Projects",
          bottomTitle: "Website - 3D elements management",
          link: "https://github.com/TomPerezleTiec/Portfolio",
        },
      },
      numberOfItems: 2,
    });
    thirdPageInitialized = true;
  }

  if (isScrolling || !padelModelsLoaded) return;
  isScrolling = true;

  gsap.to(tennisBallModel.scale, {
    duration: 1,
    x: 10,
    y: 10,
    z: 10,
    ease: "power2.inOut",
    onComplete: function () {
      terrainModel.visible = false;
      padelRacket.visible = true;
      padelCourt.visible = true;
      tennisBallModel.visible = false;

      camera.position.set(0, 5, 1);
      console.log(
        "Transition to third page started: camera in starting position."
      );

      gsap.to(camera.position, {
        duration: 4,
        x: 0,
        y: 7,
        z: 60,
        ease: "power2.inOut",
        onComplete: () => {
          console.log(
            "Transition to third page completed: camera in final position."
          );
          isScrolling = false;
          currentPage = 3;
          updateScoreVisibility();
        },
      });
    },
  });
}

function unloadPage3Elements() {
  if (padelRacketModel) padelRacketModel.visible = false;
  if (padelCourtModel) padelCourtModel.visible = false;

  balls.forEach((ballBody, index) => {
    const ballModel = ballModels[index];
    scene.remove(ballModel);
    world.removeBody(ballBody);
  });

  balls = [];
  ballModels = [];

  camera.position.set(0, 50, 150);
  camera.lookAt(0, 0, 0);

  console.log("Les ├®l├®ments de la page 3 ont ├®t├® d├®charg├®s.");
}

function returnToSecondPage() {
  if (isScrolling) return;
  isScrolling = true;

  document.getElementById("third-page").style.display = "none";
  document.getElementById("second-page").style.display = "block";

  // Disable orbit controls for page 2
  setOrbitControlsEnabled(false);

  // Configuration initiale de la balle exactement comme dans transitionToSecondPage
  tennisBallModel.scale.set(1.8, 1.8, 1.8);
  tennisBallModel.position.set(
    BALL_POSITION.x,
    BALL_POSITION.y,
    BALL_POSITION.z
  );
  tennisBallModel.visible = true;
  resetBall();
  updateScoreVisibility();
  // ------------------------------------------
  // SCENE CLEANUP AND RESET
  // ------------------------------------------
  unloadPage3Elements();

  // ------------------------------------------
  // BALL INITIALIZATION AND SETUP
  // ------------------------------------------
  tennisBallModel.position.set(-2000, 2000, 0);
  tennisBallModel.visible = true;

  let rotationY = 0;
  let rotationX = 0;

  // ------------------------------------------
  // BALL ENTRANCE ANIMATION
  // ------------------------------------------
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
      // ------------------------------------------
      // BALL POSITIONING AND ANIMATION
      // ------------------------------------------
      gsap.to(tennisBallModel.position, {
        x: BALL_POSITION.x,
        y: BALL_POSITION.y,
        z: BALL_POSITION.z,
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
      updateScoreVisibility();
    },
  });
  // ------------------------------------------
  // CAMERA ANIMATION AND TRANSITIONS
  // ------------------------------------------
  gsap.to(camera.position, {
    duration: 0.5,
    x: 0,
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
}

loadPadelModels((padelRacket, padelCourt) => {
  window.addEventListener("wheel", function (event) {
    if (isScrolling) return;
    if (event.deltaY > 0) {
      if (currentPage === 1) transitionToSecondPage();
      else if (currentPage === 2)
        transitionToThirdPage(padelRacket, padelCourt);
    } else {
      if (currentPage === 3) returnToSecondPage();
      else if (currentPage === 2) transitionToFirstPage();
    }
  });
});

const world = new CANNON.World();
world.gravity.set(0, -15, 0);

const groundMaterial = new CANNON.Material("groundMaterial");
const ballMaterial = new CANNON.Material("ballMaterial");

const ballGroundContact = new CANNON.ContactMaterial(
  ballMaterial,
  groundMaterial,
  {
    friction: 0.1,
    restitution: 0.9,
  }
);
world.addContactMaterial(ballGroundContact);

const ballWallContact = new CANNON.ContactMaterial(
  ballMaterial,
  groundMaterial,
  {
    friction: 0.1,
    restitution: 0.9,
  }
);
world.addContactMaterial(ballWallContact);

const ballBallContact = new CANNON.ContactMaterial(ballMaterial, ballMaterial, {
  friction: 0.3,
  restitution: 1,
});
world.addContactMaterial(ballBallContact);

const groundBody = new CANNON.Body({
  mass: 0,
  material: groundMaterial,
  shape: new CANNON.Plane(),
});

groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(0, 0.5, 40);
world.addBody(groundBody);

let balls = [];
let ballModels = [];

const linearDamping = 0.3;
const angularDamping = 0.9;

const ballRadius = 0.55;

function setupDroppingBall() {
  const newBallModel = tennisBallModel.clone();
  newBallModel.scale.set(0.2, 0.2, 0.2);
  newBallModel.visible = true;
  scene.add(newBallModel);
  ballModels.push(newBallModel);

  const newBallBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(ballRadius),
    material: ballMaterial,
  });

  newBallBody.angularVelocity.set(0, 0, 0);
  newBallBody.angularDamping = 1;
  newBallBody.updateMassProperties();

  world.addBody(newBallBody);
  balls.push(newBallBody);

  newBallBody.position.set(0, 7, 40);
  newBallModel.position.copy(newBallBody.position);

  const randomDirectionX = (Math.random() - 0.5) * 10;
  const randomDirectionZ = (Math.random() - 0.5) * 10;
  newBallBody.velocity.set(randomDirectionX, 0, randomDirectionZ);
}

function updatePhysics() {
  world.step(1 / 60);

  balls.forEach((ballBody, index) => {
    const ballModel = ballModels[index];
    ballModel.position.copy(ballBody.position);
    ballModel.quaternion.copy(ballBody.quaternion);

    ballBody.angularVelocity.set(0, 0, 0);
    if (ballBody.position.y < 0.5) {
      ballModel.visible = false;
      scene.remove(ballModel);
      world.removeBody(ballBody);
      balls.splice(index, 1);
      ballModels.splice(index, 1);
    }
  });
}

// Créer un élément pour afficher la notification de limite dans le thème du site
let limitNotification = document.createElement("div");
limitNotification.id = "limit-notification";
limitNotification.style.position = "fixed";
limitNotification.style.top = "50%";
limitNotification.style.left = "50%";
limitNotification.style.transform = "translate(-50%, -50%) scale(0.8)";
limitNotification.style.padding = "20px 30px";
limitNotification.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
limitNotification.style.color = "#ffffff";
limitNotification.style.borderRadius = "12px";
limitNotification.style.fontWeight = "bold";
limitNotification.style.fontSize = "18px";
limitNotification.style.fontFamily = '"Arial", sans-serif';
limitNotification.style.zIndex = "1000";
limitNotification.style.display = "none";
limitNotification.style.textAlign = "center";
limitNotification.style.boxShadow =
  "0px 8px 25px rgba(255, 255, 255, 0.3), 0px 0px 50px rgba(120, 220, 255, 0.2)";
limitNotification.style.border = "2px solid rgba(255, 255, 255, 0.3)";
limitNotification.style.backdropFilter = "blur(10px)";
limitNotification.style.transition = "all 0.3s ease";
limitNotification.style.opacity = "0";

// Créer le contenu avec icône et texte
const notificationContent = document.createElement("div");
notificationContent.innerHTML = `
  <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
    <span style="font-size: 24px; color: #ffcc00;">⚠️</span>
    <span>Limite de 5 balles atteinte !</span>
  </div>
`;
limitNotification.appendChild(notificationContent);
document.body.appendChild(limitNotification);

window.addEventListener("keydown", function (event) {
  if (event.code === "Space" && currentPage === 3) {
    // Limiter ├á 5 raquettes maximum
    if (balls.length < 5) {
      setupDroppingBall();
      console.log(
        "Appui sur Espace - Nouvelle balle en chute. Total:",
        balls.length
      );
    } else {
      console.log("Limite de 5 raquettes atteinte !");
      // Afficher la notification avec animation GSAP
      limitNotification.style.display = "block";

      // Animation d'entrée
      gsap.fromTo(
        limitNotification,
        {
          opacity: 0,
          scale: 0.8,
          y: -20,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );

      // Animation de sortie après 3 secondes
      gsap.to(limitNotification, {
        opacity: 0,
        scale: 0.9,
        y: -10,
        duration: 0.3,
        ease: "power2.inOut",
        delay: 3,
        onComplete: () => {
          limitNotification.style.display = "none";
        },
      });
    }
  }
});

function createWall(position, size) {
  const wall = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)),
    material: groundMaterial,
  });
  wall.position.copy(position);
  world.addBody(wall);
  return wall;
}

const wallThickness = 0.1;
const wallHeight = 10;
const courtWidth = 9.5;
const courtLength = 4;

createWall(new CANNON.Vec3(-courtWidth / 2, wallHeight / 2, 40), {
  x: wallThickness,
  y: wallHeight,
  z: courtLength,
});
createWall(new CANNON.Vec3(courtWidth / 2, wallHeight / 2, 40), {
  x: wallThickness,
  y: wallHeight,
  z: courtLength,
});
createWall(new CANNON.Vec3(0, wallHeight / 2, 40 + courtLength / 2), {
  x: courtWidth,
  y: wallHeight,
  z: wallThickness,
});
createWall(new CANNON.Vec3(0, wallHeight / 2, 40 - courtLength / 2), {
  x: courtWidth,
  y: wallHeight,
  z: wallThickness,
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer && terrainModel.visible) mixer.update(delta);

  checkCollision();
  updatePhysics();

  updateBallPhysics();

  if (spinVelocity > 0.001) {
    tennisBallModel.rotation.y += spinVelocity;
    spinVelocity *= spinDecay;
  } else {
    spinVelocity = 0;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", function () {
  const width = window.innerWidth * 0.5;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});
