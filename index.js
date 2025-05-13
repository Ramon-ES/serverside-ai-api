require('dotenv').config();
const express = require('express');
const cors = require('cors');
const processRoute = require('./routes/process');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/process', processRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
