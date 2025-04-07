import { Router } from "express";

import {
  getAllTasks,
  addTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskHistory,
} from "./model/appManager.js";

import { addUser } from "./model/user.js";

import {
  validateTaskData,
  validateStatus,
  validateUser,
} from "./validation.js";

const router = Router();

//Definition des routes

//Route pour la connexion
router.post("/connexion", (request, response, next) => {
  // On vérifie si le courriel et le mot de passe envoyés sont valides
  if (
    isEmailValid(request.body.email) &&
    isPasswordValid(request.body.password)
  ) {
    // On lance l'authentification avec passport.js
    passport.authenticate("local", (erreur, user, info) => {
      if (erreur) {
        // S'il y a une erreur, on la passe
        // au serveur
        next(erreur);
      } else if (!user) {
        // Si la connexion échoue, on envoit
        // l'information au client avec un code
        // 401 (Unauthorized)
        response.status(401).json(info);
      } else {
        // Si tout fonctionne, on ajoute
        // l'utilisateur dans la session et
        // on retourne un code 200 (OK)
        request.logIn(user, (erreur) => {
          if (erreur) {
            next(erreur);
          }
          // On ajoute l'utilisateur dans la session
          if (!request.session.user) {
            request.session.user = user;
          }
          response.status(200).json({
            message: "Connexion réussie",
            user,
          });
        });
      }
    })(request, response, next);
  } else {
    response.status(400).json({
      error: "Email ou mot de passe invalide",
    });
  }
});

//Route deconnexion
router.post("/deconnexion", (request, response) => {
  //Protection de la route
  if (!request.session.user) {
    response.status(401).end();
    return;
  }
  // Déconnecter l'utilisateur
  request.logOut((erreur) => {
    if (erreur) {
      next(erreur);
    }
    // Rediriger l'utilisateur vers une autre page
    response.redirect("/");
  });
});

//Route pour ajouter un utilisateur
router.post("/inscription", async (request, response) => {
  const { email, password, nom } = request.body;
  try {
    const user = await addUser(nom, email, password);
    response
      .status(200)
      .json({ user, message: "Utilisateur ajouté avec succès" });
  } catch (error) {
    console.log("error", error.code);
    if (error.code === "P2002") {
      response.status(409).json({ error: "Email déjà utilisé" });
    } else {
      response.status(400).json({ error: error.message });
    }
  }
});

router.get("/connexion", (request, response) => {
  response.render("connexion", {
    titre: "Connexion",
    styles: ["css/style.css", "css/connexion.css"],
    scripts: ["./js/connexion.js"],
  });
});

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
