let currentTask; // Défini en haut pour éviter les erreurs

// Ouvrir la modale d'ajout de tâche
const openAddTaskModal = () => {
    const modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
    modal.show();
};

document.querySelector(".btn-primary").addEventListener("click", openAddTaskModal);

// Ouvrir la modale d'édition de tâche
const openEditTaskModal = (task) => {
    if (!task) return; // Vérification pour éviter les erreurs
    currentTask = task;
    document.getElementById("editTaskTitle").value = task.querySelector("h6").innerText;
    document.getElementById("editTaskDescription").value = task.querySelector("p").innerText;
    document.getElementById("editTaskPriority").value = task.querySelector(".task-priority").innerText.split(": ")[1];
    document.getElementById("editTaskDueDate").value = task.querySelector(".task-due-date").innerText.split(": ")[1];

    const modal = new bootstrap.Modal(document.getElementById("editTaskModal"));
    modal.show();
};

// Fermer une modale Bootstrap
const closeModal = (modalId) => {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
};

// Ajouter une tâche
document.getElementById("addTaskButton").addEventListener("click", addTask);

const addTask = async () => {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    const task = createTaskElement(title, description, priority, dueDate);

    try {
        const response = await fetch('http://localhost:5000/api/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                titre: title,
                description: description,
                prioriteId: priority,
                statutId: "todo",
                utilisateurId: 1,
                dateLimite: dueDate,
            })
        });

        if (!response.ok) {
            console.warn('Erreur lors de l\'ajout de la tâche');
            return;
        }

        const data = await response.json();
        console.log('Tâche ajoutée :', data);

        document.getElementById("todo").appendChild(task);
        closeModal("addTaskModal");
        document.getElementById("addTaskForm").reset();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'ajout de la tâche.');
    }
};

// Supprimer une tâche
const deleteTask = (task) => {
    if (task) task.remove();
};

// Sauvegarder les modifications d'une tâche
const saveEditedTask = async () => {
    if (!currentTask) {
        console.warn("Aucune tâche sélectionnée pour l'édition.");
        return;
    }

    currentTask.querySelector("h6").innerText = document.getElementById("editTaskTitle").value;
    currentTask.querySelector("p").innerText = document.getElementById("editTaskDescription").value;
    currentTask.querySelector(".task-priority").innerText = "Priorité: " + document.getElementById("editTaskPriority").value;
    currentTask.querySelector(".task-due-date").innerText = "Date limite: " + document.getElementById("editTaskDueDate").value;

    const taskId = currentTask.getAttribute('data-id');
    if (!taskId) {
        console.warn("ID de tâche manquant.");
        return;
    }

    const title = document.getElementById("editTaskTitle").value;
    const description = document.getElementById("editTaskDescription").value;
    const priority = document.getElementById("editTaskPriority").value;
    const dueDate = document.getElementById("editTaskDueDate").value;

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
};

document.getElementById("saveEditButton").addEventListener("click", saveEditedTask);

// Créer un élément de tâche avec boutons Modifier et Supprimer
const createTaskElement = (title, description, priority, dueDate) => {
    const template = document.getElementById("taskTemplate");
    const task = template.content.cloneNode(true);
    const taskContainer = document.createElement("div");

    task.querySelector("h6").textContent = title;
    task.querySelector("p").textContent = description;
    task.querySelector(".task-priority").textContent = "Priorité: " + priority;
    task.querySelector(".task-due-date").textContent = "Date limite: " + dueDate;

    const taskStatusSelect = task.getElementById("taskStatus");
    if (taskStatusSelect) {
        taskStatusSelect.addEventListener("change", function(event) {
            changeStatus(event, taskContainer);
        });
    }

    const editButton = task.querySelector(".btn-warning");
    if (editButton) {
        editButton.addEventListener("click", function () {
            openEditTaskModal(taskContainer);
        });
    }

    const deleteButton = task.querySelector(".btn-danger");
    if (deleteButton) {
        deleteButton.addEventListener("click", function () {
            deleteTask(taskContainer);
        });
    }

    taskContainer.appendChild(task);
    return taskContainer;
};

// Changer le statut de la tâche
const changeStatus = (event, taskContainer) => {
    if (!event || !taskContainer) return;

    const taskStatus = event.target.value;
    const taskDiv = taskContainer;

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
};

document.getElementById("taskStatus").addEventListener("change", changeStatus);
