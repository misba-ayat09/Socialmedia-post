const http = require('http');
const jwt = require('jsonwebtoken');
const routes = require('./routes/routes');
const { connectDB } = require('./db');


const SECRET = 'DkvqBSPuy5hXpJwAW8rYm2tgT39VnbQ6';


function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Unauthorized' }));
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Forbidden' }));
    }
    req.user = user; 
    next(); 
  });
}

function parseQuery(url) {
  const query = {};
  const queryString = url.split('?')[1];
  if (queryString) {
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      query[key] = decodeURIComponent(value || '');
    });
  }
  return query;
}

function handleRequest(req, res) {
  const url = req.url.split('?')[0]; 
  req.query = parseQuery(req.url); 
  const method = req.method;
  const route = routes[url]; 
  
  console.log("Request URL:", url); 
  console.log("Request Method:", method); 
  console.log("Parsed Query:", req.query); 

  if (route && route[method]) {
    const handlers = route[method]; 
    if (Array.isArray(handlers)) {
      return handleMiddlewares(req, res, handlers, 0); 
    } else {
      return handlers(req, res);
    }
  }
  
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not Found' }));
}


function handleMiddlewares(req, res, handlers, index) {
  if (index < handlers.length) {
    const handler = handlers[index];
    if (handler.length === 3) {
      return handler(req, res, () => handleMiddlewares(req, res, handlers, index + 1));
    } else {
      return handler(req, res);
    }
  }
}

// Start the server
async function startServer() {
  await connectDB(); 
  const server = http.createServer(handleRequest); 
  server.listen(3000, () => console.log('Server running on port 3000')); 
}

startServer();
