let currentTask;

// Ouvrir la modale d'ajout de tâche
function openAddTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
    modal.show();
}
document.querySelector(".btn-primary").addEventListener("click", openAddTaskModal);

// Ouvrir la modale d'édition de tâche
function openEditTaskModal(task) {
    currentTask = task;
    document.getElementById("editTaskTitle").value = task.querySelector("h6").innerText;
    document.getElementById("editTaskDescription").value = task.querySelector("p").innerText;
    document.getElementById("editTaskPriority").value = task.querySelector(".task-priority").innerText.split(": ")[1];
    document.getElementById("editTaskDueDate").value = task.querySelector(".task-due-date").innerText.split(": ")[1];

    const modal = new bootstrap.Modal(document.getElementById("editTaskModal"));
    modal.show();
}

// Fermer une modale Bootstrap
function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
}

// Ajouter une tâche
document.getElementById("addTaskButton").addEventListener("click", addTask);

// Créer la tâche et l'envoyer au backend
async function addTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    // Validation de la priorité
    if (!priority || isNaN(parseInt(priority))) {
        alert("Veuillez sélectionner une priorité valide");
        return;
    }

    try {
        const taskData = {
            titre: title,
            description: description,
            prioriteId: parseInt(priority),
            statutId: 1,
            utilisateurId: 1,
            dateLimite: dueDate
        };
        console.log('Données envoyées au serveur:', taskData);

        const response = await fetch('http://localhost:5000/api/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.warn('Erreur lors de l\'ajout de la tâche:', errorData);
            alert(`Erreur: ${errorData.error || 'Une erreur est survenue'}`);
            return;
        }

        const data = await response.json();
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
        alert('Une erreur est survenue lors de l\'ajout de la tâche.');
    }
}

// Supprimer une tâche
async function deleteTask(task) {
    if (!task) return;

    const taskId = task.getAttribute('data-id');
    if (!taskId) {
        console.warn("ID de tâche manquant.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            console.warn('Erreur lors de la suppression de la tâche');
            return;
        }

        console.log('Tâche supprimée avec succès');
        task.remove();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la suppression de la tâche.');
    }
}

// Sauvegarder les modifications d'une tâche
async function saveEditedTask() {
    if (!currentTask) {
        console.warn("Aucune tâche sélectionnée pour l'édition.");
        return;
    }

    const taskId = currentTask.getAttribute('data-id');
    if (!taskId) {
        console.warn("ID de tâche manquant.");
        return;
    }

    const title = document.getElementById("editTaskTitle").value;
    const description = document.getElementById("editTaskDescription").value;
    const priority = document.getElementById("editTaskPriority").value;
    const dueDate = document.getElementById("editTaskDueDate").value;

    // Modifier la tâche localement
    currentTask.querySelector("h6").innerText = title;
    currentTask.querySelector("p").innerText = description;
    currentTask.querySelector(".task-priority").innerText = "Priorité: " + priority;
    currentTask.querySelector(".task-due-date").innerText = "Date limite: " + dueDate;

    try {
        const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                titre: title,
                description: description,
                prioriteId: priority,
                dateLimite: dueDate,
            })
        });

        if (!response.ok) {
            console.warn('Erreur lors de la sauvegarde de la tâche');
            return;
        }

        const data = await response.json();
        console.log('Tâche modifiée :', data);
        closeModal("editTaskModal");
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la sauvegarde de la tâche.');
    }
}

document.getElementById("saveEditButton").addEventListener("click", saveEditedTask);

// Créer un élément de tâche avec boutons Modifier et Supprimer
function createTaskElement(title, description, priority, dueDate) {
    const template = document.getElementById("taskTemplate");
    const task = template.content.cloneNode(true);
    const taskContainer = document.createElement("div");

    task.querySelector("h6").textContent = title;
    task.querySelector("p").textContent = description;
    
    // Convertir l'ID de priorité en texte
    let priorityText = "Faible";
    if (priority === "1") priorityText = "Élevée";
    else if (priority === "2") priorityText = "Moyenne";
    else if (priority === "3") priorityText = "Faible";
    
    task.querySelector(".task-priority").textContent = "Priorité: " + priorityText;
    task.querySelector(".task-due-date").textContent = "Date limite: " + dueDate;

    const taskStatusSelect = task.querySelector("#taskStatus");
    taskStatusSelect.addEventListener("change", function(event) {
        changeStatus(event, taskContainer);
    });

    const editButton = task.querySelector(".btn-warning");
    editButton.addEventListener("click", function () {
        openEditTaskModal(taskContainer);
    });

    const deleteButton = task.querySelector(".btn-danger");
    deleteButton.addEventListener("click", function () {
        deleteTask(taskContainer);
    });

    taskContainer.appendChild(task);
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
        const response = await fetch(`http://localhost:5000/api/task/${taskId}/statut`, {
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
            console.warn('Erreur lors de la mise à jour du statut');
            return;
        }

        // Si la mise à jour a réussi, déplacer la tâche dans l'interface
        switch(taskStatus) {
            case "todo":
                document.getElementById("todo").appendChild(taskDiv);
                break;
            case "in-progress":
                document.getElementById("in-progress").appendChild(taskDiv);
                break;
            case "in-review":
                document.getElementById("in-review").appendChild(taskDiv);
                break;
            case "done":
                document.getElementById("done").appendChild(taskDiv);
                break;
            default:
                document.getElementById("todo").appendChild(taskDiv);
        }

        console.log('Statut mis à jour avec succès');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du changement de statut.');
    }
}

// Charger les tâches existantes
async function loadExistingTasks() {
    try {
        const response = await fetch('http://localhost:5000/api/tasks');
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
            switch (task.statutId) {
                case 1:
                    targetColumn = "todo";
                    break;
                case 2:
                    targetColumn = "in-progress";
                    break;
                case 3:
                    targetColumn = "in-review";
                    break;
                case 4:
                    targetColumn = "done";
                    break;
                default:
                    targetColumn = "todo";
            }
            document.getElementById(targetColumn).appendChild(taskElement);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Charger les tâches au démarrage
document.addEventListener('DOMContentLoaded', loadExistingTasks);
