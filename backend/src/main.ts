import express, { ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/user';
import cookieSession from 'cookie-session'; // needed for authentication 
import journalRoutes from './routes/entries';
import accountRoutes from './routes/account';

// this file is the entry point for the backend server

// read environment variables from .env file
dotenv.config();
const PORT = 8000;

// initialize express app 
const app = express(); 

const cors = require('cors');
app.use(cors());

app.use(express.json()) // add body-parser middleware to server using app.use (aka middleware keyword) and express.json() for the specific body-parser functionality 

// also add cookie session middleware 
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2'], // our secret keys to authenticate the session 
  maxAge: 24 * 60 * 60 * 1000 // sets how long the cookie will be valid in miliseconds. 24 hours. 
}));

// use router with path prefix 
app.use('/api/entries', journalRoutes);

// use router with path prefix 
app.use('/api/account', accountRoutes);

// define error handling middleware

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack); // provide stack trace for debugging 

  // Check the type of error or use the error message to set the HTTP status code
  const statusCode = err.message.startsWith('Unauthorized') ? 401 : 500;

  // Respond to the client with the error message
  res.status(statusCode).send({
      error: err.message || 'An unexpected error occurred.',
  });
}

app.use(errorHandler);
 
    const dbUsername = encodeURIComponent(process.env.DB_USERNAME!);
    const dbPassword = encodeURIComponent(process.env.DB_PASSWORD!);
    const dbClusterUrl = process.env.DB_CLUSTER_URL;
    const dbName = process.env.DB_NAME;
  
// connect to database
const startServer = async() => {
  try { 
    // connect to mongo DB using URI 
  await mongoose.connect(`mongodb+srv://${dbUsername}:${dbPassword}@${dbClusterUrl}/?retryWrites=true&w=majority&appName=${dbName}`);
  console.log("Connected"); 

  // listen only after you've established the database connection 
  app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Now listening on port ${PORT}.`);
});
  } catch (error) { 
    console.error("Failed to connect to MongoDB", error)
  }
}; 


startServer(); 