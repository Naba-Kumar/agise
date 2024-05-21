const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());


require('dotenv').config();

const userAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  console.log("token")

  console.log(token)

  if (!token) {
    return res.status(401).send({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ error: 'Invalid token' });
  }
};

module.exports = userAuthMiddleware;





// userAuthMiddleware.js
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const authenticateToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).send('Unauthorized');

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).send('Invalid token');
//     req.user = user;
//     next();
//   });
// };

// module.exports = authenticateToken;



// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const authenticateToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).send('Unauthorized');

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).send('Invalid token');
//     req.user = user;
//     next();
//   });
// };

// module.exports = authenticateToken;
