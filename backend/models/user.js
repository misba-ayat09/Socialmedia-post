const bcrypt = require('bcrypt');
const { getDB } = require('../db');

async function createUser(username, email, password) {
  const db = getDB();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    username,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };

  const result = await db.collection('users').insertOne(user);
  return result.insertedId;
}

async function findUserByEmail(email) {
  const db = getDB();
  return await db.collection('users').findOne({ email });
}

async function findUserById(userId) {
  const db = getDB();
  return await db.collection('users').findOne({ _id: userId });
}

module.exports = { createUser, findUserByEmail, findUserById };
