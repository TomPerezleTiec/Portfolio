/**
 * Script pour gérer le changement de langue
 */
document.addEventListener("DOMContentLoaded", function () {
  // Langues disponibles
  const languages = {
    fr: {
      // Pages
      loadingText: "Chargement...",
      helpTextFirstPage: "Vous pouvez naviguer dans l'environnement 3D",
      helpTextSecondPage:
        "Vous pouvez jouer en mettant la souris dans l'environnement 3D et en faisant un clic gauche",
      helpTextThirdPage:
        "Appuyez sur espace pour faire tomber une raquette de padel (maximum 5 raquettes)",
      limitReached: "Limite de 5 raquettes atteinte !",

      // Navigation
      nextPage: "Page suivante",
      prevPage: "Page précédente",

      // Projets
      projectYear2: "2ème année",
      projectYear3: "3ème année",
      myProjects: "Mes Projets",

      // Technologies
      webTitleReal: "Site web - Données en temps réel",
      webTitle3D: "Site web - Gestion des éléments 3D",
      embeddedTitle: "Système Embarqué - C",
      pooTitle: "POO - C++",
      webTitleBasic: "Site web - HTML / CSS / JAVASCRIPT / PHP",
      algoTitle: "Algorythme avancée - Python",
      aiTitle: "IA - Python",
      softEngTitle: "Génie Logiciel",
      bigDataTitle: "BIG DATA",

      // Textes spécifiques
      notRealized: "Pas encore réalisé",
      notRealizedDesc: "La description du projet n'a pas encore été réalisée.",

      // Projets Page 1
      project1_1_title: "Worldwide Weather Watcher",
      project1_1_desc:
        "Le projet 'Worldwide Weather Watcher' est une station météo qui collecte, enregistre et affiche des données environnementales (température, humidité, pression, luminosité, GPS) selon différents modes. Elle utilise des capteurs, une carte SD et des LEDs pour une gestion intuitive et efficace des données et des états.",

      project1_2_title: "Application",
      project1_2_desc:
        "Le projet vise à digitaliser les processus clés d'une entreprise de vente en ligne (gestion du personnel, clients, commandes, stock et statistiques) en modélisant son système d'information pour une implémentation claire et efficace.",

      project1_3_title: "Dépistage",
      project1_3_desc:
        "Le projet consiste à créer un site web centralisant les offres de stage et stockant les données des entreprises, pour faciliter la recherche de stages des étudiants via une plateforme dédiée. Il est important de noter que le projet était presque fini et qu'une erreur d'écrasement de la branche main à rendu beaucoup de page non aboutie et remplie d'erreurs fait en début de formation.",

      // Projets Page 2
      project2_1_title: "VRTPW",
      project2_1_desc:
        "Le projet vise à planifier les itinéraires les plus courts pour livrer des clients à Barcelone dans des créneaux horaires précis, avec retour au dépôt. Des adresses et fenêtres de temps aléatoires ont été simulées, et l'ajout de plusieurs camions a été testé, bien que la solution reste non optimale par manque de temps.",

      // Projets Page 3
      project3_1_title: "Tournée de Tennis Live Tracker",
      project3_1_desc:
        "Le projet consiste à développer une solution permettant de suivre en temps réel les scores, la programmation des matchs, les résultats et les photos d'une tournée de tennis, afin de simplifier le suivi pour les parents, les joueurs et les encadrants.",

      project3_2_title: "Portfolio",
      project3_2_desc:
        "Le projet retrace tous les projets que j'ai pû réaliser en groupe ou individuellement.",
    },
    en: {
      // Pages
      loadingText: "Loading...",
      helpTextFirstPage: "You can navigate in the 3D environment",
      helpTextSecondPage:
        "You can play by moving your mouse in the 3D environment and left clicking",
      helpTextThirdPage:
        "Press space to drop a padel racket (maximum 5 rackets)",
      limitReached: "Limit of 5 rackets reached!",

      // Navigation
      nextPage: "Next page",
      prevPage: "Previous page",

      // Projets
      projectYear2: "2nd year",
      projectYear3: "3rd year",
      myProjects: "My Projects",

      // Technologies
      webTitleReal: "Website - Real-time data",
      webTitle3D: "Website - 3D elements management",
      embeddedTitle: "Embedded System - C",
      pooTitle: "OOP - C++",
      webTitleBasic: "Website - HTML / CSS / JAVASCRIPT / PHP",
      algoTitle: "Advanced Algorithm - Python",
      aiTitle: "AI - Python",
      softEngTitle: "Software Engineering",
      bigDataTitle: "BIG DATA",

      // Textes spécifiques
      notRealized: "Not yet created",
      notRealizedDesc: "The project description has not been created yet.",

      // Projets Page 1
      project1_1_title: "Worldwide Weather Watcher",
      project1_1_desc:
        "The 'Worldwide Weather Watcher' project is a weather station that collects, records, and displays environmental data (temperature, humidity, pressure, light, GPS) in different modes. It uses sensors, an SD card, and LEDs for intuitive and efficient data and status management.",

      project1_2_title: "Application",
      project1_2_desc:
        "The project aims to digitize the key processes of an online sales business (staff management, customers, orders, inventory, and statistics) by modeling its information system for clear and efficient implementation.",

      project1_3_title: "Internship Finder",
      project1_3_desc:
        "The project consists of creating a website centralizing internship offers and storing company data, to facilitate student internship searches via a dedicated platform. It is important to note that the project was almost finished and that a main branch overwrite error made many pages incomplete and filled with errors made at the beginning of training.",

      // Projets Page 2
      project2_1_title: "VRTPW",
      project2_1_desc:
        "The project aims to plan the shortest routes to deliver to customers in Barcelona during precise time slots, with return to the depot. Random addresses and time windows were simulated, and the addition of several trucks was tested, although the solution remains non-optimal due to lack of time.",

      // Projets Page 3
      project3_1_title: "Tennis Tour Live Tracker",
      project3_1_desc:
        "The project consists of developing a solution to track in real-time scores, match scheduling, results, and photos of a tennis tour, to simplify tracking for parents, players, and supervisors.",

      project3_2_title: "Portfolio",
      project3_2_desc:
        "The project traces all the projects that I have been able to carry out in groups or individually.",
    },
  };

  // Langue actuelle (par défaut: français)
  let currentLanguage = "fr";
  // Fonction pour changer la langue
  function changeLanguage(lang) {
    if (languages[lang]) {
      currentLanguage = lang;
      localStorage.setItem("preferredLanguage", lang);
      updateTexts();
      // Mettre à jour le texte d'aide après le changement de langue
      updateHelpText();
    }
  } // Fonction pour mettre à jour tous les textes (SAUF le texte d'aide)
  function updateTexts() {
    console.log("Mise à jour de tous les textes en " + currentLanguage);
    const texts = languages[currentLanguage];

    // NE PAS mettre à jour le texte d'aide ici - il est géré par les transitions de page
    // updateHelpText(); // COMMENTÉ

    // Mise à jour de la notification de limite
    const limitNotification = document.getElementById("limit-notification");
    if (limitNotification) {
      limitNotification.textContent = texts.limitReached;
      console.log("Notification de limite mise à jour: " + texts.limitReached);
    }

    // Mise à jour des éléments avec attributs data-i18n (sauf canvas-info)
    document
      .querySelectorAll("[data-i18n]:not(#canvas-info)")
      .forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (texts[key]) {
          element.textContent = texts[key];
          console.log(
            `Traduit élément ${
              element.id || element.tagName
            } avec clé ${key} en: ${texts[key]}`
          );
        }
      });

    // Mise à jour du texte de chargement
    const loadingText = document.querySelector("#loading-container p");
    if (loadingText) {
      loadingText.textContent = texts.loadingText;
      console.log("Texte de chargement mis à jour: " + texts.loadingText);
    }

    // Mise à jour des titres de projet
    updateProjectTitles(texts);

    // Mise à jour des descriptions de projet
    updateProjectDescriptions(texts);

    // Mise à jour des titres de navigation
    updateNavigationTitles(texts);

    // Mise à jour des textes d'information
    updateInfoTexts(texts);

    // Déclenchement d'un événement personnalisé pour informer les autres scripts du changement
    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: currentLanguage, texts: texts },
      })
    );
  }
  // Mise à jour des titres de projet
  function updateProjectTitles(texts) {
    console.log("Mise à jour des titres de projet en", currentLanguage);
    // Titres d'année (2ème/3ème année)
    document.querySelectorAll('[id^="top-title"]').forEach((element) => {
      console.log(
        "Élément trouvé:",
        element.id,
        "- Contenu actuel:",
        element.textContent
      );
      if (
        element.textContent.includes("année") ||
        element.textContent.includes("year")
      ) {
        if (element.textContent.includes("2")) {
          element.textContent = texts.projectYear2;
          console.log("Modifié à:", texts.projectYear2);
        } else if (element.textContent.includes("3")) {
          element.textContent = texts.projectYear3;
          console.log("Modifié à:", texts.projectYear3);
        } else if (
          element.textContent.includes("Mes Projets") ||
          element.textContent.includes("My Projects")
        ) {
          element.textContent = texts.myProjects;
          console.log("Modifié à:", texts.myProjects);
        }
      }
    });

    // Titres de technologie (bas de page)
    document.querySelectorAll('[id^="bottom-title"]').forEach((element) => {
      const text = element.textContent;
      if (
        text.includes("Site web - Données en temps réel") ||
        text.includes("Website - Real-time data")
      ) {
        element.textContent = texts.webTitleReal;
      } else if (
        text.includes("Site web - Gestion des éléments 3D") ||
        text.includes("Website - 3D elements management")
      ) {
        element.textContent = texts.webTitle3D;
      } else if (
        text.includes("Système Embarqué - C") ||
        text.includes("Embedded System - C")
      ) {
        element.textContent = texts.embeddedTitle;
      } else if (text.includes("POO - C++") || text.includes("OOP - C++")) {
        element.textContent = texts.pooTitle;
      } else if (
        text.includes("Site web - HTML / CSS / JAVASCRIPT / PHP") ||
        text.includes("Website - HTML / CSS / JAVASCRIPT / PHP")
      ) {
        element.textContent = texts.webTitleBasic;
      } else if (text.includes("Algorythme") || text.includes("Algorithm")) {
        element.textContent = texts.algoTitle;
      } else if (text.includes("IA") || text.includes("AI")) {
        element.textContent = texts.aiTitle;
      } else if (
        text.includes("Génie Logiciel") ||
        text.includes("Software Engineering")
      ) {
        element.textContent = texts.softEngTitle;
      } else if (text.includes("BIG DATA")) {
        element.textContent = texts.bigDataTitle;
      }
    });
  } // Mise à jour des descriptions de projet
  function updateProjectDescriptions(texts) {
    console.log("Mise à jour des descriptions de projet");

    // Traduction directe des textes connus ("Pas encore réalisé" / "Not yet created")
    document.querySelectorAll('[id^="title"]').forEach((element) => {
      const id = element.id;
      console.log(`Titre analysé: ${id} - Contenu: ${element.textContent}`);

      // Traiter les projets non réalisés (texte standard)
      if (
        element.textContent.includes("Pas encore réalisé") ||
        element.textContent.includes("Not yet created")
      ) {
        element.textContent = texts.notRealized;
        console.log(`Titre traduit (non réalisé): ${element.textContent}`);
      }
      // Traiter les projets spécifiques par leur ID et position
      else {
        // Déterminer la page et le numéro du projet
        let pageNum = 1;
        let projectNum = 1;

        if (id === "title") {
          // Sur la première page, le numéro de projet est déterminé par le texte visible
          const activeNumber = getActiveProjectNumber("#number-3d-container");
          if (activeNumber) projectNum = activeNumber;

          const translationKey = `project1_${projectNum}_title`;
          if (texts[translationKey]) {
            element.textContent = texts[translationKey];
            console.log(
              `Titre traduit (page 1, projet ${projectNum}): ${element.textContent}`
            );
          }
        } else if (id === "title-2") {
          // Sur la deuxième page
          pageNum = 2;
          const activeNumber = getActiveProjectNumber("#number-3d-container-2");
          if (activeNumber) projectNum = activeNumber;

          const translationKey = `project2_${projectNum}_title`;
          if (texts[translationKey]) {
            element.textContent = texts[translationKey];
            console.log(
              `Titre traduit (page 2, projet ${projectNum}): ${element.textContent}`
            );
          }
        } else if (id === "title-3") {
          // Sur la troisième page
          pageNum = 3;
          const activeNumber = getActiveProjectNumber("#number-3d-container-3");
          if (activeNumber) projectNum = activeNumber;

          const translationKey = `project3_${projectNum}_title`;
          if (texts[translationKey]) {
            element.textContent = texts[translationKey];
            console.log(
              `Titre traduit (page 3, projet ${projectNum}): ${element.textContent}`
            );
          }
        }
      }
    });

    // Traiter les descriptions de la même manière
    document.querySelectorAll('[id^="description"]').forEach((element) => {
      const id = element.id;
      const truncatedText = element.textContent.substring(0, 40) + "...";
      console.log(`Description analysée: ${id} - Contenu: ${truncatedText}`);

      // Traiter les projets non réalisés (texte standard)
      if (
        element.textContent.includes(
          "La description du projet n'a pas encore été réalisée"
        ) ||
        element.textContent.includes(
          "The project description has not been created yet"
        )
      ) {
        element.textContent = texts.notRealizedDesc;
        console.log(
          `Description traduite (non réalisé): ${element.textContent}`
        );
      }
      // Traiter les projets spécifiques par leur ID et position
      else {
        // Déterminer la page et le numéro du projet
        let pageNum = 1;
        let projectNum = 1;

        if (id === "description") {
          // Sur la première page, le numéro de projet est déterminé par le texte visible
          const activeNumber = getActiveProjectNumber("#number-3d-container");
          if (activeNumber) projectNum = activeNumber;

          const translationKey = `project1_${projectNum}_desc`;
          if (texts[translationKey]) {
            element.textContent = texts[translationKey];
            console.log(
              `Description traduite (page 1, projet ${projectNum}): ${texts[
                translationKey
              ].substring(0, 30)}...`
            );
          }
        } else if (id === "description-2") {
          // Sur la deuxième page
          pageNum = 2;
          const activeNumber = getActiveProjectNumber("#number-3d-container-2");
          if (activeNumber) projectNum = activeNumber;

          const translationKey = `project2_${projectNum}_desc`;
          if (texts[translationKey]) {
            element.textContent = texts[translationKey];
            console.log(
              `Description traduite (page 2, projet ${projectNum}): ${texts[
                translationKey
              ].substring(0, 30)}...`
            );
          }
        } else if (id === "description-3") {
          // Sur la troisième page
          pageNum = 3;
          const activeNumber = getActiveProjectNumber("#number-3d-container-3");
          if (activeNumber) projectNum = activeNumber;

          const translationKey = `project3_${projectNum}_desc`;
          if (texts[translationKey]) {
            element.textContent = texts[translationKey];
            console.log(
              `Description traduite (page 3, projet ${projectNum}): ${texts[
                translationKey
              ].substring(0, 30)}...`
            );
          }
        }
      }
    });
  }

  // Fonction utilitaire pour obtenir le numéro de projet actif dans un conteneur
  function getActiveProjectNumber(containerId) {
    const container = document.querySelector(containerId);
    if (!container) return null;

    try {
      // Trouver le modèle 3D actif (celui en avant)
      const activeModel =
        container.querySelector("THREE.Mesh")?.userData?.number;
      return activeModel || 1; // Par défaut, retourner 1 si aucun modèle actif n'est trouvé
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du numéro de projet actif:",
        error
      );
      return 1;
    }
  }

  // Mise à jour des textes de navigation
  function updateNavigationTitles(texts) {
    // Boutons de navigation (flèches gauche/droite)
    const arrows = document.querySelectorAll(".arrow");
    arrows.forEach((arrow) => {
      if (arrow.id.includes("left")) {
        arrow.setAttribute("title", texts.prevPage);
      } else if (arrow.id.includes("right")) {
        arrow.setAttribute("title", texts.nextPage);
      }
    });
  }

  // Mise à jour des textes d'information
  function updateInfoTexts(texts) {
    const infoElement = document.getElementById("info");
    if (infoElement) {
      if (
        infoElement.textContent.includes("Vous pouvez naviguer") ||
        infoElement.textContent.includes("You can navigate")
      ) {
        infoElement.textContent = texts.helpTextFirstPage;
      }
    }
  }
  // Mise à jour du texte d'aide en fonction de la page active
  function updateHelpText() {
    const canvasInfo = document.getElementById("canvas-info");
    const firstPage = document.getElementById("first-page");
    const secondPage = document.getElementById("second-page");
    const thirdPage = document.getElementById("third-page");
    const texts = languages[currentLanguage];

    if (!canvasInfo) return;

    // Vérifier quelle page est actuellement visible
    // Une page est visible si son display n'est pas "none"
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
  }

  // Observer les changements de visibilité des pages pour mettre à jour le texte d'aide
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.target.classList.contains("page") &&
        mutation.attributeName === "style"
      ) {
        updateHelpText();
      }
    });
  }); // Création de l'interface de sélection de langue
  function createLanguageSwitcher() {
    console.log("Création du sélecteur de langue");
    const switcher = document.createElement("div");
    switcher.id = "language-switcher"; // Utiliser les classes CSS au lieu des styles inline
    switcher.innerHTML = `
      <button id="lang-fr" class="lang-btn active" title="Français">FR</button>
      <button id="lang-en" class="lang-btn" title="English">EN</button>
    `;
    document.body.appendChild(switcher);
    console.log("Sélecteur de langue créé:", switcher);

    // Ajout des événements sur les boutons
    document.getElementById("lang-fr").addEventListener("click", function () {
      console.log("Clic sur FR");
      if (currentLanguage !== "fr") {
        document.getElementById("lang-en").classList.remove("active");
        this.classList.add("active");
        changeLanguage("fr");
      }
    });

    document.getElementById("lang-en").addEventListener("click", function () {
      console.log("Clic sur EN");
      if (currentLanguage !== "en") {
        document.getElementById("lang-fr").classList.remove("active");
        this.classList.add("active");
        changeLanguage("en");
      }
    });
  }
  // Initialisation
  function init() {
    // Création du sélecteur de langue
    createLanguageSwitcher();

    // Récupération de la langue préférée si stockée
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage && languages[savedLanguage]) {
      currentLanguage = savedLanguage;
      // Mise à jour de l'interface
      document
        .getElementById(`lang-${currentLanguage}`)
        .classList.add("active");
      document
        .getElementById(`lang-${currentLanguage === "fr" ? "en" : "fr"}`)
        .classList.remove("active");
    }

    // Observer les changements de page
    const firstPage = document.getElementById("first-page");
    const secondPage = document.getElementById("second-page");
    const thirdPage = document.getElementById("third-page");

    if (firstPage) observer.observe(firstPage, { attributes: true });
    if (secondPage) observer.observe(secondPage, { attributes: true });
    if (thirdPage) observer.observe(thirdPage, { attributes: true }); // Observer les changements dans les éléments de projet
    observeProjectElements();

    // Mise à jour initiale
    updateTexts();

    // Mise à jour initiale du texte d'aide
    updateHelpText();
  }

  // Fonction pour observer les changements dans les éléments de projet
  function observeProjectElements() {
    // Observer les changements des descriptions et titres
    const projectObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "characterData" ||
          mutation.type === "childList"
        ) {
          console.log(
            "Changement détecté dans le contenu de projet, mise à jour des traductions..."
          );
          updateTexts();
        }
      });
    });

    // Options pour l'observer
    const config = {
      characterData: true,
      childList: true,
      subtree: true,
    };

    // Appliquer l'observer aux conteneurs de projets
    for (let i = 1; i <= 3; i++) {
      const suffix = i > 1 ? `-${i}` : "";
      const titleEl = document.getElementById(`title${suffix}`);
      const descEl = document.getElementById(`description${suffix}`);

      if (titleEl) {
        projectObserver.observe(titleEl, config);
        console.log(`Observation du titre ${i} mise en place`);
      }

      if (descEl) {
        projectObserver.observe(descEl, config);
        console.log(`Observation de la description ${i} mise en place`);
      }
    }

    // Observer également les conteneurs 3D pour détecter les changements de projet actif
    const containers = [
      document.getElementById("number-3d-container"),
      document.getElementById("number-3d-container-2"),
      document.getElementById("number-3d-container-3"),
    ];

    containers.forEach((container, index) => {
      if (container) {
        projectObserver.observe(container, { childList: true, subtree: true });
        console.log(`Observation du conteneur 3D ${index + 1} mise en place`);
      }
    });
  } // Exposer les fonctions et données pour les autres scripts
  window.languageManager = {
    changeLanguage,
    getCurrentLanguage: () => currentLanguage,
    getTexts: () => languages[currentLanguage],
    updateAllTexts: () => updateTexts(),
    updateHelpText: () => updateHelpText(), // Ajouter cette fonction publique
    getTranslation: (key) => {
      const texts = languages[currentLanguage];
      const keys = key.split(".");
      let value = texts;
      for (const k of keys) {
        if (value[k] === undefined) return key;
        value = value[k];
      }
      return value;
    },
    // Fonction pour traduire un élément spécifique
    translateElement: (element, textKey) => {
      if (element && languages[currentLanguage][textKey]) {
        element.textContent = languages[currentLanguage][textKey];
        return true;
      }
      return false;
    },
  };
  // Initialiser le système de langue
  init();

  // Mettre à jour l'attribut lang de la balise html
  document.addEventListener("languageChanged", function (event) {
    document.documentElement.lang = event.detail.language;
    console.log("Langue changée en", event.detail.language);
  });

  // Définir la langue initiale
  document.documentElement.lang = currentLanguage; // Exécuter des mises à jour ciblées régulièrement pendant les premières secondes
  // SANS toucher au texte d'aide (canvas-info)
  let updateCount = 0;
  const updateInterval = setInterval(() => {
    const texts = languages[currentLanguage];

    // Mise à jour des éléments avec attributs data-i18n (sauf canvas-info)
    document
      .querySelectorAll("[data-i18n]:not(#canvas-info)")
      .forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (texts[key]) {
          element.textContent = texts[key];
        }
      });

    // Mise à jour des titres et descriptions de projet seulement
    updateProjectTitles(texts);
    updateProjectDescriptions(texts);

    // Mise à jour du texte de chargement
    const loadingText = document.querySelector("#loading-container p");
    if (loadingText) {
      loadingText.textContent = texts.loadingText;
    }

    // Mise à jour de la notification de limite
    const limitNotification = document.getElementById("limit-notification");
    if (limitNotification) {
      limitNotification.textContent = texts.limitReached;
    }

    updateCount++;
    if (updateCount > 10) clearInterval(updateInterval);
  }, 1000);

  // Intercepter les modifications de contenu textuel dans les éléments de titre et description
  function setupContentInterception() {
    // Intercepter les modifications directes de textContent
    const originalDescriptorTextContent = Object.getOwnPropertyDescriptor(
      Node.prototype,
      "textContent"
    );

    if (originalDescriptorTextContent && originalDescriptorTextContent.set) {
      Object.defineProperty(Node.prototype, "textContent", {
        set: function (value) {
          const result = originalDescriptorTextContent.set.call(this, value);

          // Si cet élément est un titre ou une description de projet, vérifier si une traduction existe
          if (
            this.id &&
            (this.id.startsWith("title") || this.id.startsWith("description"))
          ) {
            // Utiliser setTimeout pour laisser le DOM se mettre à jour d'abord
            setTimeout(() => updateTexts(), 10);
          }

          return result;
        },
        get: originalDescriptorTextContent.get,
        configurable: true,
      });
    }
  }

  // Configurer l'interception
  try {
    setupContentInterception();
  } catch (e) {
    console.error(
      "Impossible de configurer l'interception des modifications:",
      e
    );
  }
});
