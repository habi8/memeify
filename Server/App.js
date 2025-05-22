const express = require('express');

const app = express();
const PORT = 777;
app.listen((PORT, () => console.log(`Server running on port ${PORT}`)))