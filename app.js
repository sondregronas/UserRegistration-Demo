// Declare npm packages
const express = require('express')
const session = require('express-session')
const crypto  = require('crypto')
const path    = require('path')
const pug     = require('pug')
const fs      = require('fs')

// Use express web-app
const app = express();

// Link public folder to express
app.use("/public", express.static('public'));
// Set basedir for views
app.locals.basedir = path.join(__dirname, 'views');

// User variables
// userData = .JSON database file
// For real applications, use MySQL
const userData = './userdata.json'
const port = 3000;

// Extra functions
// sha512(val) hashes 'val' using sha512, a one way hashing function.
const sha512 = x => crypto.createHash('sha512').update(x, 'utf8').digest('hex');
// crypto_salt encrypts the session cookie
const crypto_salt = sha512('How vexingly quick daft zebras jump!')
// crypto_pepper gets appended to passwords
const crypto_pepper = sha512('The quick brown fox jumps over the lazy dog.')


// Session keeps track of logged in users.
app.use(session({
	secret: crypto_salt,
	resave: true,
	saveUninitialized: true
}));

// Use pugjs as view-engine, and parse request queries as JSON
app.set('view engine', 'pug')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Front page
app.get('/', (req, res) => {
  // Pass in session as 'session'
	res.render('index', {session: req.session});
});

app.get('/login', (req, res) => {
	// Display login page, as long as no session is active.
  if (!req.session.loggedin){
    res.render('login')
  } else {
    res.redirect('/')
  };
});

app.get('/logout', (req, res) => {
  // Destroy session to logout.
  req.session.destroy();
  res.redirect('/')
})

app.get('/profile', (req, res) => {
  // Display profile page, as long as session is active.
  if (req.session.loggedin){
    res.render('profile')
  } else {
    res.redirect('/')
  };
})

app.post('/profile', (req, res) => {
  let username = req.session.username
  let name = req.body.name
  let oldpassword = sha512(req.body.password+crypto_pepper)
  let newpassword = sha512(req.body.newpassword+crypto_pepper)
})

app.get('/signup', (req, res) => {
  // Display login page, as long as no session is active.
  if (!req.session.loggedin){
    res.render('signup')
  } else {
    res.redirect('/')
  }
})

// Handle /signup POST request.
app.post('/signup', (req, res) => {
  // Load the database, and check if it exists..
  var db = {}
  try {
    db = require(userData);
  } catch (e) {
    db = {}
  }

  // Assign the POST variables
	var data = {req: req.body}
  // username is converted to lowercase.
  let username = req.body.username.toLowerCase()
  let name     = req.body.name
  // Add pepper and hash with sha512
  let password = sha512(req.body.password+crypto_pepper)

  // Verify that all required fields are not null.
	if (username && name && password) {
    // Check if username is available
    if (!db[username]) {
      // Add new entry to database
      db[username] = {
                      "name": name,
                      "password": password
                     }

      // Write database
      fs.writeFileSync(userData, JSON.stringify(db))

      // Success! Redirect to /auth, with the same POST data
      // AKA. log the user in.
      res.redirect(307, '/login')
    } else {
      // If user already exists...
			data.error = "A user by that name already exists."
      res.render('signup', data)
    }
  } else {
		data.error = "Please fill out the entire form."
		res.render('signup', data)
  }
})

// Handle login /auth POST requests
app.post('/login', (req, res) => {
  // Load the database, and check if it exists...
  var db = {}
  try {
    db = require(userData);
  } catch (e) {
    db = {}
  }

  // Assign the POST variables
	var data = {req: req.body}
  // username is converted to lowercase.
	let username = req.body.username.toLowerCase()
  // Add pepper and hash with sha512, to match the database value.
	let password = sha512(req.body.password+crypto_pepper)

	// Verify that all required fields are not null.
	if (username && password) {
    // If username matches && password matches
    if (db[username] &&
        db[username]['password'] == password) {
          // Set session variables
          req.session.loggedin = true
          req.session.name = db[username]["name"]
  				req.session.username = username
          // Redirect to home
          res.redirect('/')
    }
    else {
      // Wrong credentials...
			data.error = "Wrong username or password!"
			res.render('login', data)
    }
	} else {
    // If some required fields are null...
		data.error = "Please enter a username and password."
		res.render('login', data)
  }
});

// Handle wildcard requests
// Points to *.pug in views, supports nested files too
// /coolpage links to /coolpage.pug
app.get('/*', (req, res) => {
	// Pass in session as 'session'
	res.render(req.url.substring(1), {session: req.session});
})

// Start the app
app.listen(port);
