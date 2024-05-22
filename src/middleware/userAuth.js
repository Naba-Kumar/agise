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
