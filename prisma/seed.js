// On importe le PrismaClient depuis la librairie Prisma
import pkg from "@prisma/client";
const { PrismaClient, ActionType } = pkg;


// Création d'une instance de PrismaClient pour interagir avec la base de données
const prisma = new PrismaClient();

async function main() {
  // Création des priorités
  const existingPriority = await prisma.priorite.findFirst({
    where: { niveau: "Élevée" },
  });

  let highPriority;

  if (existingPriority) {
    highPriority = existingPriority; // Si elle existe déjà, on l'utilise.
  } else {
    highPriority = await prisma.priorite.create({
      data: { niveau: "Élevée" }, // Si elle n'existe pas, on la crée.
    });
  }

  const existingMediumPriority = await prisma.priorite.findFirst({
    where: { niveau: "Moyenne" },
  });

  let mediumPriority;

  if (existingMediumPriority) {
    mediumPriority = existingMediumPriority; // Si elle existe déjà, on l'utilise.
  } else {
    mediumPriority = await prisma.priorite.create({
      data: { niveau: "Moyenne" }, // Si elle n'existe pas, on la crée.
    });
  }

  const existingLowPriority = await prisma.priorite.findFirst({
    where: { niveau: "Faible" },
  });

  let lowPriority;

  if (existingLowPriority) {
    lowPriority = existingLowPriority; // Si elle existe déjà, on l'utilise.
  } else {
    lowPriority = await prisma.priorite.create({
      data: { niveau: "Faible" }, // Si elle n'existe pas, on la crée.
    });
  }

  // Création des statuts
  const existingTodoStatus = await prisma.statut.findFirst({
    where: { type: "À faire" },
  });

  let todoStatus;

  if (existingTodoStatus) {
    todoStatus = existingTodoStatus; // Si le statut existe déjà, on l'assigne
  } else {
    todoStatus = await prisma.statut.create({
      data: { type: "À faire" }, // Sinon, on le crée
    });
  }

  const existingInProgressStatus = await prisma.statut.findFirst({
    where: { type: "En cours" },
  });

  let inProgressStatus;

  if (existingInProgressStatus) {
    inProgressStatus = existingInProgressStatus; // Si le statut existe déjà, on l'assigne
  } else {
    inProgressStatus = await prisma.statut.create({
      data: { type: "En cours" }, // Sinon, on le crée
    });
  }

  const existingInReviewStatus = await prisma.statut.findFirst({
    where: { type: "En révision" },
  });

  let inReviewStatus;

  if (existingInReviewStatus) {
    inReviewStatus = existingInReviewStatus; // Si le statut existe déjà, on l'assigne
  } else {
    inReviewStatus = await prisma.statut.create({
      data: { type: "En révision" }, // Sinon, on le crée
    });
  }

  const existingDoneStatus = await prisma.statut.findFirst({
    where: { type: "Terminée" },
  });

  let doneStatus;

  if (existingDoneStatus) {
    doneStatus = existingDoneStatus; // Si le statut existe déjà, on l'assigne
  } else {
    doneStatus = await prisma.statut.create({
      data: { type: "Terminée" }, // Sinon, on le crée
    });
  }

  // Création d'utilisateurs de test
  const existingUser = await prisma.utilisateur.findFirst({
    where: { email: "defaultUser@example.com" },
  });

  let user1;

  if (existingUser) {
    user1 = existingUser; // Si l'utilisateur existe déjà, on l'assigne
  } else {
    user1 = await prisma.utilisateur.create({
      data: {
        nom: "defaultUser",
        email: "defaultUser@example.com",
        password: "password",
        role: "admin",
      },
    });
  }

  // Création d'une tâche de test
  const existingTask = await prisma.task.findFirst({
    where: { titre: "Ma première tâche" }, // recherche la tâche par titre
  });

  let task;

  if (existingTask) {
    task = existingTask; // Si la tâche existe déjà, on l'assigne
  } else {
    task = await prisma.task.create({
      data: {
        titre: "Ma première tâche",
        description: "Une tâche pour tester",
        prioriteId: highPriority.id,
        statutId: todoStatus.id,
        utilisateurId: user1.id,
        dateLimite: new Date(),
      },
    });
  }

  // Ajout d'un historique pour cette tâche (action de création)
  const existingHistorique = await prisma.historique.findFirst({
    where: {
      taskId: task.id,
      utilisateurId: user1.id,
      action: ActionType.CREATION,
    },
  });

  let historique;

  if (existingHistorique) {
    historique = existingHistorique; // Si l'historique existe déjà, on l'assigne
  } else {
    historique = await prisma.historique.create({
      data: {
        taskId: task.id,
        utilisateurId: user1.id,
        action: ActionType.CREATION,
        dateAction: new Date(),
      },
    });
  }

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
