import { PrismaClient, ActionType } from "@prisma/client";

// Créer une instance du client prisma
const prisma = new PrismaClient();

// Fonction pour récupérer toutes les tâches
export const getAllTasks = async () => {
  return await prisma.task.findMany();
};

// Fonction pour ajouter une tâche
export const addTask = async (task) => {
  const newTask = await prisma.task.create({
    data: {
      titre: task.titre,
      description: task.description,
      prioriteId: Number(task.prioriteId),
      statutId: Number(task.statutId),
      utilisateurId: task.utilisateurId,
      dateLimite: new Date(task.dateLimite),
    },
  });

  // Ajouter à l'historique de la tâche (création)
  await prisma.historique.create({
    data: {
      taskId: newTask.id,
      utilisateurId: task.utilisateurId,
      action: ActionType.CREATION,
      dateAction: new Date(),
    },
  });

  return newTask;
};

// Fonction pour modifier le statut d'une tâche
export const updateTaskStatus = async (id, newStatusId, utilisateurId) => {
  const task = await prisma.task.findUnique({ where: { id: Number(id) } });

  if (task) {
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { statutId: newStatusId },
    });

    // Ajouter à l'historique de la tâche (mise à jour du statut)
    await prisma.historique.create({
      data: {
        taskId: updatedTask.id,
        utilisateurId: utilisateurId,
        action: ActionType.MODIFICATION,
        dateAction: new Date(),
      },
    });

    return updatedTask;
  }

  return null;
};

// Fonction pour modifier une tâche
export const updateTask = async (id, updatedTaskData, utilisateurId) => {
  const task = await prisma.task.findUnique({ where: { id: Number(id) } });

  if (task) {
    const taskToUpdate = await prisma.task.update({
      where: { id: Number(id) },
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
        taskId: taskToUpdate.id,
        utilisateurId: utilisateurId,
        action: ActionType.MODIFICATION,
        dateAction: new Date(),
      },
    });

    return taskToUpdate;
  }

  return null;
};

// Fonction pour supprimer une tâche
export const deleteTask = async (id, utilisateurId) => {
  try {
    // Vérifier que l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: Number(utilisateurId) },
    });

    if (!utilisateur) {
      throw new Error("Utilisateur non valide");
    }

    // Récupérer la tâche
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) return null;

    // Supprimer la tâche APRÈS l'historique
    await prisma.task.delete({
      where: { id: Number(id) },
    });

    return task;
  } catch (error) {
    console.error("Erreur deleteTask :", error);
    throw new Error(error.message || "Échec de la suppression");
  }
};

// Nouvelle fonction pour récupérer l'historique d'une tâche
export const getTaskHistory = async (taskId) => {
  return await prisma.historique.findMany({
    where: { taskId: Number(taskId) },
    orderBy: { dateAction: "desc" }, // Trier par date décroissante
    include: {
      utilisateur: {
        select: { nom: true }, // Récupérer uniquement le nom de l'utilisateur
      },
    },
  });
};
