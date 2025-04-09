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

// Route pour ajouter une absence
app.post('/api/absences', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { studentId, subjectId, date } = req.body;

        // Ajouter l'absence
        await pool.execute(
            'INSERT INTO Absences (student_id, subject_id, date, validated_by) VALUES (?, ?, ?, ?)',
            [studentId, subjectId, date, req.user.id]
        );

        res.status(201).json({ message: 'Absence ajoutée avec succès' });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'absence:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les absences d'un étudiant
app.get('/api/absences/student', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const [absences] = await pool.execute(`
            SELECT a.*, s.name as subject_name, u.email as teacher_email
            FROM Absences a
            JOIN Subjects s ON a.subject_id = s.id
            JOIN Users u ON s.teacher_id = u.id
            WHERE a.student_id = ?
            ORDER BY a.date DESC
        `, [req.user.id]);

        res.json(absences);

    } catch (error) {
        console.error('Erreur lors de la récupération des absences:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir toutes les absences (admin seulement)
app.get('/api/absences', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const [absences] = await pool.execute(`
            SELECT 
                a.id,
                a.date,
                s.firstname as student_name,
                s.email as student_email,
                sub.name as subject,
                t.email as teacher_email
            FROM Absences a
            JOIN Users s ON a.student_id = s.id
            JOIN Subjects sub ON a.subject_id = sub.id
            JOIN Users t ON sub.teacher_id = t.id
            ORDER BY a.date DESC
        `);

        res.json(absences);

    } catch (error) {
        console.error('Erreur lors de la récupération des absences:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour supprimer une absence (admin seulement)
app.delete('/api/absences/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;

        // Vérifier si l'absence existe
        const [absence] = await pool.execute(
            'SELECT id FROM Absences WHERE id = ?',
            [id]
        );

        if (absence.length === 0) {
            return res.status(404).json({ message: 'Absence non trouvée' });
        }

        // Supprimer l'absence
        await pool.execute('DELETE FROM Absences WHERE id = ?', [id]);

        res.json({ message: 'Absence supprimée avec succès' });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'absence:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir la matière d'un professeur
app.get('/api/subjects/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { teacherId } = req.params;

    // Vérifier que le professeur demande sa propre matière
    if (parseInt(teacherId) !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const [subjects] = await pool.execute(
      'SELECT id, name FROM Subjects WHERE teacher_id = ?',
      [teacherId]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Aucune matière trouvée pour ce professeur' });
    }

    res.json(subjects[0]);

  } catch (error) {
    console.error('Erreur lors de la récupération de la matière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- Routes Messagerie ---

// GET /api/messages/:class - Récupérer les messages d'une classe
app.get('/api/messages/:class', authenticateToken, async (req, res) => {
  const requestedClass = req.params.class;
  const user = req.user; // Assurez-vous que req.user contient id, role, class, name

  // Récupérer le nom de l'utilisateur depuis la base de données pour être sûr
  let connection;
  try {
      connection = await pool.getConnection();
      const [senderInfo] = await connection.query('SELECT firstname, class, role FROM Users WHERE id = ?', [user.id]);
      if (senderInfo.length === 0) {
          connection.release();
          return res.status(404).send("Utilisateur non trouvé.");
      }
      const sender = senderInfo[0];
      user.name = sender.firstname; // Mettre à jour le nom
      user.class = sender.class; // Mettre à jour la classe
      user.role = sender.role; // Mettre à jour le role


      // Vérification pour les étudiants : ils ne peuvent voir que leur classe
      if (sender.role === 'student' && sender.class !== requestedClass) {
        console.log(`Student ${user.id} (${sender.firstname}) tried to access class ${requestedClass} but belongs to ${sender.class}`);
        connection.release();
        return res.status(403).send("Accès non autorisé à cette classe.");
      }

      // Vérification si la classe demandée est valide pour tous
      const allowedClasses = ['IATIC3', 'IATIC4', 'IATIC5'];
      if (!allowedClasses.includes(requestedClass)) {
          console.log(`Invalid class requested: ${requestedClass}`);
          connection.release();
          return res.status(400).send('Classe invalide.');
      }

      console.log(`Fetching messages for class: ${requestedClass} by user ${user.id} (${user.name})`);
      const [messages] = await connection.execute(
        // Attention: renommer les colonnes ici pour correspondre au type Message du frontend
        `SELECT m.id, m.content as message_content, m.created_at, u.firstname as sender_name, u.role as sender_role
         FROM Messages m
         JOIN Users u ON m.user_id = u.id
         WHERE m.class = ?
         ORDER BY m.created_at ASC`,
        [requestedClass]
      );
      connection.release();
      console.log(`Found ${messages.length} messages for class ${requestedClass}`);
      res.json(messages);
  } catch (error) {
      if (connection) connection.release();
      console.error("Erreur lors de la récupération des messages:", error);
      res.status(500).send('Erreur serveur lors de la récupération des messages.');
  }
});

// POST /api/messages - Envoyer un message
app.post('/api/messages', authenticateToken, async (req, res) => {
  // Renommer les variables pour correspondre à ce que le frontend envoie
  const { className, messageContent } = req.body;
  const user = req.user; // Assurez-vous que req.user contient l'ID

  if (!messageContent || messageContent.trim() === '') {
    return res.status(400).send('Le contenu du message ne peut pas être vide.');
  }

  let connection;
  try {
      connection = await pool.getConnection();
      // Récupérer les infos à jour de l'utilisateur (nom, classe, rôle)
      const [senderInfo] = await connection.query('SELECT firstname, class, role FROM Users WHERE id = ?', [user.id]);
      if (senderInfo.length === 0) {
           connection.release();
          return res.status(404).send("Utilisateur non trouvé.");
      }
      const sender = senderInfo[0];

      // Vérification pour les étudiants : ils ne peuvent envoyer que dans leur classe
      if (sender.role === 'student' && sender.class !== className) {
         console.log(`Student ${user.id} (${sender.firstname}) tried to send to class ${className} but belongs to ${sender.class}`);
         connection.release();
        return res.status(403).send("Envoi non autorisé dans cette classe.");
      }

      // Vérification si la classe est valide pour tous
      const allowedClasses = ['IATIC3', 'IATIC4', 'IATIC5'];
       if (!allowedClasses.includes(className)) {
           console.log(`Invalid class for sending: ${className}`);
           connection.release();
          return res.status(400).send('Classe invalide.');
      }

      console.log(`User ${user.id} (${sender.firstname}) sending message to class ${className}`);
      const [result] = await connection.execute(
        'INSERT INTO Messages (user_id, class, content) VALUES (?, ?, ?)',
        [user.id, className, messageContent.trim()]
      );

      // Récupérer le message complet avec les infos utilisateur pour le renvoyer
       const [newMessage] = await connection.execute(
        // Renommer les colonnes ici aussi
        `SELECT m.id, m.content as message_content, m.created_at, u.firstname as sender_name, u.role as sender_role
         FROM Messages m
         JOIN Users u ON m.user_id = u.id
         WHERE m.id = ?`,
        [result.insertId]
      );
      connection.release();

      console.log(`Message sent successfully. ID: ${result.insertId}`);
      // Renvoyer le message créé complet (le premier élément du tableau newMessage)
      res.status(201).json(newMessage[0]);

  } catch (error) {
      if (connection) connection.release();
      console.error("Erreur lors de l'envoi du message:", error);
      res.status(500).send("Erreur serveur lors de l'envoi du message.");
  }
});

// Route pour le tableau de bord des professeurs
app.get('/api/dashboard/teacher', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const teacherId = req.user.id;
    const teacherSubject = req.user.subject;

    // Récupérer les statistiques de la classe
    const [classStats] = await pool.query(`
      SELECT 
        AVG(n.value) as averageClass,
        MAX(student_avg.average) as bestAverage,
        MIN(student_avg.average) as lowestAverage,
        COUNT(DISTINCT s.id) as studentsCount,
        COUNT(n.id) as notesCount
      FROM Users s
      LEFT JOIN Notes n ON s.id = n.student_id
      LEFT JOIN (
        SELECT student_id, AVG(value) as average
        FROM Notes
        GROUP BY student_id
      ) student_avg ON s.id = student_avg.student_id
      WHERE n.teacher_id = ? AND s.role = 'student'
    `, [teacherId]);

    // Récupérer les moyennes par matière
    const [subjectAverages] = await pool.query(`
      SELECT 
        s.name as subject,
        AVG(n.value) as average,
        COUNT(DISTINCT n.student_id) as studentsCount
      FROM Notes n
      JOIN Subjects s ON s.teacher_id = ?
      WHERE n.teacher_id = ?
      GROUP BY s.name
    `, [teacherId, teacherId]);

    // Récupérer les étudiants en difficulté (moyenne < 10)
    const [studentsAtRisk] = await pool.query(`
      SELECT 
        u.id,
        u.firstname as name,
        u.email,
        AVG(n.value) as average,
        COUNT(n.id) as notes_count
      FROM Users u
      LEFT JOIN Notes n ON u.id = n.student_id
      WHERE n.teacher_id = ? AND u.role = 'student'
      GROUP BY u.id, u.firstname, u.email
      HAVING average < 10 OR average IS NULL
      ORDER BY average ASC
      LIMIT 5
    `, [teacherId]);

    // Récupérer l'évolution des moyennes dans le temps
    const [timelineData] = await pool.query(`
      SELECT 
        DATE(n.created_at) as date,
        AVG(n.value) as average
      FROM Notes n
      WHERE n.teacher_id = ?
      GROUP BY DATE(n.created_at)
      ORDER BY date ASC
      LIMIT 10
    `, [teacherId]);

    const notesTimeline = {
      dates: timelineData.map(row => new Date(row.date).toLocaleDateString('fr-FR')),
      values: timelineData.map(row => row.average)
    };

    res.json({
      classStats: {
        ...classStats[0],
        subjectAverages
      },
      studentsAtRisk,
      notesTimeline
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
