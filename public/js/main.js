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

function addTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    const task = createTaskElement(title, description, priority, dueDate);
    document.getElementById("todo").appendChild(task);

    closeModal("addTaskModal");
    document.getElementById("addTaskForm").reset();
}

// Supprimer une tâche
function deleteTask(task) {
    task.remove();
}

// Sauvegarder les modifications d'une tâche
function saveEditedTask() {
    currentTask.querySelector("h6").innerText = document.getElementById("editTaskTitle").value;
    currentTask.querySelector("p").innerText = document.getElementById("editTaskDescription").value;
    currentTask.querySelector(".task-priority").innerText = "Priorité: " + document.getElementById("editTaskPriority").value;
    currentTask.querySelector(".task-due-date").innerText = "Date limite: " + document.getElementById("editTaskDueDate").value;

    closeModal("editTaskModal");
}
document.getElementById("saveEditButton").addEventListener("click", saveEditedTask);

// Créer un élément de tâche avec boutons Modifier et Supprimer
function createTaskElement(title, description, priority, dueDate) {
    const template = document.getElementById("taskTemplate");
    const task = template.content.cloneNode(true);
    const taskContainer = document.createElement("div");

    task.querySelector("h6").textContent = title;
    task.querySelector("p").textContent = description;
    task.querySelector(".task-priority").textContent = "Priorité: " + priority;
    task.querySelector(".task-due-date").textContent = "Date limite: " + dueDate;

    // Ajout de l'événement pour le changement de statut
    const taskStatusSelect = task.getElementById("taskStatus");  
    taskStatusSelect.addEventListener("change", function(event) {
        changeStatus(event, taskContainer);
    });

    // Ajouter les événements pour les boutons
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
function changeStatus(event, taskContainer) {
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
}
document.getElementById("taskStatus").addEventListener("change", changeStatus);
