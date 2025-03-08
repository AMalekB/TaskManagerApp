import { Router } from "express";
import { getAllTasks, addTask, updateTaskStatus, updateTask, deleteTask } from "./model/appManager.js";

const router = Router();

// Ajouter une tâche
router.post("/api/task", async (request, response) => {
    const tacheEntrée = request.body;
    try {
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
        response.status(200).json({ ListeTaches, message: "Voici la liste des tâches" });
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

// Modifier le statut d'une tâche
router.patch("/api/task/:id/statut", async (request, response) => {
    try {
        const id = parseInt(request.params.id, 10);
        const { statut, utilisateurId } = request.body;
        const updatedTask = await updateTaskStatus(id, statut, utilisateurId);

        if (updatedTask) {
            response.status(200).json({ updatedTask, message: "Statut mis à jour avec succès" });
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
        const { titre, description, priorité, statut, dateLimite, utilisateurId } = request.body;
        const updatedTask = await updateTask(id, { titre, description, priorité, statut, dateLimite}, utilisateurId );

        if (updatedTask) {
            response.status(200).json({ updatedTask, message: "Tâche mise à jour avec succès" });
        } else {
            response.status(404).json({ message: "Tâche non trouvée" });
        }
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});   

// Supprimer une tâche
router.delete("/api/task/:id", async (request, response) => {
    try {
        const id = parseInt(request.params.id, 10);
        const { utilisateurId } = request.body;  // Récupérer l'utilisateur depuis le body
        const deletedTask = await deleteTask(id, utilisateurId);

        if (deletedTask) {
            response.status(200).json({ message: "Tâche supprimée avec succès", deletedTask });
        } else {
            response.status(404).json({ message: "Tâche non trouvée" });
        }
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
}); 


export default router;
