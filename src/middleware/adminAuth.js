

const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config();

const adminAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Checking token presence...");

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }



  const decodedToken = parseJwt(token);
  const currentTime = Math.floor(Date.now() / 1000);


  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return res.redirect('/admin');
    const data = { message: 'Error publishing to GeoServer', title: "Oops?", icon: "danger" , redirect:"/admin" };
            console.log(data)
            return res.status(500).json(data);
  }

  if (decodedToken.exp < currentTime) {
    return res.redirect('/admin');
  }

  try {
    const decoded = jwt.verify(token, process.env.adminSecretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err)
    return res.redirect('/admin');
    // res.status(400).send({ error: 'Invalid token' });
  }
};

module.exports = adminAuthMiddleware;
