const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('./config/db.config');

const app = express();

app.use(cors());
app.use(express.json());

// Configuration de la base de données
const pool = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, 'votre_clef_secrete_jwt', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'Backend fonctionnel!' });
});

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, firstname, password, role, class: className, subject } = req.body;
        console.log('Données reçues:', { email, firstname, role, className, subject });

        // Vérifier les champs obligatoires
        if (!email || !firstname || !password || !role) {
            return res.status(400).json({
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Vérifier si l'email existe déjà
        const [existingUsers] = await pool.execute(
            'SELECT id FROM Users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer le nouvel utilisateur
        const [result] = await pool.execute(
            'INSERT INTO Users (email, firstname, password, role, class) VALUES (?, ?, ?, ?, ?)',
            [email, firstname, hashedPassword, role, role === 'student' ? className : null]
        );

        // Si c'est un professeur, ajouter sa matière
        if (role === 'teacher' && subject) {
            await pool.execute(
                'INSERT INTO Subjects (name, teacher_id) VALUES (?, ?)',
                [subject, result.insertId]
            );
        }

        res.status(201).json({
            message: 'Inscription réussie'
        });

    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de l\'inscription'
        });
    }
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'email et le mot de passe sont fournis
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email et mot de passe requis'
            });
        }

        // Rechercher l'utilisateur
        const [users] = await pool.execute(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Email ou mot de passe incorrect'
            });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Si c'est un professeur, récupérer sa matière
        let subject = null;
        if (user.role === 'teacher') {
            const [subjects] = await pool.execute(
                'SELECT name FROM Subjects WHERE teacher_id = ?',
                [user.id]
            );
            if (subjects.length > 0) {
                subject = subjects[0].name;
            }
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            'votre_clef_secrete_jwt',
            { expiresIn: '24h' }
        );

        // Ne pas renvoyer le mot de passe
        delete user.password;

        console.log('Connexion réussie pour:', {
            ...user,
            subject,
            token
        });

        // Renvoyer les informations de l'utilisateur
        res.json({
            user: {
                ...user,
                subject
            },
            token
        });

    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de la connexion'
        });
    }
});

// Route pour récupérer tous les utilisateurs (admin seulement)
app.get('/api/users', authenticateToken, async (req, res) => {
    console.log('Requête GET /api/users reçue');
    console.log('Utilisateur:', req.user);
    
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            console.log('Accès refusé - utilisateur non admin');
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Récupérer tous les utilisateurs avec leurs informations
        const [users] = await pool.execute(`
            SELECT id, email, firstname, role, class, created_at as createdAt,
                   (SELECT name FROM Subjects WHERE teacher_id = Users.id) as subject
            FROM Users
            ORDER BY created_at DESC
        `);

        console.log('Utilisateurs trouvés:', users.length);
        res.json(users);

    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de la récupération des utilisateurs'
        });
    }
});

// Route pour supprimer un utilisateur (admin seulement)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;

        // Vérifier si l'utilisateur existe et n'est pas admin
        const [users] = await pool.execute(
            'SELECT role FROM Users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (users[0].role === 'admin') {
            return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
        }

        // Supprimer d'abord les entrées dans la table Subjects si c'est un professeur
        await pool.execute('DELETE FROM Subjects WHERE teacher_id = ?', [id]);

        // Supprimer l'utilisateur
        await pool.execute('DELETE FROM Users WHERE id = ?', [id]);

        res.json({ message: 'Utilisateur supprimé avec succès' });

    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de la suppression de l\'utilisateur'
        });
    }
});

// Route pour changer le mot de passe
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Vérifier les champs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Tous les champs sont requis'
            });
        }

        // Récupérer l'utilisateur
        const [users] = await pool.execute(
            'SELECT password FROM Users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier l'ancien mot de passe
        const validPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Mot de passe actuel incorrect'
            });
        }

        // Hasher et enregistrer le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute(
            'UPDATE Users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            message: 'Mot de passe modifié avec succès'
        });

    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        res.status(500).json({
            message: 'Erreur serveur lors du changement de mot de passe'
        });
    }
});

// Route pour ajouter une note
app.post('/api/notes', authenticateToken, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est un professeur
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { studentId, value, class: className } = req.body;

        // Validation de la note
        if (value < 0 || value > 20) {
            return res.status(400).json({ message: 'La note doit être comprise entre 0 et 20' });
        }

        // Vérifier si l'étudiant existe et est dans la bonne classe
        const [student] = await pool.execute(
            'SELECT * FROM Users WHERE id = ? AND role = "student" AND class = ?',
            [studentId, className]
        );

        if (student.length === 0) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        // Ajouter la note
        await pool.execute(
            'INSERT INTO Notes (value, student_id, teacher_id, class) VALUES (?, ?, ?, ?)',
            [value, studentId, req.user.id, className]
        );

        res.status(201).json({ message: 'Note ajoutée avec succès' });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de la note:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour supprimer une note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;

        // Vérifier si la note existe et appartient au professeur
        const [note] = await pool.execute(
            'SELECT * FROM Notes WHERE id = ? AND teacher_id = ?',
            [id, req.user.id]
        );

        if (note.length === 0) {
            return res.status(404).json({ message: 'Note non trouvée' });
        }

        // Supprimer la note
        await pool.execute('DELETE FROM Notes WHERE id = ?', [id]);

        res.json({ message: 'Note supprimée avec succès' });

    } catch (error) {
        console.error('Erreur lors de la suppression de la note:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les étudiants d'une classe
app.get('/api/students/:class', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { class: className } = req.params;

        const [students] = await pool.execute(
            'SELECT id, email, firstname FROM Users WHERE role = "student" AND class = ?',
            [className]
        );

        res.json(students);

    } catch (error) {
        console.error('Erreur lors de la récupération des étudiants:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les notes d'un étudiant
app.get('/api/notes/student', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const [notes] = await pool.execute(`
            SELECT n.*, u.firstname as teacher_name, u.email as teacher_email,
                   (SELECT name FROM Subjects WHERE teacher_id = n.teacher_id) as subject
            FROM Notes n
            JOIN Users u ON n.teacher_id = u.id
            WHERE n.student_id = ?
            ORDER BY n.created_at DESC
        `, [req.user.id]);

        // Calculer les moyennes par matière
        const [averages] = await pool.execute(`
            SELECT 
                (SELECT name FROM Subjects WHERE teacher_id = n.teacher_id) as subject,
                AVG(n.value) as average
            FROM Notes n
            WHERE n.student_id = ?
            GROUP BY n.teacher_id
        `, [req.user.id]);

        res.json({ notes, averages });

    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les notes données par un professeur
app.get('/api/notes/teacher/:class', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { class: className } = req.params;

        const [notes] = await pool.execute(`
            SELECT n.*, u.firstname as student_name, u.email as student_email
            FROM Notes n
            JOIN Users u ON n.student_id = u.id
            WHERE n.teacher_id = ? AND n.class = ?
            ORDER BY u.firstname, n.created_at DESC
        `, [req.user.id, className]);

        // Calculer les moyennes par étudiant
        const [averages] = await pool.execute(`
            SELECT 
                u.firstname as student_name,
                AVG(n.value) as average
            FROM Notes n
            JOIN Users u ON n.student_id = u.id
            WHERE n.teacher_id = ? AND n.class = ?
            GROUP BY n.student_id
        `, [req.user.id, className]);

        res.json({ notes, averages });

    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
