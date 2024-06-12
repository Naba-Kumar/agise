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
    // return res.redirect('/admin');
    const data = { message: 'Login First!!', title: "Oops?", icon: "warning"  };
            console.log(data)
            return res.status(500).json(data);
  }

  if (decodedToken.exp < currentTime) {
    const data = { message: 'Session Expired Login Again!', title: "Oops?", icon: "warning"  };
    console.log(data)
    return res.status(500).json(data);  }

  try {
    const decoded = jwt.verify(token, process.env.secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ error: 'Invalid token' });
  }
};

module.exports = userAuthMiddleware;
