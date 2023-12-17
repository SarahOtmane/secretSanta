# API Secret Santa en Node.js

Bienvenue dans l'API pour l'application "Secret Santa" en Node.js. Cette API permet la gestion des utilisateurs, la création de groupes et l'assignation secrète des "Secret Santas" au sein de ces groupes.

## Objectif 

Créer une API robuste permettant aux utilisateurs de s'inscrire, de créer des groupes et de réaliser des assignations secrètes pour l'échange de cadeaux.


# Configuration

1. Clonez le projet depuis le référentie
```bash
    git clone https://github.com/SarahOtmane/secretSanta
```

2. Installez les dépendances.
```bash
    cd secretSanta/src
    npm init
    npm install les_dependances_qui_se_trouvent_en_bas
```

3. Créer un fichier .env à la racine du dossier src et configurez la variable d'environnement nécessaire
    JWT_KEY="votre_clé_secrète_qui_est_une_chaine_de_caractère"

4. Lancer MongoDb


# Structure du Projet

 - app.js: Point d'entrée de l'application.
 - docs/swagger-config.js: Configuration Swagger pour la documentation API.
 - middlewares/jwtMiddleware.js: Fonctions de middleware pour la gestion des JWT.
 - routes/: Dossiers contenant les définitions des routes.
 - models/: Dossiers contenant les modèles MongoDB.
 - controllers/: Dossier contenant les fonctions développées
 - fichier .env


# Dépendances à installer
 - Express: Framework web pour Node.js.
 - Mongoose: Bibliothèque MongoDB pour Node.js.
 - bcrypt: Cryptage des mots de passe.
 - jsonwebtoken: Génération et vérification de JWT.
 - dotenv : Charger des variables d'environnement à partir d'un fichier .env
 - swagger-jsdoc: Configuration Swagger pour la documentation API.
 - swagger-ui-express: Intégration Swagger UI pour la visualisation de la documentation.
  ## Dépendances dev :
 - nodemon: Permet de démarrer le serveur
 - jest : framework de testing de code


# Utilisation
 - Démarrez l'application avec la commande suivante :
 ```bash
    npm start
 ```
 - L'application sera accessible à l'adresse http://localhost:3000.
 - La documentation Swagger est disponible à l'adresse http://localhost:3000/api-docs.

