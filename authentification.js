import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import { getUserByEmail, getUserById } from "./model/user.js";

// Configuration de la stratégie d'authentification
const config = {
  usernameField: "email",
  passwordField: "password",
}; 


// Configuration de quoi faire avec l'identifiant
// et le mot de passe pour les valider
passport.use(
  new Strategy(config, async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);

      if (!user) {
        return done(null, false, { 
          message: "Email ou mot de passe incorrect",
          code: "INVALID_CREDENTIALS"
        });
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return done(null, false, { 
          message: "Email ou mot de passe incorrect",
          code: "INVALID_CREDENTIALS"
        });
      }

      // Ne pas renvoyer le mot de passe dans l'objet user
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  })
);

// Configuration de la sérialisation, cela permet de
// mettre l'information de l'utilisateur dans la session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Configuration de la désérialisation, cela permet de
// récupérer l'information de l'utilisateur à partir de la session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    if (!user) {
      return done(null, false);
    }
    // Ne pas renvoyer le mot de passe dans l'objet user
    const { password: _, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});
 