import passport from 'passport';


import { Router } from "express";
import crypto from "crypto";

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
  isEmailValid,
  isPasswordValid
} from "./validation.js";

const router = Router();

// Middleware de débogage pour la session
router.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
});

//Definition des routes

//Route pour la connexion
router.post("/connexion", async (req, res) => {
  try {
    console.log('Tentative de connexion avec:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      console.log('Champs manquants:', { email: !!email, password: !!password });
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    // Utilisation de Passport pour l'authentification
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Erreur d\'authentification:', err);
        return res.status(500).json({
          error: 'Erreur lors de l\'authentification'
        });
      }

      if (!user) {
        console.log('Authentification échouée:', info);
        return res.status(401).json({
          error: info.message || 'Email ou mot de passe incorrect'
        });
      }

      // Connexion réussie
      req.logIn(user, (err) => {
        if (err) {
          console.error('Erreur lors de la création de la session:', err);
          return res.status(500).json({
            error: 'Erreur lors de la création de la session'
          });
        }

        console.log('Connexion réussie pour:', user.email);
        return res.status(200).json({
          message: 'Connexion réussie',
          user: {
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom
          }
        });
      });
    })(req, res);
  } catch (error) {
    console.error('Erreur serveur lors de la connexion:', error);
    res.status(500).json({
      error: 'Une erreur est survenue lors de la connexion'
    });
  }
});

// Middleware pour vérifier si l'utilisateur est connecté
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Non autorisé" });
};

// Route pour la déconnexion
router.post("/deconnexion", isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la déconnexion" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la destruction de la session" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Déconnexion réussie" });
    });
  });
});

//Route pour l'inscription
router.post("/inscription", async (request, response) => {
  try {
    const { nom, prenom, email, password } = request.body;

    // Validation des données
    if (!nom || !prenom || !email || !password) {
      return response.status(400).json({
        error: "Tous les champs sont requis",
        details: {
          nom: !nom ? "Le nom est requis" : null,
          prenom: !prenom ? "Le prénom est requis" : null,
          email: !email ? "L'email est requis" : null,
          password: !password ? "Le mot de passe est requis" : null
        }
      });
    }

    const emailValidation = isEmailValid(email);
    const passwordValidation = isPasswordValid(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return response.status(400).json({
        error: "Validation échouée",
        details: {
          email: emailValidation.message,
          password: passwordValidation.message
        }
      });
    }

    // Création de l'utilisateur
    const user = await addUser({
      nom,
      prenom,
      email,
      password
    });

    // Redirection vers la page de connexion
    response.status(201).json({
      message: "Inscription réussie",
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    
    if (error.message === "Email déjà utilisé") {
      return response.status(409).json({
        error: "Email déjà utilisé",
        details: {
          email: "Cet email est déjà utilisé par un autre compte"
        }
      });
    }

    // Erreur de validation Prisma
    if (error.code === "P2002") {
      return response.status(409).json({
        error: "Email déjà utilisé",
        details: {
          email: "Cet email est déjà utilisé par un autre compte"
        }
      });
    }

    // Autres erreurs
    response.status(500).json({
      error: "Une erreur est survenue lors de l'inscription",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get("/connexion", (request, response) => {
  response.render("connexion", {
    titre: "Connexion",
    styles: ["css/style.css", "css/connexion.css"],
    scripts: ["./js/connexion.js"],
  });
});

//Route pour afficher la page d'inscription
router.get("/inscription", (request, response) => {
  response.render("inscription", {
    titre: "Inscription",
    styles: ["css/style.css", "css/connexion.css"],
    scripts: ["./js/inscription.js"],
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

// Route pour afficher la page de réinitialisation de mot de passe
router.get("/reset-password", (request, response) => {
  response.render("reset-password", {
    titre: "Réinitialisation du mot de passe",
    styles: ["css/style.css", "css/connexion.css"],
    scripts: ["./js/reset-password.js"],
  });
});

// Route pour gérer la demande de réinitialisation de mot de passe
router.post("/reset-password", async (request, response) => {
  try {
    const { email } = request.body;

    if (!email) {
      return response.status(400).json({
        error: "L'adresse email est requise"
      });
    }

    const emailValidation = isEmailValid(email);
    if (!emailValidation.isValid) {
      return response.status(400).json({
        error: emailValidation.message
      });
    }

    // Vérifier si l'email existe dans la base de données
    const user = await getUserByEmail(email);
    if (!user) {
      // Pour des raisons de sécurité, on renvoie toujours un succès
      // même si l'email n'existe pas
      return response.status(200).json({
        message: "Si l'email existe dans notre base de données, vous recevrez un lien de réinitialisation"
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.utilisateur.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Envoyer l'email avec le lien de réinitialisation
    // TODO: Implémenter l'envoi d'email
    // Pour l'instant, on renvoie juste un succès
    response.status(200).json({
      message: "Si l'email existe dans notre base de données, vous recevrez un lien de réinitialisation"
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    response.status(500).json({
      error: "Une erreur est survenue lors de la réinitialisation du mot de passe"
    });
  }
});

// Route de test pour vérifier la session
router.get("/test-session", (req, res) => {
  console.log("Test de session - Session ID:", req.sessionID);
  console.log("Test de session - Session:", req.session);
  console.log("Test de session - User:", req.user);
  
  if (req.session.user) {
    res.json({
      message: "Session active",
      user: req.session.user
    });
  } else {
    res.status(401).json({
      message: "Aucune session active"
    });
  }
});

export default router;
