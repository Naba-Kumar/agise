const express = require('express');
const hbs = require('hbs')
const path = require('path')
const bodyParser = require('body-parser');
require('./src/db/schema')
const app = express();
const session = require("express-session")
const flash = require("express-flash")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// const pool = require('./src/db/connection')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




const viewpath = path.join(__dirname, "templates/views")
const partialpath = path.join(__dirname, "templates/partials")
console.log(viewpath)


// console.log(pool.pool1)


// app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));

const jwtMiddleware = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.adminSecretKey, (err, decoded) => {
            if (err) {
                return res.status(401).send('Unauthorized');
            }
            req.user = decoded;
            next();
        });
    } else {
        next();
    }
};

app.use(jwtMiddleware);


app.set("view engine", "hbs")
app.set("views", viewpath);
hbs.registerPartials(partialpath);


hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
      case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
          return options.inverse(this);
  }
});



app.use('/', require('./src/routes/index'));

// Start the Express application
app.listen(3000, () => {
  console.log(`127.0.0.1:3000 listening on port 3000`);
});