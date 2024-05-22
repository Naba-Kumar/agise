

const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());


require('dotenv').config();

const adminAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  console.log("token")

  console.log(token)

  if (!token) {
    // return res.status(401).send({ error: '' });
    const data = { message: 'Access denied', title: "Error", icon: "danger" };
        return res.status(401).json(data);
  }

  try {
    const decoded = jwt.verify(token, process.env.secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ error: 'Invalid token' });
  }
};

module.exports = adminAuthMiddleware;
