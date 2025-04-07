// importer le client prisma
import { PrismaClient } from "@prisma/client";

// importer bcrypt
import bcrypt from "bcrypt";

// Créer une instance du client prisma
const prisma = new PrismaClient();

//Pour recuperer un utilisateur par son email
export const getUserByEmail = async (email) => {
  const user = await prisma.utilisateur.findUnique({
    where: {
      email,
    },
  });
  return user;
};

//Pour ajouter un utilisateur
export const addUser = async (nom, email, password) => {
  const user = await prisma.utilisateur.create({
    data: {
      nom,
      email,
      password: await bcrypt.hash(password, 10),
      role: "USER",
    },
  });
  return user;
};
