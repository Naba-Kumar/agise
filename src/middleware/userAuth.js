// authMiddleware.js
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key'; // Store this securely

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
