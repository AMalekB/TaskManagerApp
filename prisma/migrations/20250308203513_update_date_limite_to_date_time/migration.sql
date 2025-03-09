/*
  Warnings:

  - You are about to alter the column `dateLimite` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prioriteId" INTEGER NOT NULL,
    "statutId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "dateLimite" DATETIME NOT NULL,
    CONSTRAINT "Task_prioriteId_fkey" FOREIGN KEY ("prioriteId") REFERENCES "Priorite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_statutId_fkey" FOREIGN KEY ("statutId") REFERENCES "Statut" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("dateLimite", "description", "id", "prioriteId", "statutId", "titre", "utilisateurId") SELECT "dateLimite", "description", "id", "prioriteId", "statutId", "titre", "utilisateurId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
