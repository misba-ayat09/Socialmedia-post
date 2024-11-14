const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

async function createPost(title, content, tags, author, imageUrl) {
    const db = getDB();
  
    const post = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()), 
      author: ObjectId(author),
      imageUrl, 
      createdAt: new Date(),
    };
  
    const result = await db.collection('posts').insertOne(post);
    return result.insertedId;
  }
  
  async function getPosts(filter = {}, page = 1, limit = 10) {
    const db = getDB();
    const query = {};
  
    if (filter.author) query.author = ObjectId(filter.author);
    if (filter.tags) query.tags = { $in: filter.tags.split(',') };
  
    return await db.collection('posts')
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
  }
  
  async function getPostById(postId) {
    const db = getDB();
    return await db.collection('posts').findOne({ _id: ObjectId(postId) });
  }
  
  async function updatePost(postId, updatedFields) {
    const db = getDB();
  
    await db.collection('posts').updateOne(
      { _id: ObjectId(postId) },
      { $set: updatedFields }
    );
  }
  
  async function deletePost(postId) {
    const db = getDB();
    await db.collection('posts').deleteOne({ _id: ObjectId(postId) });
  }
  
  module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
  