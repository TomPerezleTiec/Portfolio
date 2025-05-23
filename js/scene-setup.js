// scene-setup.js
// Configuration de la scène Three.js, caméra, renderers et contrôles

// Création de la scène principale
const scene = new THREE.Scene();

// Configuration de la caméra
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

// Configuration du renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
const container = document.getElementById("canvas-container");
renderer.setSize(window.innerWidth * 0.4, window.innerHeight);
container.appendChild(renderer.domElement);

// Configuration des contrôles
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();

// Raycaster pour les interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Configuration des lumières
function setupLights() {
  // Lumière ambiante
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Lumières directionnelles
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(1, 1, 1).normalize();
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-1, 1, -1).normalize();
  scene.add(directionalLight2);

  // Lumière ponctuelle
  const pointLight = new THREE.PointLight(0xffffff, 0.3);
  pointLight.position.set(100, 200, 0);
  scene.add(pointLight);
}

// Configuration des positions de caméra
function setCameraForCourt() {
  camera.position.set(0, 305, 1500);
  camera.lookAt(0, 0, 0);
}

function setCameraForBall() {
  camera.position.set(0, 50, 150);
  camera.lookAt(0, 50, 0);
}

// Fonction d'initialisation de la caméra et de la scène
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

// Gestionnaire de redimensionnement
function setupResizeHandler() {
  window.addEventListener("resize", function () {
    const width = window.innerWidth * 0.5;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  });

  // Configuration initiale
  setTimeout(function () {
    const width = window.innerWidth * 0.5;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }, 50);
}

// Initialisation de la scène
setupLights();
setupResizeHandler();
