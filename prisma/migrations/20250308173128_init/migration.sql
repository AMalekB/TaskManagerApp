-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prioriteId" INTEGER NOT NULL,
    "statutId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "dateLimite" BIGINT NOT NULL,
    CONSTRAINT "Task_prioriteId_fkey" FOREIGN KEY ("prioriteId") REFERENCES "Priorite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_statutId_fkey" FOREIGN KEY ("statutId") REFERENCES "Statut" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Priorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "niveau" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Statut" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Historique" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "dateAction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Historique_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Historique_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Priorite_niveau_key" ON "Priorite"("niveau");

-- CreateIndex
CREATE UNIQUE INDEX "Statut_type_key" ON "Statut"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_nom_key" ON "Utilisateur"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");
