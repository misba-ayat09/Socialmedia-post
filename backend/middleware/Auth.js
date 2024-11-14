const jwt = require('jsonwebtoken');

// Middleware for authentication
function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log(token); 

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, 'DkvqBSPuy5hXpJwAW8rYm2tgT39VnbQ6', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = authenticate;
