const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

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

// db.select('*').from('users').then(data => {
//     console.log(data);
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            console.log(isValid);
            if(isValid) {
                return db.select('*').from('users')
                    .where('email', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json("Unable to get user"))
            } else{
                res.status(400).json('Wrong credentials')
            }
        })
        .catch(err => res.status(400).json("Wrong credentials"))
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('User already registered'))
})

app.get('/profile/:id' , (req, res) => {
    const { id } = req.params;

    db.select('*').from('users').where({id})
        .then(user => {
            if(user.length > 0){
                res.json(user[0])
            } else{
                res.status(400).json('Not found')
            }
    })
    .catch(err => res.status(400).json('Not found'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    db('users')
        .where('id', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries)
        })
        .catch(err => res.status(400).res.json('Unable to fetch the entries'))
})
app.get('/', (req, res) => {
    res.json('success')
})

// var hash = bcrypt.hashSync("bacon");

// bcrypt.compareSync("bacon", hash); // true
// bcrypt.compareSync("veggies", hash); // false

app.listen(3000);