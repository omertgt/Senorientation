// server.js

const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

connectDB();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Routes API
app.use('/api', userRoutes);

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
