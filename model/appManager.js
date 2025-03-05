// Création d'une liste de tâches vide
const tasks  = [];
 
// Fonction pour recuperer toutes les tâches
export const getAllTasks = ()=> tasks;
 
// Fonction pour ajouter une tâche
export const AddTask = (task)=>{
    const newTask = {
        id: tasks.length + 1,
        titre,
        description,
        priorité,
        statut: "À faire",
        dateLimite,
        historique: []
    };
    tasks.push(newTask);
}

//Fonction pour modifier le statut d'une tâche
export const UpdateTaskStatus = (id,newStatus) => {
    const task = tasks.find((task) => task.id === id);
    if (task) {
        task.statut = newStatus;
        return task;
    }
    return null;
}; 
// Modifier la tache
 export const UpdateTask = (id, updatedTask) => {
    const task = tasks.find((task) => task.id === id);
    if (task) {
        task.titre = updatedTask.titre
        task.description = updatedTask.description
        task.priorité = updatedTask.priorité
        task.statut = updatedTask.statut
        task.dateLimite = updatedTask.dateLimite
        // historique: []
        return task;
    }
    return null;
 }

 //Fonction pour supprimer une tache
 const deleteTask = (id) => {
    const task = task.find ((task) => task.id ===id);
    if(task){
        tasks.splice (tasks.indexOf(task),1)
    }
    return null;

 }

