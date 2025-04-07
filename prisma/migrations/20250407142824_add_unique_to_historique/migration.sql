/*
  Warnings:

  - A unique constraint covering the columns `[taskId,utilisateurId,action]` on the table `Historique` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Historique_taskId_utilisateurId_action_key" ON "Historique"("taskId", "utilisateurId", "action");
