-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Historique" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "dateAction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Historique_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Historique_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Historique" ("action", "dateAction", "id", "taskId", "utilisateurId") SELECT "action", "dateAction", "id", "taskId", "utilisateurId" FROM "Historique";
DROP TABLE "Historique";
ALTER TABLE "new_Historique" RENAME TO "Historique";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
