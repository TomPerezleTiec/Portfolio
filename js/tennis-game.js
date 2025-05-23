// tennis-game.js
// Logique du jeu de tennis

import { THREE, gsap } from "./config.js";
import { scene, camera, controls, renderer, container } from "./scene-setup.js";
import {
  tennisRacketModel,
  tennisBallModel,
  terrainModel,
} from "./models-loader.js";

export const racketDepth = 0;
export const originalBallScale = { x: 3, y: 3, z: 3 };
export const bottomPortal = document.getElementById("bottom-portal");

let racketHit = false;
let ballVelocity = new THREE.Vector3(0, 0, 0);
const damping = 0.98;

let initialSpeed = 0.5;
let speedIncrement = 1.05;
let maxSpeed = 5;
let lastHitTime = 0;

let spinVelocity = 0;
const spinDecay = 0.98;

let sceneWidth, sceneHeight;
let containerCenterX, containerCenterY;
let score = 0;
let record = 0;

// Création de l'interface de score
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

const scoreDisplay = document.getElementById("score");
const recordDisplay = document.getElementById("record");

// Initialisation de la raquette
export function initializeRacket() {
  if (tennisRacketModel) {
    tennisRacketModel.rotation.x = Math.PI / 2;
    tennisRacketModel.rotation.z = 50;
  }
}

// Gestionnaires d'événements
export function setupEventListeners() {
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
      tennisBallModel.position.set(0, 35, 50);
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
}

function onMouseClick(event) {
  spinVelocity += 0.2;
}

// Fonctions de gestion de la balle
export function explodeAndRecomposeBall() {
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
        tennisBallModel.position.set(0, 35, 50);
        tennisBallModel.scale.set(0.01, 0.01, 0.01);
        tennisBallModel.visible = true;

        gsap.to(tennisBallModel.scale, {
          x: originalBallScale.x,
          y: originalBallScale.y,
          z: originalBallScale.z,
          duration: 0.4,
          ease: "power2.inOut",
        });
      });
    },
  });
}

export function applyForceToBall(force) {
  const newSpeed = Math.min(ballVelocity.length() * speedIncrement, maxSpeed);
  ballVelocity.setLength(newSpeed);
  ballVelocity.add(force);
  spinVelocity += 0.2;
}

// Fonctions de mise à jour du score
export function updateScore() {
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

export function resetScore() {
  score = 0;
  if (scoreDisplay) scoreDisplay.textContent = score;
  ballVelocity.set(0, 0, 0);
  initialSpeed = 1;
}

export function updateScoreVisibility() {
  const secondPage = document.getElementById("second-page");
  const rect = secondPage.getBoundingClientRect();

  if (rect.top < window.innerHeight && rect.bottom >= 0) {
    scoreContainer.style.display = "block";
  } else {
    scoreContainer.style.display = "none";
  }
}

// Fonctions de mise à jour de la physique du jeu
export function updateSceneBounds() {
  const rect = container.getBoundingClientRect();
  const aspect = rect.width / rect.height;
  const distance = camera.position.z;

  sceneHeight = (distance * Math.tan((camera.fov * Math.PI) / 360)) / 1.3;
  sceneWidth = (sceneHeight * aspect) / 1.15;

  containerCenterX = -0.5;
  containerCenterY = 23;
}

export function checkCollision() {
  const currentTime = performance.now();
  const distance = tennisRacketModel.position.distanceTo(
    tennisBallModel.position
  );

  if (distance < 10 && currentTime - lastHitTime > 200) {
    lastHitTime = currentTime;
    updateScore();

    const lateralVariation = (Math.random() - 0.5) * 2;
    const upwardForce = new THREE.Vector3(lateralVariation, 1, 0)
      .normalize()
      .multiplyScalar(initialSpeed);

    applyForceToBall(upwardForce);
    initialSpeed *= speedIncrement;
  }
}

export function updateBallPhysics() {
  if (ballVelocity.length() > 0.01) {
    tennisBallModel.position.add(ballVelocity);

    const halfBallSize = tennisBallModel.scale.x * 1.5;
    const maxX = sceneWidth / 2 - halfBallSize;
    const maxY = sceneHeight / 2 - halfBallSize;

    if (tennisBallModel.position.x < containerCenterX - maxX) {
      ballVelocity.x = Math.abs(ballVelocity.x);
      tennisBallModel.position.x = containerCenterX - maxX;
    } else if (tennisBallModel.position.x > containerCenterX + maxX) {
      ballVelocity.x = -Math.abs(ballVelocity.x);
      tennisBallModel.position.x = containerCenterX + maxX;
    }

    if (tennisBallModel.position.y > containerCenterY + maxY) {
      ballVelocity.y = -Math.abs(ballVelocity.y);
      tennisBallModel.position.y = containerCenterY + maxY;
    } else if (tennisBallModel.position.y < containerCenterY - maxY) {
      resetScore();
      explodeAndRecomposeBall();
    }
  } else {
    ballVelocity.set(0, 0, 0);
    racketHit = false;
  }
}

export function updateTennisGame(delta) {
  checkCollision();
  updateBallPhysics();

  if (spinVelocity > 0.001) {
    tennisBallModel.rotation.y += spinVelocity;
    spinVelocity *= spinDecay;
  } else {
    spinVelocity = 0;
  }
}

// Initialisation
updateSceneBounds();
window.addEventListener("resize", updateSceneBounds);
window.addEventListener("scroll", updateScoreVisibility);
updateScoreVisibility();
