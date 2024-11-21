const { register, login } = require('../controllers/AuthController');
const { createPost, getPosts, updatePost, deletePost, getPostById } = require('../controllers/PostsController');
const authenticate = require('../middleware/Auth'); 

function parseQuery(url) {
    const query = {};
    const queryString = url.split('?')[1];
    console.log("Raw query string:", queryString);
    if (queryString) {
        const pairs = queryString.split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            query[key] = decodeURIComponent(value || '');
        });
    }
    console.log("Parsed query object:", query); 
    return query;
}

const routes = {
    '/register': { POST: register },
    '/login': { POST: login },
    '/posts': {
        POST: [authenticate, (req, res) => createPost(req, res)], 
        GET: (req, res) => {
            req.query = parseQuery(req.url);
            console.log("Parsed query in routes.js:", req.query); 
            getPosts(req, res);
        }
    },
    '/posts/update': {
        PUT: [authenticate, (req, res) => updatePost(req, res)] 
    },
    '/posts/delete': {
        DELETE: [authenticate, (req, res) => deletePost(req, res)] 
    },
    '/posts/:postId': {
    GET: (req, res) => {
        const { postId } = req.params; // Use req.params to access dynamic value
        console.log("Fetching post by ID:", postId);
        getPostById(postId, res);
        }
    }
};

module.exports = routes;
