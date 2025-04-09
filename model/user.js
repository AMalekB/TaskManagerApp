// importer le client prisma
import { PrismaClient } from "@prisma/client";

// importer bcrypt
import bcrypt from "bcrypt";

// Créer une instance du client prisma
const prisma = new PrismaClient();

//Pour recuperer un utilisateur par son email
export const getUserByEmail = async (email) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur par email:", error);
    throw error;
  }
};

//Pour recuperer un utilisateur par son ID
export const getUserById = async (id) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    return user;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur par ID:", error);
    throw error;
  }
};

//Pour ajouter un utilisateur
export const addUser = async ({ nom, prenom, email, password }) => {
  try {
    // Vérifier si l'email existe déjà
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error("Email déjà utilisé");
    }

    // Créer l'utilisateur
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        password: await bcrypt.hash(password, 10),
        role: "USER", // Valeur par défaut
      },
    });

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur:", error);
    if (error.code === "P2002") {
      throw new Error("Email déjà utilisé");
    }
    throw error;
  }
};
