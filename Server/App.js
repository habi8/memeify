// server/App.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const homepageRoutes = require('./Routes/homepageRoutes');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '../Client')));
app.use(express.json());

app.use('/memeify', homepageRoutes);

const PORT = 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));