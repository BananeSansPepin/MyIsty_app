-- Suppression et création de la base de données
DROP DATABASE IF EXISTS myIsty;
CREATE DATABASE myIsty;
USE myIsty;

---------------------------------------------------------------
-- Création des tables avec la nouvelle structure
---------------------------------------------------------------

-- Table Users
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

-- Table Subjects
CREATE TABLE Subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES Users(id)
);

-- Table Notes
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

-- Table Grades
CREATE TABLE Grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    subject_id INT,
    grade FLOAT NOT NULL,
    comment TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Users(id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(id)
);

-- Table Absences
CREATE TABLE Absences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    subject_id INT,
    date DATE NOT NULL,
    validated BOOLEAN DEFAULT false,
    validated_by INT,
    FOREIGN KEY (student_id) REFERENCES Users(id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(id),
    FOREIGN KEY (validated_by) REFERENCES Users(id)
);

-- Table Messages
CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id)
);

---------------------------------------------------------------
-- Insertion des données dans les tables existantes
---------------------------------------------------------------

-- Insertion dans la table Users
-- Pour le champ username, on utilise ici la partie avant '@' ou le prénom si l'email ne contient pas de '@'
INSERT INTO Users (id, username, password, email, firstname, role, class, created_at) VALUES
(6, 'admin', ' $2b$10$GCDGSsH34m/PYM9AKrsfk.E4qDrVjN/Q9Fl1shrBF9P4YBxj8VM8y', 'admin@admin.fr', 'Admin', 'admin', NULL, '2025-04-07 05:07:36'),
(7, 'test', '$2b$10$P3Gs/abKaERn2d5DDdMy.eD3wbeHY39w5FI/7d8qLOPMzPD5mSIRW', 'test@test.fr', 'test', 'student', 'IATIC3', '2025-04-07 05:09:44'),
(8, 'prof', '$2b$10$/zdNK6hPeMADjK35XZMJTuos9D8MGpBLCUr2q8p9ECuqB4TtGcT9q', 'prof@prof.fr', 'prof', 'teacher', NULL, '2025-04-07 05:46:33'),
(10, 'test5', '$2b$10$shUWUOaC36rO5ccyLfQt4ub/N4BzEvx6K15L0KtrYPrr8Ef2qiAFm', 'test5@test5.fr', 'test5', 'student', 'IATIC5', '2025-04-07 13:53:46'),
(12, 'test33', '$2b$10$Bdq1QPIrifa7ktB5eA.84OSJh5cHXAMEBcoOHusZ4Wh3McN9qlmw6', 'test33', 'test33', 'student', 'IATIC3', '2025-04-07 15:44:58'),
(13, 'test44', '$2b$10$c2AUE2KpV.RJQ.i.oriamuqs2mz.qphevIdjVP6p9e6c1bRQ./29W', 'test44@test44.fr', 'test44', 'student', 'IATIC4', '2025-04-07 20:34:28'),
(14, 'anglais', '$2b$10$5foutwUEdQbow0SeBOWr3.U6ivO7cj8bI4iGLp.1BRc9wF3GhzeHe', 'anglais@anglais.fr', 'anglais', 'teacher', NULL, '2025-04-07 21:02:49'),
(15, 'test44b', '$2b$10$sI49UGdqDEFgR..BclNpC.7a7h/7kfe5YpLdVSDJ4riR1Ok2lMPye', 'test44@test.fr', 'test44', 'student', 'IATIC4', '2025-04-08 17:28:03');

-- Insertion dans la table Subjects
INSERT INTO Subjects (id, name, teacher_id) VALUES
(2, 'Algo', 8),
(4, 'Anglais', 14);

-- Insertion dans la table Notes
-- On déduit le champ "subject" via le teacher_id : 8 = 'Algo', 14 = 'Anglais'
INSERT INTO Notes (id, value, student_id, teacher_id, subject, class, created_at) VALUES
(2, 14.00, 10, 8, 'Algo', 'IATIC5', '2025-04-07 20:35:46'),
(3, 15.00, 10, 8, 'Algo', 'IATIC5', '2025-04-07 20:35:56'),
(5, 13.00, 7, 8, 'Algo', 'IATIC3', '2025-04-07 20:36:25'),
(6, 18.00, 7, 8, 'Algo', 'IATIC3', '2025-04-07 20:36:39'),
(7, 17.00, 12, 8, 'Algo', 'IATIC3', '2025-04-07 20:37:00'),
(8, 19.00, 12, 8, 'Algo', 'IATIC3', '2025-04-07 20:37:11'),
(9, 10.00, 7, 14, 'Anglais', 'IATIC3', '2025-04-07 21:03:26'),
(10, 14.00, 7, 14, 'Anglais', 'IATIC3', '2025-04-07 21:03:37'),
(11, 18.00, 7, 14, 'Anglais', 'IATIC3', '2025-04-07 21:03:47'),
(12, 16.00, 12, 14, 'Anglais', 'IATIC3', '2025-04-07 21:04:04'),
(13, 15.00, 12, 14, 'Anglais', 'IATIC3', '2025-04-07 21:04:12'),
(14, 14.00, 12, 14, 'Anglais', 'IATIC3', '2025-04-07 21:04:19');
