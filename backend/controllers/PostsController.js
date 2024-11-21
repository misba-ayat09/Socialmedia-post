const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

async function createPost(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });

    req.on('end', async () => {
        const { title, content, tags, imageUrl } = JSON.parse(body); 
        const author = req.user ? req.user.userId : null; 
        
        if (!author) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized' }));
            return;
        }

        const db = getDB();
        const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        const post = {
            title,
            content,
            tags: tagArray,
            author: new ObjectId(author), 
            imageUrl,
            createdAt: new Date(),
        };

        try {
            const result = await db.collection('posts').insertOne(post);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({insertedId: result.insertedId, post}));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal server error' }));
        }
    });
}

async function getPosts(req, res) {
    console.log("Inside getPosts function");
    console.log("Query parameters received:", req.query);

    const db = getDB();
    const { author, tags, page = 1, limit = 10 } = req.query;

    const matchQuery = {};

    if (author) {
        try {
            const authorDoc = await db.collection('users').findOne({ username: author.trim() });
            if (!authorDoc) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Author not found' }));
                return;
            }
            matchQuery.author = new ObjectId(authorDoc._id);
        } catch (err) {
            console.error("Error finding author by name:", err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal server error while searching for author' }));
            return;
        }
    }

    if (tags) {
        matchQuery.tags = { $in: tags.split(',').map(tag => tag.trim()) };
    }

    try {
        const posts = await db.collection('posts')
            .find(matchQuery)
            .skip((page - 1) * parseInt(limit, 10))
            .limit(parseInt(limit, 10))
            .toArray();

        if (posts.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'No posts found' }));
            return;
        }

        // Fetch author details for each post
        const enrichedPosts = await Promise.all(
            posts.map(async (post) => {
                const authorDoc = await db.collection('users').findOne({ _id: post.author });
                return {
                    ...post,
                    authorUsername: authorDoc ? authorDoc.username : 'Unknown Author',
                };
            })
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(enrichedPosts));
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
}

async function getPostById(postId, res) {
    console.log("Inside getPostById, postId:", postId); // Log the postId received

    const db = getDB();

    // Validate ObjectId
    if (!ObjectId.isValid(postId)) {
        console.log("Invalid ObjectId:", postId); // Log invalid ObjectId
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid post ID format' }));
        return;
    }

    try {
        console.log("Querying database for post with ID:", postId); // Log the query
        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });

        if (!post) {
            console.log("Post not found for ID:", postId); // Log if no document is found
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Post not found' }));
            return;
        }

        console.log("Post found:", post); // Log the fetched post
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(post));
    } catch (error) {
        console.error("Error fetching post:", error); // Log the error
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
}

async function updatePost(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });

    req.on('end', async () => {
        try {
            const { postId, title, content, tags, imageUrl } = JSON.parse(body); 

            if (!postId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Post ID is required' }));
                return;
            }

            const db = getDB();
            
            const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

            const updatedPost = {
                title,
                content,
                tags: tagArray,
                imageUrl,
                updatedAt: new Date(),
            };

            console.log('Updated post data:', updatedPost);

            const result = await db.collection('posts').updateOne(
                { _id: new ObjectId(postId) },
                { $set: updatedPost }
            );

            console.log('Update result:', result); 

            if (result.modifiedCount === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Post not found or no change' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({message: 'Post upadted scuccesfully',updatedPost}));
            }
        } catch (error) {
            console.error('Error updating post:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal server error' }));
        }
    });
}

async function deletePost(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });

    req.on('end', async () => {
        const { postId } = JSON.parse(body);

        if (!postId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Post ID is required' }));
            return;
        }

        const db = getDB();

        try {
            const result = await db.collection('posts').deleteOne({ _id: new ObjectId(postId) });

            if (result.deletedCount === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Post not found' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Post deleted successfully' }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal server error' }));
        }
    });
}


module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
