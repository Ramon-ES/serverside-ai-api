require('dotenv').config();
const express = require('express');
const cors = require('cors');
const processRoute = require('./routes/process');
const streamRoute = require('./routes/stream-audio');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/', processRoute);
app.use('/stream-audio', streamRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
