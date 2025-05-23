// padel-game.js
// Logique du jeu de padel

import { scene } from "./scene-setup.js";
import { tennisBallModel } from "./models-loader.js";

// Configuration de la physique avec Cannon.js
export const world = new CANNON.World();
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

// Création du sol
const groundBody = new CANNON.Body({
  mass: 0,
  material: groundMaterial,
  shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(0, -0.5, 40);
world.addBody(groundBody);

// Tableaux pour stocker les balles
export let balls = [];
export let ballModels = [];

// Configuration des balles
const linearDamping = 0.3;
const angularDamping = 0.9;
const ballRadius = 0.55;

// Création des murs du court
const wallThickness = 0.1;
const wallHeight = 10;
const courtWidth = 9.5;
const courtLength = 4;

export function setupPadelCourt() {
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
}

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

// Fonction pour ajouter une nouvelle balle
export function setupDroppingBall() {
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

// Mise à jour de la physique
export function updatePhysics() {
  world.step(1 / 60);

  balls.forEach((ballBody, index) => {
    const ballModel = ballModels[index];
    ballModel.position.copy(ballBody.position);
    ballModel.quaternion.copy(ballBody.quaternion);

    ballBody.angularVelocity.set(0, 0, 0);

    if (ballBody.position.y < -0.5) {
      ballModel.visible = false;
      scene.remove(ballModel);
      world.removeBody(ballBody);
      balls.splice(index, 1);
      ballModels.splice(index, 1);
    }
  });
}

// Nettoyage des balles
export function clearBalls() {
  balls.forEach((ballBody, index) => {
    const ballModel = ballModels[index];
    scene.remove(ballModel);
    world.removeBody(ballBody);
  });

  balls = [];
  ballModels = [];
}

// Initialisation du court de padel
setupPadelCourt();
