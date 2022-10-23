import { MongoClient } from 'mongodb';

// Connection URI
const uri = 'mongodb://localhost:27017';

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
  // Connect the client to the server (optional starting in v4.7)
  await client.connect();

  // Establish and verify connection
  await client.db('admin').command({ ping: 1 });
  console.log('Connected successfully to server');
}

run().catch(console.dir);

export const deleteAllTodos = async () => {
  return client.db('test').collection('Todos').deleteMany({})
}

export const readTodo = async () => {
  return client.db('test').collection('Todos').findOne()
}

export const closeConnection = async () => {
  await client.close();
}
