//Doit etre en debut de fichier pour charger les variables d'environnement
import "dotenv/config";

//importer les routes
import routerExterne from "./routes.js";

// Importation des fichiers et librairies
import express, { json } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cspOption from "./csp-options.js";
import { engine } from "express-handlebars";

//Importation de la session
import session from "express-session";

//Importation de la memorystore
import memorystore from "memorystore";

// Importation de passeport
import passport from "passport";

// importation de authentification.js
import "./authentification.js";

// Création du serveur express
const app = express();

//Permet d'initialiser la session
const MemoryStore = memorystore(session);

// Configuration de Handlebars
app.engine("handlebars", engine()); //Pour informer express que l'on utilise handlebars
app.set("view engine", "handlebars"); //Pour informer express que le moteur de rendu est handlebars
app.set("views", "./views"); //Pour informer express ou se trouvent les vues

// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());

//middleware pour la session
app.use(
  session({
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
  })
);

// Ajout de middleware pour passeport
app.use(passport.initialize());
app.use(passport.session());

//Middeleware integre a express pour gerer la partie static du serveur
//le dossier 'public' est la partie statique de notre serveur
app.use(express.static("public"));

// Ajout des routes
app.use(routerExterne);

// Renvoyer une erreur 404 pour les routes non définies
app.use((request, response) => {
  // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
  response.status(404).send(`${request.originalUrl} Route introuvable.`);
});

//Démarrage du serveur
app.listen(process.env.PORT);
console.info("Serveur démarré :");
console.info(`http://localhost:${process.env.PORT}`);
