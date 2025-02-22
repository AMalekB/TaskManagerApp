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