// Définir l'URL de base de l'API
const API_BASE_URL = 'http://localhost:5000/api';

// Importer les fonctions de validation
import { 
    validateTitle, 
    validateDescription, 
    validatePriority, 
    validateDueDate, 
    validateTaskData,
    showError,
    removeExistingErrors 
} from './validation.js';

// Fonction de validation combinée pour le titre, la description et la date
function validateTitleAndDescription(title, description, dueDate) {
    const errors = [];
    
    // Validation du titre
    const titleValidation = validateTitle(title);
    if (!titleValidation.isValid) {
        errors.push({ field: 'title', message: titleValidation.message });
    }

    // Validation de la description
    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.isValid) {
        errors.push({ field: 'description', message: descriptionValidation.message });
    }

    // Validation de la date
    const dueDateValidation = validateDueDate(dueDate);
    if (!dueDateValidation.isValid) {
        errors.push({ field: 'dueDate', message: dueDateValidation.message });
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

let currentTask;
let currentPriority = "3"; // Valeur par défaut

// Fonction utilitaire pour convertir l'ID de priorité en texte
function getPriorityText(priorityId) {
    // Conversion explicite en string et nettoyage
    priorityId = String(priorityId).trim();
    console.log('getPriorityText - input:', priorityId, 'type:', typeof priorityId);
    
    switch(priorityId) {
        case "1":
            return "Élevée";
        case "2":
            return "Moyenne";
        case "3":
            return "Faible";
        default:
            console.warn('getPriorityText - priorité invalide:', priorityId);
            return "Faible";
    }
}

// Fonction utilitaire pour convertir le texte de priorité en ID
function getPriorityId(priorityText) {
    // Nettoyage du texte
    priorityText = priorityText.trim();
    console.log('getPriorityId - input:', priorityText);
    
    switch(priorityText) {
        case "Élevée":
            return "1";
        case "Moyenne":
            return "2";
    
        case "Faible":
            return "3";
        default:
            console.warn('getPriorityId - texte invalide:', priorityText);
            return "3";
    }
}

// Ouvrir la modale d'ajout de tâche
function openAddTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
    modal.show();
}
document.querySelector(".btn-primary").addEventListener("click", openAddTaskModal);

// Fonction pour ouvrir la modale des détails
function openTaskDetailsModal(task) {
    const taskId = task.getAttribute('data-id');

    // Récupérer les détails de la tâche
    document.getElementById("taskDetailTitle").innerText = task.querySelector("h6").innerText;
    document.getElementById("taskDetailDescription").innerText = task.querySelector("p").innerText;
    document.getElementById("taskDetailPriority").innerText = task.querySelector(".task-priority").innerText.split(": ")[1].trim();
    document.getElementById("taskDetailDueDate").innerText = task.querySelector(".task-due-date").innerText.split(": ")[1].trim();

    // Charger l'historique de la tâche
    fetch(`http://localhost:5000/api/task/${taskId}/history`)
    .then(response => response.json())
    .then(data => {
        const historyList = document.getElementById("taskHistoryList");
        historyList.innerHTML = ""; // Nettoyer l'historique précédent
        
        if (data.historique && data.historique.length > 0) {
            data.historique.forEach(entry => {
                const listItem = document.createElement("li");
                listItem.className = "list-group-item";
                listItem.innerHTML = `<strong>${entry.utilisateur.nom}</strong> - ${entry.action.toLowerCase()} (${new Date(entry.dateAction).toLocaleString()})`;
                historyList.appendChild(listItem);
            });
        } else {
            const emptyItem = document.createElement("li");
            emptyItem.className = "list-group-item text-muted";
            emptyItem.innerText = "Aucune modification enregistrée.";
            historyList.appendChild(emptyItem);
        }
    })
    .catch(error => console.error("Erreur lors du chargement de l'historique :", error));

    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById("taskDetailsModal"));
    modal.show();
}

// Ouvrir la modale d'édition de tâche
function openEditTaskModal(task) {
    currentTask = task;
    document.getElementById("editTaskTitle").value = task.querySelector("h6").innerText;
    document.getElementById("editTaskDescription").value = task.querySelector("p").innerText;
    
    // Gestion de la priorité
    const priorityElement = task.querySelector(".task-priority");
    const priorityText = priorityElement.innerText.split(": ")[1].trim();
    console.log('openEditTaskModal - Priorité extraite:', priorityText);
    const priorityId = getPriorityId(priorityText);
    currentPriority = priorityId; // Stockage de la priorité initiale
    console.log('openEditTaskModal - ID converti:', priorityId);
    
    // Sélectionner la bonne option dans le select
    const prioritySelect = document.getElementById("editTaskPriority");
    
    // Supprimer les anciens écouteurs d'événements et créer un nouveau select
    const newPrioritySelect = document.createElement('select');
    newPrioritySelect.className = prioritySelect.className;
    newPrioritySelect.id = prioritySelect.id;
    
    // Créer les options dans l'ordre
    const options = [
        { value: "1", text: "Élevée" },
        { value: "2", text: "Moyenne" },
        { value: "3", text: "Faible" }
    ];
    
    options.forEach(opt => {
        const option = document.createElement('option');
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
    newPrioritySelect.addEventListener('change', function(event) {
        const newValue = event.target.value;
        console.log('Changement de priorité:', { 
            from: currentPriority,
            to: newValue,
            text: event.target.options[event.target.selectedIndex].text
        });
        currentPriority = newValue;
    });
    
    document.getElementById("editTaskDueDate").value = task.querySelector(".task-due-date").innerText.split(": ")[1];

    const modal = new bootstrap.Modal(document.getElementById("editTaskModal"));
    modal.show();
}

// Fermer une modale Bootstrap
//function closeModal(modalId) {
  //  const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    //if (modal) modal.hide();
//}
function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement);
    }
    modal.hide();
    
    modalElement.addEventListener('hidden.bs.modal', function () {
      // Retirer la classe qui empêche le scroll
      document.body.classList.remove('modal-open');
      // Réactiver le scroll en rétablissant l'overflow
      document.body.style.overflow = 'auto';
      // Supprimer le backdrop résiduel, s'il existe
      document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
        backdrop.remove();
      });
    }, { once: true });
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
        validation.errors.forEach(error => {
            const element = document.getElementById(`task${error.field.charAt(0).toUpperCase() + error.field.slice(1)}`);
            if (element) {
                element.parentNode.appendChild(showError(error.message));
            }
        });
        return;
    }

    // Validation de la priorité
    const priorityValidation = validatePriority(priority);
    if (!priorityValidation.isValid) {
        document.getElementById("taskPriority").parentNode.appendChild(showError(priorityValidation.message));
        return;
    }

    try {
        const taskData = {
            titre: title.trim(),
            description: description.trim(),
            prioriteId: parseInt(priority),
            statutId: 1,
            utilisateurId: 1,
            dateLimite: dueDate
        };

        // Validation complète des données
        const validation = validateTaskData(taskData);
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                alert(error);
            });
            return;
        }

        console.log('Données envoyées au serveur:', taskData);

        const response = await fetch(`${API_BASE_URL}/task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Une erreur est survenue lors de l\'ajout de la tâche');
        }

        console.log('Tâche ajoutée :', data);

        // Créer l'élément de la tâche avec les données retournées par le serveur
        const task = createTaskElement(title, description, priority, dueDate);
        task.setAttribute('data-id', data.NouvelleTache.id);

        // Ajouter la tâche dans la colonne "À faire"
        document.getElementById("todo").appendChild(task);

        closeModal("addTaskModal");
        document.getElementById("addTaskForm").reset();
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Une erreur est survenue lors de l\'ajout de la tâche.');
    }
}

// Supprimer une tâche
async function deleteTask(task) {
    if (!task) return;

    const taskId = task.getAttribute('data-id');  // Récupérer l'ID de la tâche
    if (!taskId) {
        console.warn("ID de tâche manquant.");
        return;
    }

    try {
        // Envoyer la requête DELETE au serveur
        const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ utilisateurId: 1 })  // Données nécessaires pour la suppression
        });

        // Si la suppression n'a pas fonctionné
        if (!response.ok) {
            const errorData = await response.json();
            console.warn('Erreur lors de la suppression de la tâche:', errorData);
            return;
        }

        // Si la suppression est confirmée
        console.log('Tâche supprimée avec succès');
        
        // Supprimer immédiatement la tâche du DOM
        task.remove();

    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la suppression de la tâche.');
    }
}



document.querySelectorAll('.delete-task-button').forEach(button => {
    button.addEventListener('click', () => {
        const taskElement = button.closest('.task'); // Assurez-vous que cette sélection correspond à votre structure HTML
        deleteTask(taskElement);
    });
});


// Modifier la fonction saveEditedTask
async function saveEditedTask() {
    if (!currentTask) {
        console.warn("Aucune tâche sélectionnée pour l'édition.");
        return;
    }

    removeExistingErrors();

    const taskId = currentTask.getAttribute('data-id');
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
        validation.errors.forEach(error => {
            const element = document.getElementById(`editTask${error.field.charAt(0).toUpperCase() + error.field.slice(1)}`);
            if (element) {
                element.parentNode.appendChild(showError(error.message));
            }
        });
        return;
    }

    // Validation de la priorité
    const priorityValidation = validatePriority(selectedPriority);
    if (!priorityValidation.isValid) {
        document.getElementById("editTaskPriority").parentNode.appendChild(showError(priorityValidation.message));
        return;
    }

    try {
        // Récupérer le statut actuel de la tâche
        const statusSelect = currentTask.querySelector("#taskStatus");
        let currentStatus = 1; // Par défaut "À faire"
        
        if (statusSelect) {
            const statusValue = statusSelect.value;
            switch(statusValue) {
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
            utilisateurId: 1
        };

        // Validation complète des données
        const validation = validateTaskData(taskData);
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                alert(error);
            });
            return;
        }

        console.log('Données envoyées au serveur:', taskData);

        const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Erreur lors de la sauvegarde');
        }

        // Mettre à jour l'interface avec les nouvelles données
        const taskContent = currentTask.querySelector('.border');
        if (taskContent) {
            taskContent.querySelector("h6").textContent = title;
            taskContent.querySelector("p").textContent = description;
            const priorityText = getPriorityText(selectedPriority);
            taskContent.querySelector(".task-priority").textContent = "Priorité: " + priorityText;
            taskContent.querySelector(".task-due-date").textContent = "Date limite: " + dueDate;
        }

        // Fermer la modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("editTaskModal"));
        if (modal) modal.hide();
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Une erreur est survenue lors de la sauvegarde.');
    }
}

document.getElementById("saveEditButton").addEventListener("click", saveEditedTask);

// Créer un élément de tâche avec boutons Modifier et Supprimer
function createTaskElement(title, description, priority, dueDate) {
    const template = document.getElementById("taskTemplate");
    const task = template.content.cloneNode(true);
    const taskContainer = document.createElement("div");

    const taskContent = task.querySelector('.border');
    if (taskContent) {
        taskContent.querySelector("h6").textContent = title;
        taskContent.querySelector("p").textContent = description;
        const priorityText = getPriorityText(priority);
        console.log('Création élément - priorité:', {
            id: priority,
            text: priorityText
        });
        taskContent.querySelector(".task-priority").textContent = "Priorité: " + priorityText;
        taskContent.querySelector(".task-due-date").textContent = "Date limite: " + dueDate;

        const taskStatusSelect = taskContent.querySelector("#taskStatus");

        // Définir la valeur initiale du select en fonction de la colonne parente
        const parentColumn = taskContainer.parentElement;
        if (parentColumn) {
            taskStatusSelect.value = parentColumn.id;
        }

        taskStatusSelect.addEventListener("change", function(event) {
            changeStatus(event, taskContainer);
        });

        const editButton = taskContent.querySelector(".btn-warning");
        editButton.addEventListener("click", function () {
            openEditTaskModal(taskContainer);
        });

        const deleteButton = taskContent.querySelector(".btn-danger");
        deleteButton.addEventListener("click", function () {
            deleteTask(taskContainer);
        });

        const detailsButton = taskContent.querySelector(".btn-success"); 
        detailsButton.addEventListener("click", function () {
            openTaskDetailsModal(taskContainer);
        });

        // Créer un container pour les boutons Modifier, Supprimer et Détails
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "d-flex gap-2 mt-2"; 

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(detailsButton); 

        taskContent.appendChild(buttonContainer);
        taskContainer.appendChild(taskContent);
    }

    return taskContainer;
}
// Changer le statut de la tâche
async function changeStatus(event, taskContainer) {
    const taskStatus = event.target.value;
    const taskDiv = taskContainer;
    const taskId = taskDiv.getAttribute('data-id');

    // Convertir le statut en ID
    let newStatusId;
    switch(taskStatus) {
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
        // Mettre à jour le statut dans la base de données
        const response = await fetch(`${API_BASE_URL}/task/${taskId}/statut`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                statut: newStatusId,
                utilisateurId: 1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la mise à jour du statut');
        }

        // Si la mise à jour a réussi, déplacer la tâche dans l'interface
        let targetColumn;
        switch(taskStatus) {
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
            statusSelect.style.display = 'none';
            statusSelect.offsetHeight;
            statusSelect.style.display = '';
        }

        console.log('Statut mis à jour avec succès');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du changement de statut: ' + error.message);
        // Remettre le select à sa valeur précédente
        event.target.value = taskDiv.parentElement.id;
    }
}

// Charger les tâches existantes
async function loadExistingTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des tâches');
        }
        const data = await response.json();
        
        // Pour chaque tâche dans la liste
        data.ListeTaches.forEach(task => {
            const taskElement = createTaskElement(
                task.titre,
                task.description,
                task.prioriteId.toString(),
                new Date(task.dateLimite).toISOString().split('T')[0]
            );
            taskElement.setAttribute('data-id', task.id);

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
        console.error('Erreur:', error);
    }
}

// Charger les tâches au démarrage
document.addEventListener('DOMContentLoaded', loadExistingTasks);

// Gestionnaires pour les compteurs de caractères
document.addEventListener('DOMContentLoaded', function() {
    // Compteurs pour la modale d'ajout
    const taskTitle = document.getElementById('taskTitle');
    const taskTitleCount = document.getElementById('taskTitleCount');
    const taskDescription = document.getElementById('taskDescription');
    const taskDescriptionCount = document.getElementById('taskDescriptionCount');

    // Compteurs pour la modale d'édition
    const editTaskTitle = document.getElementById('editTaskTitle');
    const editTaskTitleCount = document.getElementById('editTaskTitleCount');
    const editTaskDescription = document.getElementById('editTaskDescription');
    const editTaskDescriptionCount = document.getElementById('editTaskDescriptionCount');

    // Mise à jour des compteurs pour la modale d'ajout
    if (taskTitle && taskTitleCount) {
        taskTitle.addEventListener('input', function() {
            taskTitleCount.textContent = this.value.length;
        });
    }

    if (taskDescription && taskDescriptionCount) {
        taskDescription.addEventListener('input', function() {
            taskDescriptionCount.textContent = this.value.length;
        });
    }

    // Mise à jour des compteurs pour la modale d'édition
    if (editTaskTitle && editTaskTitleCount) {
        editTaskTitle.addEventListener('input', function() {
            editTaskTitleCount.textContent = this.value.length;
        });
    }

    if (editTaskDescription && editTaskDescriptionCount) {
        editTaskDescription.addEventListener('input', function() {
            editTaskDescriptionCount.textContent = this.value.length;
        });
    }
});
