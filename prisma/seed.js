// On importe le PrismaClient depuis la librairie Prisma
import { PrismaClient, ActionType } from "@prisma/client";

// Création d'une instance de PrismaClient pour interagir avec la base de données
const prisma = new PrismaClient();

async function main() {
  // Création des priorités
  const highPriority = await prisma.priorite.create({
    data: { niveau: "Élevée" }, // On insère une priorité "Élevée"
  });
  const mediumPriority = await prisma.priorite.create({
    data: { niveau: "Moyenne" }, // On insère une priorité "Moyenne"
  });
  const lowPriority = await prisma.priorite.create({
    data: { niveau: "Faible" }, // On insère une priorité "Faible"
  });

  // Création des statuts
  const todoStatus = await prisma.statut.create({
    data: { type: "À faire" }, // On insère un statut "À faire"
  });
  const inProgressStatus = await prisma.statut.create({
    data: { type: "En cours" }, // On insère un statut "En cours"
  });
  const inReviewStatus = await prisma.statut.create({
    data: { type: "En révision" }, // On insère un statut "En révision"
  });
  const doneStatus = await prisma.statut.create({
    data: { type: "Terminée" }, // On insère un statut "Terminée"
  });

  // Création d'utilisateurs de test
  const user1 = await prisma.utilisateur.create({
    data: {
      nom: "defaultUser", // Utilisateur par défaut
      email: "defaultUser@example.com",
      password: "password",
      role: "admin",
    },
  });

  // Création d'une tâche de test
  const task = await prisma.task.create({
    data: {
      titre: "Ma première tâche",
      description: "Une tâche pour tester",
      prioriteId: highPriority.id, // Priorité de la tâche (haute)
      statutId: todoStatus.id, // Statut de la tâche (à faire)
      utilisateurId: user1.id, // L'utilisateur associé à la tâche (Utilisateur par défaut)
      dateLimite: new Date(), // Date limite (timestamp en millisecondes)
    },
  });

  // Ajout d'un historique pour cette tâche (action de création)
  await prisma.historique.create({
    data: {
      taskId: task.id, // L'ID de la tâche
      utilisateurId: user1.id, // Utilisateur qui a effectué l'action (Utilisateur par défaut)
      action: ActionType.CREATION, // Utilisation de l'enum ActionType
      dateAction: new Date(), // Date et heure de l'action
    },
  });

  console.log("Données insérées avec succès!");
}

// Lancement de la fonction main
main()
  .catch((e) => {
    throw e; // En cas d'erreur, on la jette
  })
  .finally(async () => {
    await prisma.$disconnect(); // Déconnexion propre de Prisma
  });
