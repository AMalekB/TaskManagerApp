import { Router } from "express";
import {
  getAllTasks,
  addTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskHistory,
} from "./model/appManager.js";
import {
  validateTaskData,
  validateStatus,
  validateUser,
} from "./validation.js";

const router = Router();

// Route principale - rendu avec Handlebars
router.get("/", async (request, response) => {
  if (!request.session.id_user) {
    request.session.id_user = 123;
  }
  try {
    const ListeTaches = await getAllTasks();
    response.render("connexion", {
      tasks: ListeTaches,
      title: "Task Manager - Accueil",
    });
  } catch (error) {
    response.status(500).render("error", {
      message: "Erreur lors du chargement des tâches",
      error: error.message,
    });
  }
});

// Ajouter une tâche
router.post("/api/task", async (request, response) => {
  const tacheEntrée = request.body;
  try {
    // Validation des données
    const validation = validateTaskData(tacheEntrée);
    if (!validation.isValid) {
      return response.status(400).json({
        error: "Données invalides",
        details: validation.errors,
      });
    }

    const NouvelleTache = await addTask(tacheEntrée);
    response
      .status(200)
      .json({ NouvelleTache, message: "Tâche ajoutée avec succès" });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Récupérer toutes les tâches
router.get("/api/tasks", async (request, response) => {
  try {
    const ListeTaches = await getAllTasks();
    response
      .status(200)
      .json({ ListeTaches, message: "Voici la liste des tâches" });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Récupérer l'historique des modifications d'une tâche
router.get("/api/task/:id/history", async (request, response) => {
  try {
    const id = parseInt(request.params.id, 10);
    const historique = await getTaskHistory(id);

    if (historique.length > 0) {
      response.status(200).json({ historique });
    } else {
      response.status(404).json({ message: "Aucune modification trouvée" });
    }
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Modifier le statut d'une tâche
router.patch("/api/task/:id/statut", async (request, response) => {
  try {
    const id = parseInt(request.params.id, 10);
    const { statut, utilisateurId } = request.body;

    // Validation du statut
    const statusValidation = validateStatus(statut);
    if (!statusValidation.isValid) {
      return response.status(400).json({
        error: "Statut invalide",
        details: statusValidation.message,
      });
    }

    // Validation de l'utilisateur
    const userValidation = validateUser(utilisateurId);
    if (!userValidation.isValid) {
      return response.status(400).json({
        error: "Utilisateur invalide",
        details: userValidation.message,
      });
    }

    const updatedTask = await updateTaskStatus(id, statut, utilisateurId);

    if (updatedTask) {
      response
        .status(200)
        .json({ updatedTask, message: "Statut mis à jour avec succès" });
    } else {
      response.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// Modifier une tâche complète
router.put("/api/task/:id", async (request, response) => {
  try {
    const id = parseInt(request.params.id, 10);
    const taskData = request.body;
    console.log("Données reçues:", taskData);

    // Validation des données
    const validation = validateTaskData(taskData);
    if (!validation.isValid) {
      return response.status(400).json({
        error: "Données invalides",
        details: validation.errors,
      });
    }

    const updatedTask = await updateTask(
      id,
      {
        titre: taskData.titre,
        description: taskData.description,
        prioriteId: parseInt(taskData.prioriteId),
        statutId: taskData.statutId,
        dateLimite: taskData.dateLimite,
      },
      taskData.utilisateurId
    );

    if (updatedTask) {
      response
        .status(200)
        .json({ updatedTask, message: "Tâche mise à jour avec succès" });
    } else {
      response.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    response.status(400).json({ error: error.message });
  }
});

// Supprimer une tâche
router.delete("/api/task/:id", async (request, response) => {
  try {
    const id = parseInt(request.params.id, 10);
    const { utilisateurId } = request.body;

    // Validation de l'utilisateur
    const userValidation = validateUser(utilisateurId);
    if (!userValidation.isValid) {
      return response.status(400).json({
        error: "Utilisateur invalide",
        details: userValidation.message,
      });
    }

    const deletedTask = await deleteTask(id, utilisateurId);

    if (deletedTask) {
      response
        .status(200)
        .json({ message: "Tâche supprimée avec succès", deletedTask });
    } else {
      response.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

export default router;
