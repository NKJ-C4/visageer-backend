const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { handleRegister } = require('./controllers/register');
const { handleSignIn } = require('./controllers/signin');
const { getUserProfile } = require('./controllers/profile');
const { addUserEntries, handleClarifaiApi } = require('./controllers/image');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'nishant',
      password : 'nkj14@gmail',
      database : 'visageer'
    }
  });

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {res.json('success')})

app.post('/signin', handleSignIn(db, bcrypt))

app.post('/register', handleRegister(db, bcrypt))

app.get('/profile/:id' , getUserProfile(db))

app.put('/image', addUserEntries(db))

app.post('/imageurl', (req, res) => handleClarifaiApi(req, res))

app.listen(3000);