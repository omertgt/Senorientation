// routes/userRoutes.js

const express = require('express');
const User = require('../models/User');
const Client = require('../models/Client');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware pour protéger les routes et vérifier les rôles
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            res.status(401).send('Non autorisé, token invalide');
        }
    } else {
        res.status(401).send('Non autorisé, aucun token');
    }
};

// Middleware pour vérifier si l'utilisateur est admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Accès refusé, droits insuffisants');
    }
};

// Route pour obtenir les informations de l'utilisateur connecté
router.get('/users/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.send(user);
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des informations utilisateur');
    }
});

// CRUD Utilisateurs (Admin)

// CRUD Utilisateurs (Admin)

// Route pour créer un utilisateur (Inscription)
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).send('Utilisateur déjà enregistré');
        }

        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Route pour lire tous les utilisateurs (protégée par admin)
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route pour mettre à jour un utilisateur (protégée par admin)
router.put('/users/:id', protect, admin, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();

        res.send(user);
    } catch (error) {
        res.status(500).send('Erreur lors de la mise à jour de l\'utilisateur');
    }
});

// Route pour supprimer un utilisateur (protégée par admin)
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }

        await user.remove();
        res.send({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).send('Erreur lors de la suppression de l\'utilisateur');
    }
});


// Route pour la connexion de l'utilisateur
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Utilisateur non trouvé');
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).send('Mot de passe incorrect');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.send({ token });
    } catch (error) {
        res.status(500).send(error);
    }
});

// CRUD Clients (User)

// Route pour ajouter un client
router.post('/user/clients', protect, async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).send('Accès refusé');
    }

    try {
        const { name, email, phone, company, status, address, notes } = req.body;

        const client = new Client({ name, email, phone, company, status, address, notes });
        await client.save();

        res.status(201).send(client);
    } catch (error) {
        res.status(400).send('Erreur lors de la création du client');
    }
});

// Route pour récupérer les clients
router.get('/user/clients', protect, async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).send('Accès refusé');
    }

    try {
        const clients = await Client.find();
        res.send(clients);
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des clients');
    }
});

// Route pour mettre à jour un client
router.put('/user/clients/:id', protect, async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).send('Accès refusé');
    }

    try {
        const { name, email, phone, company, status, address, notes } = req.body;
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).send('Client non trouvé');
        }

        client.name = name || client.name;
        client.email = email || client.email;
        client.phone = phone || client.phone;
        client.company = company || client.company;
        client.status = status || client.status;
        client.address = address || client.address;
        client.notes = notes || client.notes;

        await client.save();

        res.send(client);
    } catch (error) {
        res.status(500).send('Erreur lors de la mise à jour du client');
    }
});

// Route pour supprimer un client
router.delete('/user/clients/:id', protect, async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).send('Accès refusé');
    }

    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).send('Client non trouvé');
        }

        await client.remove();
        res.send({ message: 'Client supprimé' });
    } catch (error) {
        res.status(500).send('Erreur lors de la suppression du client');
    }
});

// Route pour tableau de bord utilisateur
router.get('/user/dashboard', protect, async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).send('Accès refusé');
    }

    try {
        const totalClients = await Client.countDocuments();
        const newClients = await Client.countDocuments({ status: 'new' });
        const pendingClients = await Client.countDocuments({ status: 'pending' });
        const wonClients = await Client.countDocuments({ status: 'won' });
        const unreachableClients = await Client.countDocuments({ status: 'unreachable' });

        const stats = {
            totalClients,
            newClients,
            pendingClients,
            wonClients,
            unreachableClients,
        };
        res.send(stats);
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des statistiques');
    }
});

module.exports = router;
