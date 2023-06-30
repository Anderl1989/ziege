import { MongoClient } from 'mongodb';

export async function connectDB(mongoUrl, dbName) {
  const client = new MongoClient(mongoUrl);
  try {
  	await client.connect();
  	console.log('Connected successfully to database');
  } catch (err) {
  	console.log('Error connecting to database');
  	process.exit(0);
  }
  const db = client.db(dbName);

  return db;
}

export default connectDB;
