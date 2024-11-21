const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Token:', token);

    if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        return;
    }

    jwt.verify(token, 'DkvqBSPuy5hXpJwAW8rYm2tgT39VnbQ6', (err, decoded) => {
        if (err) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Forbidden' }));
            return;
        }
        req.user = decoded;
        next();
    });
}

module.exports = authenticate;
