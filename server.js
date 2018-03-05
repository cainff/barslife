const express = require('express');
const app = express();

// DEPENDENCIES LOADING
const config = require('./dependencies/config');
const mw = require('./dependencies/middlewares');


const bodyParser = require('body-parser');
// const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');

const bar = express.Router();
const auth = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(
  `mongodb://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`,
  { useMongoClient: true }
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'ERROR: CANNOT CONNECT TO BARS-DB'));
db.once('open', () => {
  console.log('SUCCESS: CONNECTED TO BARS-DB WITH');
});
const User = require('./models/user');
const Bar = require('./models/bar');

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-type, Authorization');
  next();
});

auth.post(
  '/signup', 
  mw.checkBodyRequest('email'),
  mw.checkBodyRequest('nickname'),
  mw.checkBodyRequest('password'),
  mw.checkExistingUserEmail,
  mw.checkExistingUserNickname,
  (req, res) => {
    const email = req.body.email;
    const nickname = req.body.nickname;
    const password = req.body.password;
    let role;
    if (nickname === config.db.user.toLocaleUpperCase()) {
      role = 'admin';
    } else {
      role = 'member';
    }
    const newUser = new User({ email, nickname, password, role });
    newUser.save((err, savedUser) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'L’utilisateur n’a pas été enregistré en raison d’une erreur du serveur.'
        });
      } else {
        res.status(201).json({
          success: true,
          message: 'Utilisateur enregistré avec succès !'
        });
      }
    });
  }
);



auth.post(
  '/signin',
  mw.checkBodyRequest('email'),
  mw.checkBodyRequest('password'),
  mw.findUser,
  (req, res) => {
    const iss = `${config.server.host}:${config.server.port}/`;
    const role = req.body.role;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const payload = { iss, role, nickname, email };
    const token = jwt.sign(payload, config.jwtSecret);
    res.status(201).json({
      success: true,
      message: `Bienvenue, ${req.body.nickname}.`,
      token
    });    
  }
);

auth.get(
  '/users',
  mw.getUserRoleInToken,
  mw.checkUserRole('admin'),
  (req, res) => {
    User.find((err, users) => {
      if (err) {
        console.log('ÉCHEC DU GET/USERS', err);
        return res.status(500).json({
          success: false,
          message: 'L’utilisateur n’a pas été enregistré en raison d’une erreur du serveur.'
        });
      } else {
        res.json(users);
      }
    }
  ).select('_id nickname email role');
});

bar.get('/', (req, res) => {
  console.log(req.body);
  Bar.find((err, bars) => {
    if (err) {
      console.log('ERREUR DANS GET/BARS', err);
      return res.status(500).json({
        sucess: false,
        message: "la liste des bars n'est pas dispo en raison d'une erreur interne du server"
      });
    } else {
      res.status(201).json({
        sucess: true,
        message: "" ,
        bars 
  });
}
});
});



bar.post(
  '/',
  
  mw.getUserRoleInToken,
  mw.checkUserRoleFromArray(['admin','member']),
  mw.checkBodyRequest('name'),
  mw.checkBodyRequest('address'),
  mw.checkBodyRequest('description'),
  mw.checkBodyRequest('lat'),
  mw.checkBodyRequest('lng'),
  
  
  
  (req, res) => {
    const bar = req.body;
    console.log('bar du body:', bar);
  
    

    const name = req.body.name;
    const description = req.body.description;
    const address = req.body.address;
    const lat = req.body.lat;
    const lng = req.body.lng;

    
    
    const newBar = new Bar({ name, description, address, lat, lng });
    newBar.save((err, savedBar) => {
      if (err) {
        console.log('ERREUR POST/BARS:', err);
        return res.status(500).json({
          success: false,
          message: 'Le bar n\'a pas été ajouté en raison d\'une erreur du serveur',
        })
      } else {
        res.status(201).json({
          success: true,
          message: 'Bar enregistré avec succès !',
          bar: savedBar
        })
      }
      
    }); 
}); 

/*bar.post('/',
  mw.decodeToken,
  mw.checkUserRole(['owner', 'admin','member']),
  mw.checkBodyRequest('name'),
  mw.checkBodyRequest('address'),
  mw.checkBodyRequest('location'),
  mw.checkBodyRequest('description'),
  (req,res) => {
    const bar = req.body;
    console.log('bar du body:', bar);

    const name = req.body.name;
    const description = req.body.description;
    const address = req.body.address;
    const lat = req.body.lat;
    const lng = req.body.lng;
    const newBar = new Bar({ name, description, address, lat, lng });
    newBar.save((err, savedBar) => {
      if (err) {
        console.log('ERREUR POST/BARS:', err);
        return;
      } else {
        console.log('BAR SAUVEGARDE', savedBar);
        res.sendStatus(201);
      }
    });

  } 
) */


app.use('/bar', bar);
app.use('/auth', auth);

app.listen(config.server.port, () => {
  console.log(`THE SERVER LISTEN ON PORT ${config.server.port}`);
});