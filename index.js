const express = require('express');
const app = express();

const port = 3000;
const sqlite3 = require('sqlite3').verbose();

// Establishing global database connection
global.db = new sqlite3.Database('./database.db', function (err) {
  if (err) {
    console.error(err);
    process.exit(1); //Exiting if database connection fails
  } else {
    console.log('Successfully connected to the database');
    global.db.run('PRAGMA foreign_keys=ON'); //Enforcing foreign key constraints
  }
});

// Creating a new user session for managing reactions
global.userSession = require('crypto').randomUUID();

// Retrieving app settings and storing in a global variable
global.db.all('SELECT * FROM Settings', function (err, rows) {
  if (err) {
    next(err);
  } else {
    global.settings = rows.reduce((prev, curr) => ({ ...prev, [curr.id]: curr.value }), {});
  }
});

// Configuring the app to utilize body-parser for request body handling
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Configuring the app to use ejs for view rendering
app.set('view engine', 'ejs');

// Serving static files from the "public" directory
app.use('/', express.static('public'));


// Attaching the author routes to the app with '/author' path
const authorRoutes = require('./routes/authoruser');
app.use('/author', authorRoutes);

// Attaching the reader routes to the app with '/' path
const readerRoutes = require('./routes/readeruser');
app.use('/', readerRoutes);

// Starting the server and listening on the specified port
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`)
});
