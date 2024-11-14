const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://sahayamisba:Faith@faithcluster.ei6sb.mongodb.net/postMmangement?retryWrites=true&w=majority&appName=Faithcluster';
let db;

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db('postMmangement'); 
  console.log('Connected to MongoDB Atlas');
}

function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

module.exports = { connectDB, getDB };
