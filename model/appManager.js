// Création d'une liste de tâches vide
const tasks  = [];
 
// Fonction pour recuperer toutes les tâches
export const getAllTasks = ()=> tasks;
 
// Fonction pour ajouter une tâche
export const AddTask = (task) => {
    const newTask = {
        id: tasks.length + 1,
        titre: task.titre,  
        description: task.description,
        priorité: task.priorité,
        statut: "À faire",
        dateLimite: task.dateLimite,
        historique: []
    };
    tasks.push(newTask);
    return newTask;
};

//Fonction pour modifier le statut d'une tâche
export const UpdateTaskStatus = (id, newStatus) => {
    const task = tasks.find((task) => task.id === Number(id));
    if (task) {
        task.statut = newStatus;
        return task;
    }
    return null;
};

// Modifier la tache
export const UpdateTask = (id, updatedTask) => {
    const task = tasks.find((task) => task.id === Number(id));
    if (task) {
        task.titre = updatedTask.titre;
        task.description = updatedTask.description;
        task.priorité = updatedTask.priorité;
        task.statut = updatedTask.statut;
        task.dateLimite = updatedTask.dateLimite;

        // Ajouter à l'historique des modifications
        task.historique.push({
            date: new Date(),
            action: "Mise à jour",
            utilisateur: "Admin"
        });

        return task;
    }
    return null;
};


 //Fonction pour supprimer une tache
 export const deleteTask = (id) => {
    const index = tasks.findIndex((task) => task.id === Number(id)); // Convertie en nombre
    if (index !== -1) {
        return tasks.splice(index, 1)[0]; // Supprime et retourne la tâche supprimée
    }
    return null;
};

