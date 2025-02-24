require('dotenv').config();  // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes/routes');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env file!");
    process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(`MongoDB Connection Error: ${err.message}`));

app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
