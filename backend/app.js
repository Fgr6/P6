const express = require('express');

const app = express();

const mongoose = require('mongoose');

const userRoutes = require('./routes/user')

var cors = require('cors')
app.use(cors())

mongoose.connect('mongodb+srv://Florentin:FloFoot73@clusterp6.blvyy4g.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use('/api/auth', userRoutes);


module.exports = app;