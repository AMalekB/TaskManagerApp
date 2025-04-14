-- DropIndex
DROP INDEX "Utilisateur_nom_key";

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN "prenom" TEXT;
ALTER TABLE "Utilisateur" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Utilisateur" ADD COLUMN "resetTokenExpiry" DATETIME;
