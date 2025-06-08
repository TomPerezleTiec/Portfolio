// project-carousel.js
// Gestion du carrousel de projets

import { scene } from "./scene-setup.js";

/**
 * Crée un carrousel de projets en 3D
 * @param {Object} options - Options de configuration du carrousel
 */
export function createModels({
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
        const color = depthFactor < 0.5 ? 0x888888 : 0xffffff;

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
      const color = depthFactor < 0.5 ? 0x888888 : 0xffffff;

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

      // Stocker le numéro de projet actif dans un attribut data- pour le language-switcher
      container.dataset.activeProject = activeNumber;

      // Déclencher un événement personnalisé pour signaler le changement de projet
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
        const color = depthFactor < 0.5 ? 0x888888 : 0xffffff;

        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.material.color.set(color);

        if (Math.abs(z - (radius - 5)) > 0.1) {
          model.material.color.set(0x888888);
          model.scale.set(0.5, 0.5, 0.5);
        }
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

// Données des projets pour chaque page
export const firstPageProjects = {
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
};

export const secondPageProjects = {
  1: {
    title: "VRTPW",
    description:
      "Le projet vise à planifier les itinéraires les plus courts pour livrer des clients à Barcelone dans des créneaux horaires précis, avec retour au dépôt. Des adresses et fenêtres de temps aléatoires ont été simulées, et l'ajout de plusieurs camions a été testé, bien que la solution reste non optimale par manque de temps.",
    topTitle: "3ème année",
    bottomTitle: "Algorythme avancée - Python",
    link: "https://github.com/TomPerezleTiec/Advanced_Algorithm_Project",
  },
  2: {
    title: "Prédiction d'Attrition HumanForYou",
    description:
      "Projet d'intelligence artificielle développé pour prédire l'attrition des employés en utilisant plusieurs modèles de machine learning : Régression Logistique, Forêt Aléatoire, SVM et Réseaux de Neurones. Le projet analyse différents facteurs comme la satisfaction au travail, le salaire, les heures supplémentaires et les opportunités de formation pour identifier les employés susceptibles de quitter l'entreprise. Développé avec Python, scikit-learn et TensorFlow.",
    topTitle: "3ème année",
    bottomTitle: "IA - Python",
    link: "https://github.com/TomPerezleTiec/AI-ML-Bloc",
  },
  3: {
    title: "Pas encore réalisé",
    description: "La description du projet n'a pas encore été réalisée.",
    topTitle: "3ème année",
    bottomTitle: "Génie Logiciel",
    link: "",
  },
  4: {
    title: "Pas encore réalisé",
    description: "La description du projet n'a pas encore été réalisée.",
    topTitle: "3ème année",
    bottomTitle: "BIG DATA",
    link: "",
  },
};

export const thirdPageProjects = {
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
};
