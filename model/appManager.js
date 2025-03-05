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