const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const SECRET = 'DkvqBSPuy5hXpJwAW8rYm2tgT39VnbQ6';

async function register(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); 
  });

  req.on('end', async () => {
    try {
      const { username, email, password } = JSON.parse(body);
      const db = getDB();

      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Email already exists' }));
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = { username, email, password: hashedPassword };
      await db.collection('users').insertOne(user);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User registered successfully', user }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error processing request', error }));
    }
  });
}

async function login(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); 
  });

  req.on('end', async () => {
    try {
      const { email, password } = JSON.parse(body);
      const db = getDB();

      const user = await db.collection('users').findOne({ email });
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid credentials' }));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid credentials' }));
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, SECRET, { expiresIn: '1h' });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Login successful', 
        token, 
        userId: user._id, 
        username: user.username 
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error processing request', error }));
    }
  });
}

module.exports = { register, login };
