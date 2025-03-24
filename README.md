# MyISTY_app

je souhaite créer une application fonctionnelle dont voici le cahier des charges:

Cahier des Charges – Application Mobile MyIsty

Introduction
Ce document décrit les spécifications fonctionnelles et techniques de l'application mobile MyIsty destinée aux étudiants et professeurs de l'école d'ingénieurs ISTY. L’objectif est de centraliser et simplifier l’accès aux informations pédagogiques telles que l’emploi du temps, les notes, et le suivi des absences.

Objectifs du Projet
Pour les étudiants :

Accéder rapidement à leur emploi du temps via un bouton redirigeant vers le site edt.iut-velizy.uvsq.fr.
Consulter leurs notes et moyennes pour toutes les matières.
Visualiser leur nombre total d’absences grâce à un compteur mis à jour.
Pour les professeurs :

Accéder directement au site edt.iut-velizy.uvsq.fr via l’application.
Ajouter manuellement des notes pour chaque étudiant, avec une saisie de pourcentages pour le calcul automatique des moyennes.
Gérer les absences à l’aide d’un bouton dédié qui affiche la liste de la classe avec une case à cocher pour chaque étudiant.
Après validation, générer et envoyer automatiquement un PDF récapitulatif à l’adresse seedlessbananaa@gmail.com, tout en incrémentant le compteur d’absences pour chaque étudiant concerné.
3. Description Générale du Projet
L’application doit offrir deux sessions sécurisées (étudiants et professeurs) avec des interfaces adaptées à chaque type d’utilisateur. La sécurité, la performance et la simplicité d’utilisation sont des critères essentiels.

Public Cible Étudiants en informatique de l'école d’ingénieurs ISTY. Enseignants responsables de la gestion des notes et des absences.
Fonctionnalités 5.1. Authentification & Sécurité Deux sessions sécurisées : Étudiants : accès via identifiants fournis. Professeurs : accès via identifiants spécifiques. Test des comptes : Étudiants : et1 / mdpe1 et2 / mdpe2 Professeurs : prof1 / mdpp1 prof2 / mdpp2 5.2. Module Emploi du Temps Étudiants : Bouton d’accès redirigeant vers le site edt.iut-velizy.uvsq.fr. Professeurs : Accès direct au site edt.iut-velizy.uvsq.fr depuis l’application. 5.3. Gestion des Notes et Moyennes Étudiants : Consultation en temps réel de leurs notes et de leurs moyennes. Professeurs : Saisie manuelle des notes pour chaque étudiant. Définition du pourcentage attribué à chaque note pour un calcul automatique et dynamique des moyennes. 5.4. Gestion des Absences Étudiants : Visualisation d’un compteur indiquant le nombre total d’absences. Professeurs : Interface dédiée avec liste des étudiants et cases à cocher. Envoi d’un récapitulatif au format PDF par email (seedlessbananaa@gmail.com) à la validation de la liste. Incrémentation automatique du compteur d’absences pour chaque étudiant sélectionné.
Architecture Technique 6.1. Langages et Technologies Backend : Python, PHP ou un framework adapté pour la gestion des API et la logique serveur. Frontend : Développement mobile natif (Swift pour iOS, Kotlin pour Android) ou solution cross-platform (Flutter, React Native). Base de données : Système SQL (MySQL, PostgreSQL) pour stocker les informations des utilisateurs, notes, absences, etc. Services complémentaires : Module d’envoi d’emails avec génération de PDF. API ou Webview pour l’intégration du site edt. 6.2. Infrastructure Serveur sécurisé pour héberger l’API et la base de données. Mise en place de protocoles HTTPS et autres mesures de sécurité pour protéger les données.
Exigences Fonctionnelles Authentification sécurisée avec gestion des sessions pour étudiants et professeurs. Interface utilisateur intuitive avec design adapté aux différents rôles. Accès à l’emploi du temps via un bouton dédié menant au site externe. Consultation des notes et moyennes avec affichage clair et actualisation en temps réel. Saisie et gestion des absences avec génération et envoi automatique du PDF. Calcul automatique des moyennes basé sur des pourcentages définis par le professeur.
Exigences Non Fonctionnelles Sécurité : Mise en œuvre des standards de sécurité pour la protection des données sensibles. Performance : Temps de réponse rapide pour l’affichage des données et des mises à jour. Compatibilité : Fonctionnement sur les dernières versions des principaux systèmes d’exploitation mobiles. Scalabilité : Possibilité d’ajouter de nouvelles fonctionnalités sans refonte majeure de l’architecture.
Tests et Validation Scénarios de tests pour les étudiants : Connexion avec les identifiants de test. Accès et consultation de l’emploi du temps, des notes et du compteur d’absences. Scénarios de tests pour les professeurs : Connexion avec les identifiants de test. Accès à l’interface de saisie des notes et aux outils de gestion des absences. Vérification du calcul automatique des moyennes. Test de l’envoi du PDF récapitulatif par email.
Livrables et Planning Livrables attendus : Application mobile compilée pour iOS et Android (ou solution cross-platform). Documentation technique et guide utilisateur. Base de données et API opérationnelles. Code source commenté et versionné. Planning prévisionnel : Phase de conception et validation du cahier des charges. Développement du backend et frontend. Phase de tests et corrections. Déploiement et mise en production.
Conclusion Ce cahier des charges a pour objectif de fournir une vision claire et complète des fonctionnalités et des exigences techniques de l’application MyIsty. Il servira de guide pour une réalisation optimale par une IA de développement d’application, garantissant ainsi une solution robuste, sécurisée et adaptée aux besoins des étudiants et des professeurs de l’ISTY.
