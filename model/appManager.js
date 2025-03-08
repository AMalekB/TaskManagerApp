import { PrismaClient, ActionType } from "@prisma/client";

// Créer une instance du client prisma
const prisma = new PrismaClient();

// Création d'une liste de tâches vide
//const tasks  = [];
 
// Fonction pour recuperer toutes les tâches
export const getAllTasks = async ()=> {
    return await prisma.task.findMany();
};
 
// Fonction pour ajouter une tâche
export const addTask = async (task) => {
    // Création de la tâche dans la base de données
    const newTask = await prisma.task.create({
        data:{
            titre: task.titre,
            description: task.description,
            prioriteId: task.prioriteId,
            statutId: task.statutId,
            utilisateurId: task.utilisateurId,
            dateLimite: new Date(task.dateLimite), //Convertir la dateLimite en un objet Date
        },
    });
        
     // Ajouter à l'historique de la tâche (création)
     await prisma.historique.create({
        data: {
            taskId: newTask.id,
            utilisateurId: task.utilisateurId,
            action: ActionType.CREATION,  // Utilisation de l'enum ActionType
            dateAction: new Date(),  
        },
     });

     return newTask;
};
    


// Fonction pour modifier le statut d'une tâche
export const updateTaskStatus = async (id, newStatusId, utilisateurId) => {
    // Chercher la tâche dans la base de données
    const task = await prisma.task.findUnique({
        where: { id: Number(id) },
    });

    if (task) {
        // Mettre à jour le statut de la tâche
        const updatedTask = await prisma.task.update({
            where: { id: Number(id) },
            data: {
                statutId: newStatusId,  // Nouveau statut de la tâche
            },
        });

        // Ajouter à l'historique de la tâche (mise à jour du statut)
        await prisma.historique.create({
            data: {
                taskId: updatedTask.id,
                utilisateurId: utilisateurId, // ID de l'utilisateur ayant effectué la mise à jour
                action: ActionType.MODIFICATION, // Utilisation de l'enum ActionType
                dateAction: new Date(),  
            },
        });

        return updatedTask;  // Retourne la tâche mise à jour
    }

    // Si la tâche n'existe pas, on retourne null
    return null;
};


// Fonction pour modifier la tache
export const updateTask = async (id, updatedTaskData, utilisateurId) => {
    // Chercher la tâche dans la base de données
    const task = await prisma.task.findUnique({
        where: { id : Number(id) },
    });

    if (task) {
        // Mettre à jour les attributs de la tâche dans la base de données
        const taskToUpdate  = await prisma.task.update({
            where: { id : Number(id) },
            data: {
                titre: updatedTaskData.titre,
                description: updatedTaskData.description,
                prioriteId: updatedTaskData.prioriteId,
                statutId: updatedTaskData.statutId,
                dateLimite: updatedTaskData.dateLimite,
            },
        });
      

      // Ajouter à l'historique de la tâche (modification)
      await prisma.historique.create({
        data: {
            taskId: taskToUpdate .id,
            utilisateurId: utilisateurId,  // ID de l'utilisateur ayant effectué la mise à jour
            action: ActionType.MODIFICATION, // Utilisation de l'enum ActionType
            dateAction: new Date(),  // Utilisation du timestamp EPOCH
        },
    });

        return taskToUpdate ; // Retourner la tâche mise à jour
    }
   
    // Si la tâche n'existe pas, retourner null
    return null;
};


 //Fonction pour supprimer une tache
 export const deleteTask = async (id, utilisateurId) => {
    // Chercher la tâche dans la base de données
    const task = await prisma.task.findUnique({
        where: { id: Number(id) },
    });
   
    if (task) {
        // Supprimer la tâche de la base de données
        await prisma.task.delete({
            where: { id: Number(id) },
        });

        // Ajouter à l'historique de la tâche (suppression)
        await prisma.historique.create({
            data: {
                taskId: Number(id),
                utilisateurId: utilisateurId, // ID de l'utilisateur ayant effectué la suppression
                action: ActionType.SUPPRESSION, // Utilisation de l'enum ActionType
                dateAction: new Date(), // Utilisation du timestamp EPOCH
            },
        });

        return task; //retourne la tâche supprimée
    }

       // Si la tâche n'existe pas, retourner null
       return null;
};

