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
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url.split('?')[0];
  req.query = parseQuery(req.url);
  const method = req.method;

  console.log("Request URL:", url);
  console.log("Request Method:", method);
  console.log("Parsed Query:", req.query);

  // Dynamic route matching
  for (const route in routes) {
    const dynamicRouteMatch = route.match(/^\/posts\/:postId$/);
    if (dynamicRouteMatch && url.startsWith('/posts/')) {
      const postId = url.split('/posts/')[1];
      req.params = { postId };
      console.log("Dynamic route matched with postId:", postId);
      if (routes[route][method]) {
        return routes[route][method](req, res);
      }
    }
  }

  // Static route matching
  if (routes[url] && routes[url][method]) {
    const handlers = routes[url][method];
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
  server.listen(5000, () => console.log('Server running on port 5000')); 
}

startServer();
