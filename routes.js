import { Router } from "express";
import { getAllTasks, AddTask, UpdateTaskStatus, UpdateTask, deleteTask } from "./model/appManager.js";

const router = Router();

// Ajouter une tâche
router.post("/api/todo", (request, response) => {
    const tacheEntrée = request.body;
    try {
        const NouvelleTache = AddTask(tacheEntrée);
        response
            .status(200)
            .json({ NouvelleTache, message: "Tâche ajoutée avec succès" });
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

export default router;
