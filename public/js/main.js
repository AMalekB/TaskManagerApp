// Définir l'URL de base de l'API
const API_BASE_URL = "https://localhost:5000/api";

// Importer les fonctions de validation
import {
  validateTitle,
  validateDescription,
  validatePriority,
  validateDueDate,
  validateTaskData,
  showError,
  removeExistingErrors,
} from "./validation.js";

// Fonction de validation combinée pour le titre, la description et la date
function validateTitleAndDescription(title, description, dueDate) {
  const errors = [];

  // Validation du titre
  const titleValidation = validateTitle(title);
  if (!titleValidation.isValid) {
    errors.push({ field: "title", message: titleValidation.message });
  }

  // Validation de la description
  const descriptionValidation = validateDescription(description);
  if (!descriptionValidation.isValid) {
    errors.push({
      field: "description",
      message: descriptionValidation.message,
    });
  }

  // Validation de la date
  const dueDateValidation = validateDueDate(dueDate);
  if (!dueDateValidation.isValid) {
    errors.push({ field: "dueDate", message: dueDateValidation.message });
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

let currentTask;
let currentPriority = "3"; // Valeur par défaut

// Fonction utilitaire pour convertir l'ID de priorité en texte
function getPriorityText(priorityId) {
  // Conversion explicite en string et nettoyage
  priorityId = String(priorityId).trim();
  console.log(
    "getPriorityText - input:",
    priorityId,
    "type:",
    typeof priorityId
  );

  switch (priorityId) {
    case "1":
      return "Élevée";
    case "2":
      return "Moyenne";
    case "3":
      return "Faible";
    default:
      console.warn("getPriorityText - priorité invalide:", priorityId);
      return "Faible";
  }
}

// Fonction utilitaire pour convertir le texte de priorité en ID
function getPriorityId(priorityText) {
  // Nettoyage du texte
  priorityText = priorityText.trim();
  console.log("getPriorityId - input:", priorityText);

  switch (priorityText) {
    case "Élevée":
      return "1";
    case "Moyenne":
      return "2";
    case "Faible":
      return "3";
    default:
      console.warn("getPriorityId - texte invalide:", priorityText);
      return "3";
  }
}

// Ouvrir la modale d'ajout de tâche
function openAddTaskModal() {
  const modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
  modal.show();
}

// Initialiser les écouteurs d'événements seulement si nous sommes sur la page des tâches
document.addEventListener("DOMContentLoaded", () => {
  const addTaskButton = document.querySelector(".btn-primary");
  if (addTaskButton) {
    addTaskButton.addEventListener("click", openAddTaskModal);
  }

  // Charger les tâches existantes seulement si nous sommes sur la page des tâches
  const taskList = document.getElementById("taskList");
  if (taskList) {
    loadExistingTasks();
  }

  // Ajouter les écouteurs d'événements pour les boutons de tâche
  document.addEventListener("click", (event) => {
    if (event.target.closest(".delete-task-button")) {
      const taskElement = event.target.closest(".task");
      if (taskElement) deleteTask(taskElement);
    }

    if (event.target.closest(".btn-warning")) {
      // Cible le bouton Modifier
      const taskElement = event.target.closest(".task");
      if (taskElement) openEditTaskModal(taskElement);
    }
  });

  // Ajouter l'écouteur pour le bouton de sauvegarde d'édition
  const saveEditButton = document.getElementById("saveEditButton");
  if (saveEditButton) {
    saveEditButton.addEventListener("click", saveEditedTask);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(".btn-success")) {
      const taskElement = event.target.closest(".task");
      if (taskElement) {
        openTaskDetailsModal(taskElement);
      }
    }
  });

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        const response = await fetch("/deconnexion", {
          method: "POST",
          credentials: "same-origin", // Inclure les cookies de session
        });

        if (response.ok) {
          // Rediriger vers la page "welcome"
          window.location.href = "/";
        } else {
          alert("Erreur lors de la déconnexion.");
        }
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        alert("Une erreur est survenue lors de la déconnexion.");
      }
    });
  }
});

// Fonction pour ouvrir la modale des détails
function openTaskDetailsModal(task) {
  const taskId = task.getAttribute("data-id");
  const fullDescription =
    task.dataset.fullDescription || "Aucune description disponible";

  // Récupérer les détails de la tâche
  const titleElement = document.getElementById("taskDetailTitle");
  if (titleElement) {
    titleElement.innerText =
      task.querySelector("h6")?.innerText || "Titre non spécifié";
  }

  const descriptionElement = document.getElementById("taskDetailDescription");
  if (descriptionElement) {
    descriptionElement.innerText = fullDescription;
  }

  const priorityElement = task.querySelector(".task-priority");
  const priorityText = priorityElement
    ? priorityElement.innerText.split(": ")[1]?.trim()
    : "Non spécifiée";
  const priorityDetailElement = document.getElementById("taskDetailPriority");
  if (priorityDetailElement) {
    priorityDetailElement.innerText = priorityText;
  }

  const dueDateElement = task.querySelector(".task-due-date");
  const dueDateText = dueDateElement
    ? dueDateElement.innerText.split(": ")[1]?.trim()
    : "Non spécifiée";
  const dueDateDetailElement = document.getElementById("taskDetailDueDate");
  if (dueDateDetailElement) {
    dueDateDetailElement.innerText = dueDateText;
  }

  // Charger l'historique de la tâche
  fetch(`/api/task/${taskId}/history`)
    .then((response) => response.json())
    .then((data) => {
      const historyList = document.getElementById("taskHistoryList");
      if (historyList) {
        historyList.innerHTML = "";

        if (data.historique && data.historique.length > 0) {
          data.historique.forEach((entry) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.innerHTML = `<strong>${
              entry.utilisateur.nom
            }</strong> - ${entry.action.toLowerCase()} (${new Date(
              entry.dateAction
            ).toLocaleString()})`;
            historyList.appendChild(listItem);
          });
        } else {
          const emptyItem = document.createElement("li");
          emptyItem.className = "list-group-item text-muted";
          emptyItem.innerText = "Aucune modification enregistrée.";
          historyList.appendChild(emptyItem);
        }
      }
    })
    .catch((error) =>
      console.error("Erreur lors du chargement de l'historique :", error)
    );

  // Ouvrir la modale
  const modal = new bootstrap.Modal(
    document.getElementById("taskDetailsModal")
  );
  modal.show();
}

// Ouvrir la modale d'édition de tâche
function openEditTaskModal(task) {
  currentTask = task;

  document.getElementById("editTaskTitle").value =
    task.querySelector("h6").innerText;
  document.getElementById("editTaskDescription").value =
    task.querySelector("p").innerText;

  // Gestion de la priorité
  const priorityElement = task.querySelector(".task-priority");
  const priorityText = priorityElement.innerText.split(": ")[1].trim();
  console.log("openEditTaskModal - Priorité extraite:", priorityText);
  const priorityId = getPriorityId(priorityText);
  currentPriority = priorityId; // Stockage de la priorité initiale
  console.log("openEditTaskModal - ID converti:", priorityId);

  // Sélectionner la bonne option dans le select
  const prioritySelect = document.getElementById("editTaskPriority");

  // Supprimer les anciens écouteurs d'événements et créer un nouveau select
  const newPrioritySelect = document.createElement("select");
  newPrioritySelect.className = prioritySelect.className;
  newPrioritySelect.id = prioritySelect.id;

  // Créer les options dans l'ordre
  const options = [
    { value: "1", text: "Élevée" },
    { value: "2", text: "Moyenne" },
    { value: "3", text: "Faible" },
  ];

  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.text;
    if (opt.value === priorityId) {
      option.selected = true;
    }
    newPrioritySelect.appendChild(option);
  });

  // Remplacer l'ancien select
  prioritySelect.parentNode.replaceChild(newPrioritySelect, prioritySelect);

  // Ajouter le nouvel écouteur
  newPrioritySelect.addEventListener("change", function (event) {
    const newValue = event.target.value;
    console.log("Changement de priorité:", {
      from: currentPriority,
      to: newValue,
      text: event.target.options[event.target.selectedIndex].text,
    });
    currentPriority = newValue;
  });

  document.getElementById("editTaskDueDate").value = task
    .querySelector(".task-due-date")
    .innerText.split(": ")[1];

  const modal = new bootstrap.Modal(document.getElementById("editTaskModal"));
  modal.show();
}

// Fermer une modale Bootstrap
function closeModal(modalId) {
  const modalElement = document.getElementById(modalId);
  let modal = bootstrap.Modal.getInstance(modalElement);
  if (!modal) {
    modal = new bootstrap.Modal(modalElement);
  }
  modal.hide();

  modalElement.addEventListener(
    "hidden.bs.modal",
    function () {
      // Retirer la classe qui empêche le scroll
      document.body.classList.remove("modal-open");
      // Réactiver le scroll en rétablissant l'overflow
      document.body.style.overflow = "auto";
      // Supprimer le backdrop résiduel, s'il existe
      document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
        backdrop.remove();
      });
    },
    { once: true }
  );
}

// Ajouter une tâche
document.getElementById("addTaskButton").addEventListener("click", addTask);

// Fonction pour vérifier si une chaîne contient des caractères spéciaux
function containsSpecialCharacters(str) {
  // Regex pour détecter les caractères spéciaux (sauf les accents)
  const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  return specialCharsRegex.test(str);
}

// Modifier la fonction addTask
async function addTask() {
  removeExistingErrors();

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const priority = document.getElementById("taskPriority").value;
  const dueDate = document.getElementById("taskDueDate").value;

  // Validation combinée du titre, de la description et de la date
  const validation = validateTitleAndDescription(title, description, dueDate);
  if (!validation.isValid) {
    validation.errors.forEach((error) => {
      const element = document.getElementById(
        `task${error.field.charAt(0).toUpperCase() + error.field.slice(1)}`
      );
      if (element) {
        element.parentNode.appendChild(showError(error.message));
      }
    });
    return;
  }

  // Validation de la priorité
  const priorityValidation = validatePriority(priority);
  if (!priorityValidation.isValid) {
    document
      .getElementById("taskPriority")
      .parentNode.appendChild(showError(priorityValidation.message));
    return;
  }

  try {
    // Récupérer l'utilisateur connecté
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser?.id) {
      throw new Error("Utilisateur non connecté");
    }

    const taskData = {
      titre: title.trim(),
      description: description.trim(),
      prioriteId: parseInt(priority),
      statutId: 1,
      utilisateurId: currentUser.id,
      dateLimite: dueDate,
    };

    // Validation complète des données
    const validation = validateTaskData(taskData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        alert(error);
      });
      return;
    }

    console.log("Données envoyées au serveur:", taskData);

    const response = await fetch(`/api/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
    console.log("Réponse de l'API:", data);

    if (!response.ok) {
      throw new Error(
        data.error || "Une erreur est survenue lors de l'ajout de la tâche"
      );
    }

    if (!data.NouvelleTache?.id) {
      throw new Error(
        "L'ID de la tâche est manquant dans la réponse du serveur"
      );
    }

    // Correction cruciale : Vérification du template
    const template = document.getElementById("taskTemplate");
    if (!template) {
      throw new Error("Le template de tâche est introuvable dans le DOM");
    }

    // Utilisation des données du serveur
    const task = createTaskElement(
      data.NouvelleTache.titre,
      data.NouvelleTache.description,
      data.NouvelleTache.prioriteId,
      data.NouvelleTache.dateLimite
    );

    if (!task) {
      throw new Error("Échec de la création de l'élément de tâche");
    }

    task.setAttribute("data-id", data.NouvelleTache.id);
    document.getElementById("todo").appendChild(task);

    closeModal("addTaskModal");
    document.getElementById("addTaskForm").reset();
  } catch (error) {
    console.error("Erreur:", error);
    alert(
      error.message || "Une erreur est survenue lors de l'ajout de la tâche."
    );
  }
}

// Supprimer une tâche
async function deleteTask(task) {
  if (!task) return;

  const taskId = task.getAttribute("data-id"); // Récupérer l'ID de la tâche
  if (!taskId) {
    console.warn("ID de tâche manquant.");
    return;
  }

  try {
    // Envoyer la requête DELETE au serveur
    const response = await fetch(`/api/task/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ utilisateurId: 1 }), // Données nécessaires pour la suppression
    });

    // Si la suppression n'a pas fonctionné
    if (!response.ok) {
      const errorData = await response.json();
      console.warn("Erreur lors de la suppression de la tâche:", errorData);
      return;
    }

    // Si la suppression est confirmée
    console.log("Tâche supprimée avec succès");

    // Supprimer immédiatement la tâche du DOM
    task.remove();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Une erreur est survenue lors de la suppression de la tâche.");
  }
}

// Enregistrer les changements d'une tâche
async function saveEditedTask() {
  if (!currentTask) {
    console.warn("Aucune tâche sélectionnée pour l'édition.");
    return;
  }

  removeExistingErrors();

  const taskId = currentTask.getAttribute("data-id");
  if (!taskId) {
    console.warn("ID de tâche manquant.");
    return;
  }

  const title = document.getElementById("editTaskTitle").value;
  const description = document.getElementById("editTaskDescription").value;
  const dueDate = document.getElementById("editTaskDueDate").value;
  const prioritySelect = document.getElementById("editTaskPriority");
  const selectedPriority = prioritySelect.value;

  // Validation combinée du titre, de la description et de la date
  const validation = validateTitleAndDescription(title, description, dueDate);
  if (!validation.isValid) {
    validation.errors.forEach((error) => {
      const element = document.getElementById(
        `editTask${error.field.charAt(0).toUpperCase() + error.field.slice(1)}`
      );
      if (element) {
        element.parentNode.appendChild(showError(error.message));
      }
    });
    return;
  }

  // Validation de la priorité
  const priorityValidation = validatePriority(selectedPriority);
  if (!priorityValidation.isValid) {
    document
      .getElementById("editTaskPriority")
      .parentNode.appendChild(showError(priorityValidation.message));
    return;
  }

  try {
    // Récupérer l'utilisateur connecté depuis le sessionStorage
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser?.id) {
      throw new Error("Vous devez être connecté pour modifier une tâche");
    }

    // Récupérer le statut actuel de la tâche
    const statusSelect = currentTask.querySelector("#taskStatus");
    let currentStatus = 1; // Par défaut "À faire"

    if (statusSelect) {
      const statusValue = statusSelect.value;
      switch (statusValue) {
        case "todo":
          currentStatus = 1;
          break;
        case "in-progress":
          currentStatus = 2;
          break;
        case "in-review":
          currentStatus = 3;
          break;
        case "done":
          currentStatus = 4;
          break;
      }
    }

    const taskData = {
      titre: title.trim(),
      description: description.trim(),
      prioriteId: parseInt(selectedPriority),
      statutId: currentStatus,
      dateLimite: new Date(dueDate).toISOString(),
      utilisateurId: currentUser.id, // Utilisation de l'ID de l'utilisateur connecté
    };

    // Validation complète des données
    const validation = validateTaskData(taskData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        alert(error);
      });
      return;
    }

    console.log("Données envoyées au serveur:", taskData);

    const response = await fetch(`/api/task/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Erreur lors de la sauvegarde");
    }

    // Mettre à jour l'interface avec les nouvelles données
    const taskContent = currentTask.querySelector(".border");
    if (taskContent) {
      taskContent.querySelector("h6").textContent = title;
      taskContent.querySelector("p").textContent = description;
      const priorityText = getPriorityText(selectedPriority);
      taskContent.querySelector(".task-priority").textContent =
        "Priorité: " + priorityText;
      taskContent.querySelector(".task-due-date").textContent =
        "Date limite: " + dueDate;
    }

    // Fermer la modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editTaskModal")
    );
    if (modal) modal.hide();
  } catch (error) {
    console.error("Erreur:", error);
    alert(error.message || "Une erreur est survenue lors de la sauvegarde.");
  }
}

// Créer un élément de tâche avec boutons Modifier et Supprimer
function createTaskElement(title, description, priority, dueDate, taskId) {
  try {
    const template = document.getElementById("taskTemplate");
    if (!template) {
      throw new Error("Template 'taskTemplate' non trouvé");
    }

    const clone = template.content.cloneNode(true);
    const taskElement = clone.querySelector(".task");

    // Remplissage des données
    taskElement.querySelector("h6").textContent = title || "Titre non spécifié";
    taskElement.querySelector(".task-description-short").textContent =
      description || "Description non spécifiée";
    taskElement.querySelector(".task-priority").textContent = `Priorité: ${
      getPriorityText(priority) || "Non spécifiée"
    }`;
    taskElement.querySelector(".task-due-date").textContent = dueDate
      ? `Date limite: ${new Date(dueDate).toLocaleDateString("fr-FR")}`
      : "Date limite: Non spécifiée";

    // Ajout de l'attribut data-id
    taskElement.setAttribute("data-id", taskId);

    // Gestion du select pour le statut
    const statusSelect = taskElement.querySelector("#taskStatus");
    if (statusSelect) {
      statusSelect.addEventListener("change", (event) =>
        changeStatus(event, taskElement)
      );
    }

    return taskElement;
  } catch (error) {
    console.error("Erreur dans createTaskElement :", error);
    return null;
  }
}

// Changer le statut de la tâche
async function changeStatus(event, taskContainer) {
  const taskStatus = event.target.value;
  const taskDiv = taskContainer;
  const taskId = taskDiv.getAttribute("data-id");

  // Convertir le statut en ID
  let newStatusId;
  switch (taskStatus) {
    case "todo":
      newStatusId = 1;
      break;
    case "in-progress":
      newStatusId = 2;
      break;
    case "in-review":
      newStatusId = 3;
      break;
    case "done":
      newStatusId = 4;
      break;
    default:
      newStatusId = 1;
  }

  try {
    // Récupérer l'utilisateur connecté
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser?.id) {
      throw new Error(
        "Vous devez être connecté pour modifier le statut d'une tâche"
      );
    }

    // Mettre à jour le statut dans la base de données
    const response = await fetch(`/api/task/${taskId}/statut`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statut: newStatusId,
        utilisateurId: currentUser.id, // Utilisation de l'ID de l'utilisateur connecté
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Erreur lors de la mise à jour du statut"
      );
    }

    // Si la mise à jour a réussi, déplacer la tâche dans l'interface
    let targetColumn;
    switch (taskStatus) {
      case "todo":
        targetColumn = document.getElementById("todo");
        break;
      case "in-progress":
        targetColumn = document.getElementById("in-progress");
        break;
      case "in-review":
        targetColumn = document.getElementById("in-review");
        break;
      case "done":
        targetColumn = document.getElementById("done");
        break;
      default:
        targetColumn = document.getElementById("todo");
    }

    // Déplacer la tâche

    targetColumn.appendChild(taskDiv);

    // Mettre à jour le select pour refléter le nouveau statut
    const statusSelect = taskDiv.querySelector("#taskStatus");
    if (statusSelect) {
      statusSelect.value = taskStatus;

      // Forcer un rafraîchissement visuel
      statusSelect.style.display = "none";
      statusSelect.offsetHeight;
      statusSelect.style.display = "";
    }

    console.log("Statut mis à jour avec succès");
  } catch (error) {
    console.error("Erreur:", error);
    alert(
      "Une erreur est survenue lors du changement de statut: " + error.message
    );
    // Remettre le select à sa valeur précédente
    event.target.value = taskDiv.parentElement.id;
  }
}

// Charger les tâches existantes
async function loadExistingTasks() {
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des tâches");
    }
    const data = await response.json();

    // Pour chaque tâche dans la liste
    data.ListeTaches.forEach((task) => {
      const taskElement = createTaskElement(
        task.titre,
        task.description,
        task.prioriteId.toString(),
        new Date(task.dateLimite).toISOString().split("T")[0]
      );
      taskElement.setAttribute("data-id", task.id);

      // Ajouter dans la bonne colonne selon le statut
      let targetColumn;
      let statusValue;
      switch (task.statutId) {
        case 1:
          targetColumn = "todo";
          statusValue = "todo";
          break;
        case 2:
          targetColumn = "in-progress";
          statusValue = "in-progress";
          break;
        case 3:
          targetColumn = "in-review";
          statusValue = "in-review";
          break;
        case 4:
          targetColumn = "done";
          statusValue = "done";
          break;
        default:
          targetColumn = "todo";
          statusValue = "todo";
      }

      // Ajouter la tâche à la colonne
      document.getElementById(targetColumn).appendChild(taskElement);

      // Mettre à jour le select pour refléter le statut actuel
      const statusSelect = taskElement.querySelector("#taskStatus");
      if (statusSelect) {
        statusSelect.value = statusValue;
      }
    });
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Charger les tâches au démarrage
document.addEventListener("DOMContentLoaded", loadExistingTasks);

// Gestionnaires pour les compteurs de caractères
document.addEventListener("DOMContentLoaded", function () {
  // Compteurs pour la modale d'ajout
  const taskTitle = document.getElementById("taskTitle");
  const taskTitleCount = document.getElementById("taskTitleCount");
  const taskDescription = document.getElementById("taskDescription");
  const taskDescriptionCount = document.getElementById("taskDescriptionCount");

  // Compteurs pour la modale d'édition
  const editTaskTitle = document.getElementById("editTaskTitle");
  const editTaskTitleCount = document.getElementById("editTaskTitleCount");
  const editTaskDescription = document.getElementById("editTaskDescription");
  const editTaskDescriptionCount = document.getElementById(
    "editTaskDescriptionCount"
  );

  // Mise à jour des compteurs pour la modale d'ajout
  if (taskTitle && taskTitleCount) {
    taskTitle.addEventListener("input", function () {
      taskTitleCount.textContent = this.value.length;
    });
  }

  if (taskDescription && taskDescriptionCount) {
    taskDescription.addEventListener("input", function () {
      taskDescriptionCount.textContent = this.value.length;
    });
  }

  // Mise à jour des compteurs pour la modale d'édition
  if (editTaskTitle && editTaskTitleCount) {
    editTaskTitle.addEventListener("input", function () {
      editTaskTitleCount.textContent = this.value.length;
    });
  }

  if (editTaskDescription && editTaskDescriptionCount) {
    editTaskDescription.addEventListener("input", function () {
      editTaskDescriptionCount.textContent = this.value.length;
    });
  }
});
