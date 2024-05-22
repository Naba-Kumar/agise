

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

  if (!token || token === undefined) {
    // return res.status(401).send({ error: '' });
    const data = { message: 'Access denied 7', title: "Error", icon: "danger" };
        // return res.status(401).json(data);
        console.log("loggin mid")
        return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.adminSecretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ error: 'Invalid token' });
  }
};

module.exports = adminAuthMiddleware;
