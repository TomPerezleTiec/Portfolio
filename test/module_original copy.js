// ------------------------------------------
// INITIALIZATION AND DEPENDENCIES CHECK
// ------------------------------------------

let currentPage = 1;

// ------------------------------------------
// THREE.JS SCENE SETUP
// ------------------------------------------

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

const BALL_POSITION = { x: 0, y: 25, z: 50 };

setTimeout(function () {
  const width = window.innerWidth * 0.5;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.render(scene, camera);
}, 50);

// ------------------------------------------
// UTILITY FUNCTIONS
// ------------------------------------------

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

// ------------------------------------------
// RENDERER AND LIGHTING SETUP
// ------------------------------------------

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

// ------------------------------------------
// GLOBAL VARIABLES
// ------------------------------------------

let mixer,
  terrainModel,
  tennisBallModel,
  tennisRacketModel = false,
  tennisCourtVisible = true;

// Déclarations pour éviter les erreurs de variables non définies
let limitNotification = null;
let notificationTimer = null;
let thirdPageVisible = false;

// ------------------------------------------
// PROJECT CAROUSEL SYSTEM
// ------------------------------------------

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

      container.dataset.activeProject = activeNumber;

      const event = new CustomEvent("projectChanged", {
        detail: {
          containerId: containerId,
          activeNumber: activeNumber,
        },
      });
      document.dispatchEvent(event);

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
        "Le projet 'Worldwide Weather Watcher' est une station météo qui collecte, enregistre et affiche des données environnementales (température, humidité, pression, luminosité, GPS) selon différents modes. Elle utilise des capteurs, une carte SD et des LEDs pour une gestion intuitive et efficace des données et des états.",
      topTitle: "2ème année",
      bottomTitle: "Système Embarqué - C",
      link: "https://github.com/TomPerezleTiec/Projet-Syst-me-Embarqu-",
    },
    2: {
      title: "Application",
      description:
        "Le projet vise à digitaliser les processus clés d'une entreprise de vente en ligne (gestion du personnel, clients, commandes, stock et statistiques) en modélisant son système d'information pour une implémentation claire et efficace.",
      topTitle: "2ème année",
      bottomTitle: "POO - C++",
      link: "https://github.com/BDF172/Projet-POO",
    },
    3: {
      title: "Dépistage",
      description:
        "Le projet consiste à créer un site web centralisant les offres de stage et stockant les données des entreprises, pour faciliter la recherche de stages des étudiants via une plateforme dédiée. Il est important de noter que le projet était presque fini et qu'une erreur d'écrasement de la branche main à rendu beaucoup de page non aboutie et remplie d'erreurs fait en début de formation.",
      topTitle: "2ème année",
      bottomTitle: "Site web - HTML / CSS / JAVASCRIPT / PHP",
      link: "https://github.com/JeremyMaille/ProjetWeb",
    },
  },
  numberOfItems: 3,
});

// ------------------------------------------
// CAMERA CONFIGURATION FUNCTIONS
// ------------------------------------------

function setCameraForCourt() {
  camera.position.set(0, 305, 1500);
  camera.lookAt(0, 0, 0);
}

function setCameraForBall() {
  camera.position.set(0, 45, 150);
  camera.lookAt(0, 25, 0);
}

setCameraForBall();

// ------------------------------------------
// GAME OBJECTS INITIALIZATION FUNCTIONS
// ------------------------------------------

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

// ------------------------------------------
// MOUSE AND INTERACTION EVENT HANDLERS
// ------------------------------------------

const originalBallScale = { x: 1.8, y: 1.8, z: 1.8 };
const bottomPortal = document.getElementById("bottom-portal");

container.addEventListener("mouseenter", function () {
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
  container.style.cursor = "default";
  if (tennisBallModel.visible) {
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

// ------------------------------------------
// TENNIS BALL ANIMATION AND PHYSICS SYSTEM
// ------------------------------------------

window.addEventListener("click", onMouseClick, false);
function onMouseClick(event) {
  spinVelocity += 0.2;
}

function explodeAndRecomposeBall() {
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
        const rect = container.getBoundingClientRect();
        const mouseX = window.event ? window.event.clientX : 0;
        const mouseY = window.event ? window.event.clientY : 0;
        const mouseIsInside =
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom;

        gsap.to(tennisBallModel.scale, {
          x: mouseIsInside ? originalBallScale.x * 0.25 : originalBallScale.x,
          y: mouseIsInside ? originalBallScale.y * 0.25 : originalBallScale.y,
          z: mouseIsInside ? originalBallScale.z * 0.25 : originalBallScale.z,
          duration: 0.4,
          ease: "power2.inOut",
        });
      });
    },
  });
}

// ------------------------------------------
// TENNIS GAME PHYSICS VARIABLES
// ------------------------------------------

let racketHit = false;
let ballVelocity = new THREE.Vector3(0, 0, 0);
const damping = 0.98;

let initialSpeed = 0.5;
let speedIncrement = 1.05;
let maxSpeed = 5;
let lastHitTime = 0;

let spinVelocity = 0;
const spinDecay = 0.98;

function applyForceToBall(force) {
  let currentSpeed = ballVelocity.length();
  const newSpeed = Math.min(currentSpeed * speedIncrement, maxSpeed);

  if (currentSpeed < 0.1) {
    ballVelocity.copy(force);
  } else {
    ballVelocity.multiplyScalar(0.2);
    ballVelocity.add(force.multiplyScalar(0.8));
    ballVelocity.normalize().multiplyScalar(newSpeed);
  }

  spinVelocity = Math.max(-0.3, Math.min(0.3, force.x * 0.15));
}

// ------------------------------------------
// SCORE SYSTEM AND UI MANAGEMENT
// ------------------------------------------

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

setTimeout(() => {
  updateScoreVisibility();
}, 100);

// ------------------------------------------
// COLLISION DETECTION AND BALL PHYSICS
// ------------------------------------------

function checkCollision() {
  const currentTime = performance.now();
  const distance = tennisRacketModel.position.distanceTo(
    tennisBallModel.position
  );
  if (distance < 10 && currentTime - lastHitTime > 200) {
    lastHitTime = currentTime;
    updateScore();

    const directionVector = new THREE.Vector3()
      .subVectors(tennisBallModel.position, tennisRacketModel.position)
      .normalize();
    directionVector.y = Math.max(0.4, directionVector.y);

    const lateralVariation = (Math.random() - 0.5) * 1.2;
    directionVector.x += lateralVariation;
    directionVector.normalize().multiplyScalar(initialSpeed);

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
  sceneHeight = (distance * Math.tan((camera.fov * Math.PI) / 360)) / 1.3;
  sceneWidth = (sceneHeight * aspect) / 1.15;
  containerCenterX = -0.5;
  containerCenterY = 20;
}
updateSceneBounds();
window.addEventListener("resize", updateSceneBounds);

function updateBallPhysics() {
  if (ballVelocity.length() > 0.01) {
    ballVelocity.y -= 0.08;

    ballVelocity.multiplyScalar(0.995);

    tennisBallModel.position.add(ballVelocity);

    const halfBallSize = tennisBallModel.scale.x * 1.5;
    const maxX = sceneWidth / 2 - halfBallSize;
    const maxY = sceneHeight / 2 - halfBallSize;

    if (tennisBallModel.position.x < containerCenterX - maxX) {
      ballVelocity.x = Math.abs(ballVelocity.x) * 0.9;
      tennisBallModel.position.x = containerCenterX - maxX;
      spinVelocity += Math.random() * 0.1 - 0.05;
    } else if (tennisBallModel.position.x > containerCenterX + maxX) {
      ballVelocity.x = -Math.abs(ballVelocity.x) * 0.9;
      tennisBallModel.position.x = containerCenterX + maxX;
      spinVelocity += Math.random() * 0.1 - 0.05;
    }
    if (tennisBallModel.position.y > containerCenterY + maxY) {
      ballVelocity.y = -Math.abs(ballVelocity.y) * 0.85;
      tennisBallModel.position.y = containerCenterY + maxY;
      spinVelocity += ballVelocity.x * 0.03;
    } else if (tennisBallModel.position.y < containerCenterY - maxY) {
      resetScore();
      explodeAndRecomposeBall();
    }

    if (Math.abs(ballVelocity.x) > 0.1) {
      tennisBallModel.rotation.z -= ballVelocity.x * 0.03;
    }
  } else {
    ballVelocity.set(0, 0, 0);
    racketHit = false;
  }
}

// ------------------------------------------
// 3D MODEL LOADER AND MANAGER SETUP
// ------------------------------------------

const loader = new THREE.GLTFLoader();
loader.manager = new THREE.LoadingManager();
loader.manager.onError = function (url) {
  console.error("Erreur lors du chargement de:", url);
};

let padelRacketModel, padelCourtModel;
let padelModelsLoaded = false;

function loadPadelModels(callback) {
  const promises = [
    new Promise((resolve, reject) => {
      loader.load(
        "models/padel_racket/scene.gltf",
        function (gltf) {
          padelRacketModel = gltf.scene;
          padelRacketModel.scale.set(100, 100, 100);
          padelRacketModel.rotation.y = 190;
          padelRacketModel.position.set(0, 0, -2);
          padelRacketModel.visible = false;
          scene.add(padelRacketModel);
          resolve();
        },
        undefined,
        function (error) {
          console.error("Erreur chargement padel racket:", error);
          reject(error);
        }
      );
    }),
    new Promise((resolve, reject) => {
      loader.load(
        "models/padel_court/scene.gltf",
        function (gltf) {
          padelCourtModel = gltf.scene;
          padelCourtModel.scale.set(0.5, 0.5, 0.5);
          padelCourtModel.position.set(0, 0, 40);
          padelCourtModel.visible = false;
          scene.add(padelCourtModel);
          resolve();
        },
        undefined,
        function (error) {
          console.error("Erreur chargement padel court:", error);
          reject(error);
        }
      );
    }),
  ];

  Promise.all(promises)
    .then(() => {
      padelModelsLoaded = true;
      if (callback) callback(padelRacketModel, padelCourtModel);
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des modèles padel:", error);
    });
}

const loadingContainer = document.getElementById("loading-container");
loadingContainer.style.display = "block";

loader.load(
  "models/tennis_court/scene.gltf",
  function (gltf) {
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

    Promise.all([loadTennisBallModel(), loadTennisRacketModel()])
      .then(() => {
        initializeCameraAndScene();

        loadingContainer.style.opacity = "0";
        loadingContainer.style.transform = "translate(-50%, -50%) scale(0.9)";

        setTimeout(() => {
          loadingContainer.style.display = "none";
        }, 500);
      })
      .catch((error) => {
        console.error(
          "Erreur lors du chargement des modèles de tennis:",
          error
        );
        loadingContainer.innerHTML = "Erreur de chargement des modèles";
      });
  },
  undefined,
  function (error) {
    console.error("Erreur chargement tennis court:", error);
    loadingContainer.innerHTML = "Erreur de chargement du court de tennis";
  }
);

function loadTennisBallModel() {
  return new Promise((resolve, reject) => {
    loader.load(
      "models/tennis_ball/scene.gltf",
      function (gltf) {
        const ballScene = gltf.scene;
        ballScene.scale.set(1.5, 1.5, 1.5);
        tennisBallModel = centerPivot(ballScene);
        tennisBallModel.visible = false;
        resetBall();
        scene.add(tennisBallModel);
        resolve();
      },
      undefined,
      function (error) {
        console.error("Erreur chargement tennis ball:", error);
        reject(error);
      }
    );
  });
}

function loadTennisRacketModel() {
  return new Promise((resolve, reject) => {
    loader.load(
      "models/tennis_racket/scene.gltf",
      function (gltf) {
        tennisRacketModel = gltf.scene;
        tennisRacketModel.scale.set(1.5, 1.5, 1.5);
        tennisRacketModel.visible = false;
        tennisRacketModel.position.z = 0;
        scene.add(tennisRacketModel);
        initializeRacket();
        resolve();
      },
      undefined,
      function (error) {
        console.error("Erreur chargement tennis racket:", error);
        reject(error);
      }
    );
  });
}

// ------------------------------------------
// SCENE INITIALIZATION AND CAMERA CONTROLS
// ------------------------------------------

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

// ------------------------------------------
// PAGE TRANSITIONS AND NAVIGATION
// ------------------------------------------

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

let isScrolling = false;

function transitionToFirstPage() {
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
            "Le projet vise à planifier les itinéraires les plus courts pour livrer des clients à Barcelone dans des créneaux horaires précis, avec retour au dépôt. Des adresses et fenêtres de temps aléatoires ont été simulées, et l'ajout de plusieurs camions a été testé, bien que la solution reste non optimale par manque de temps.",
          topTitle: "3ème année",
          bottomTitle: "Algorythme avancée - Python",
          link: "https://github.com/TomPerezleTiec/Advanced_Algorithm_Project",
        },
        2: {
          title: "Prédiction d'Attrition",
          description:
            "Projet d'IA prédisant l'attrition des employés via des modèles ML (régression logistique, forêt aléatoire, SVM, réseaux de neurones). Analyse de facteurs RH (satisfaction, salaire, heures sup, formation). Réalisé en Python avec scikit-learn et TensorFlow.",
          topTitle: "3ème année",
          bottomTitle: "IA - Python",
          link: "https://github.com/TomPerezleTiec/AI-ML-Bloc",
        },
        3: {
          title: "EasySave",
          description:
            "EasySave est un logiciel de sauvegarde développé en plusieurs versions dans le cadre d'un projet d'ingénierie. L'objectif est de livrer une application robuste, multiplateforme et interactive qui intègre des fonctionnalités avancées pour la gestion des sauvegardes, la sécurité et l'optimisation réseau. Nous sommes engagés par Prosoft pour ce projet.",
          topTitle: "3ème année",
          bottomTitle: "Génie Logiciel",
          link: "https://github.com/Mohamed-Gueye/Easy_save_orig",
        },
        4: {
          title: "Pas encore réalisé",
          description: "La description du projet n'a pas encore été réalisée.",
          topTitle: "3ème année",
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
      scoreContainer.style.display = "block";

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
                y: 24,
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
                y: 45,
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
          title: "Tournée de Tennis Live Tracker",
          description:
            "Le projet consiste à développer une solution permettant de suivre en temps réel les scores, la programmation des matchs, les résultats et les photos d'une tournée de tennis, afin de simplifier le suivi pour les parents, les joueurs et les encadrants.",
          topTitle: "Mes Projets",
          bottomTitle: "Site web - Données en temps réel",
          link: "https://website-tournee.vercel.app",
        },
        2: {
          title: "Portfolio",
          description:
            "Le projet retrace tous les projets que j'ai pû réaliser en groupe ou individuellement.",
          topTitle: "Mes Projets",
          bottomTitle: "Site web - Gestion des éléments 3D",
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

      gsap.to(camera.position, {
        duration: 4,
        x: 0,
        y: 7,
        z: 60,
        ease: "power2.inOut",
        onComplete: () => {
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
  // ------------------------------------------
  // CAMERA RESET AND POSITIONING
  // ------------------------------------------
  camera.position.set(0, 45, 150);
  camera.lookAt(0, 25, 0);
}

function returnToSecondPage() {
  if (isScrolling) return;
  isScrolling = true;

  document.getElementById("third-page").style.display = "none";
  document.getElementById("second-page").style.display = "block";

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
        x: 0,
        y: 24,
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
      scoreContainer.style.display = "block";
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
        y: 45,
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

// ------------------------------------------
// CANNON.JS PHYSICS SYSTEM FOR PADEL GAME
// ------------------------------------------

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

// ------------------------------------------
// PADEL GAME BALL PHYSICS
// ------------------------------------------

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
      // ------------------------------------------
      // BALL CLEANUP AND REMOVAL
      // ------------------------------------------
      ballModel.visible = false;
      scene.remove(ballModel);
      world.removeBody(ballBody);
      balls.splice(index, 1);
      ballModels.splice(index, 1);
    }
  });
}

window.addEventListener("keydown", function (event) {
  if (event.code === "Space" && currentPage === 3) {
    // Simplified ball dropping without notification system
    if (balls.length < 5) {
      setupDroppingBall();
    }
  }
});

// ------------------------------------------
// PADEL COURT WALL CONSTRUCTION
// ------------------------------------------

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

// ------------------------------------------
// MAIN ANIMATION AND RENDER LOOP
// ------------------------------------------

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
