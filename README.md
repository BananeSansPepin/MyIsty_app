- Récupérer la branche prototype sur le depot git 

- Vous devrez avant configurer la base de données :
    - Vous aurez donc besoin au préalable de phpMyAdmin. Normalement vous avez du créer un compte si vous l'avez bien configuré (sur Linux en tout cas)
    - Dans le dossier backend/config ouvrir le fichier db.config.js. Chnagez le nom d'utilisateur 
     et mettez votre nom d'utilisateur phpMyAdmin. Si vous avez mis un mot de passe remplacez le aussi
    - Créez ensuite la base de données avec la commande suivante (ou importez la directement depuis le fichier MyIsty.sql du dossier): 

DROP DATABASE IF EXISTS myIsty;
CREATE DATABASE myIsty;
USE myIsty;


-- Users table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    class ENUM('IATIC3', 'IATIC4', 'IATIC5'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE Subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES Users(id)
);

-- Notes table
CREATE TABLE Notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    value DECIMAL(4,2) NOT NULL,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    class VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Absences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    date DATETIME NOT NULL,
    validated BOOLEAN DEFAULT false,
    validated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Users(id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(id),
    FOREIGN KEY (validated_by) REFERENCES Users(id)
);

CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    class VARCHAR(10) NOT NULL, -- 'IATIC3', 'IATIC4', 'IATIC5'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);


    - Ensuite pour que la base se "mette en route", il faudra ajouter au moins un User. On va ajouter le compte admin
    - Sur phpmyadmin, dans la table myIsty.Users, allez dans inserer et créez l'admin en remplissant les champs avec les infos suivantes (id = 1,  adresse mail = admin@admin.fr, 
     firstname = admin, role = admin , pas de classe-ne rien mettre (NULL), ATTENTION le mot de passe devra être égal a : 
     $2b$10$GCDGSsH34m/PYM9AKrsfk.E4qDrVjN/Q9Fl1shrBF9P4YBxj8VM8y C'est la version hachée du mot "admin" 
     qui est donc le mot de passe de ce compte
    - Une fois que c'est fait la base devrait être configurée, on va configurer et lancer l'app

Pour avoir le rendu sur le telephone:
- partage de connexion depuis le phone:
-aller dans le fichier src/services/api.ts
- remplacer la ligne 4 const BASE_URL = 'http://localhost:3000/api';   par    const BASE_URL = 'http://votre_adresse_ip:3000/api';

pour retrouver votre adresse ip, executer la commande ip addr sur linux. 

Pour avoir le rendu sur le navigateur:
-aller dans le fichier src/services/api.ts
- assurez vous d'être sur localhost à la ligne 4 const BASE_URL = 'http://localhost:3000/api'


- Dans le dossier MyIsty_App, executer npm install et **npx expo install expo-linear-gradient**
- Dans le dossier backend ensuite, executer de nouveau npm install. Par précaution vous 
pouvez aussi faire en plus npm install express.
- Lancer ensuite le serveur avec la commande node server.js . Si cela fonctionne cela devrait renvoyer quelque chose du genre :
"Serveur démarré sur le port 3000"
- Ensuite ouvrir un nouveau terminal (s'assurer d'être dans le dossier MyIsty_App à nouveau, normalement oui directement quand on ouvre un autre terminal) pour executer npm start.
- Cela devrait vous générer le QR code comme d'habitude, 
- Pour lancer la version web taper ensuite w toujours dans le terminal ou vous avez généré le QR Code
- L'appli devevrait se lancer sans soucis depuis votre navigateur. L'EDT ne marche pas sur PC c'est normal mais vous devriez pouvoir vous connceter au compte admin et 
créer des comptes eleves, profs...
