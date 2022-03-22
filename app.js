// Declare npm packages/modules
const express = require('express')
const session = require('express-session')
const path    = require('path')
const pug     = require('pug')
const fs      = require('fs')

// Add custom cryptography functions
const { sha512, encrypt, decrypt,  } = require('./crypto')
// sha512(val), returns a hashed string (One-way encryption/hashing: Passwords)
// encrypt(val) - returns an encrypted array, {iv, content}
// decrypt(encrypted array) - returns plaintext if key is correct
// (Two-way encryption: Sensitive data, e-mail, real name, messages. etc.)


////////////////////////
// Globals

// crypto_salt encrypts the session cookie
const crypto_salt = sha512('How vexingly quick daft zebras jump!')
// crypto_pepper gets appended to passwords, obfuscates even the worst passwords
const crypto_pepper = sha512('The quick brown fox jumps over the lazy dog.')

// userData links the .JSON "database" file, for real applications use an actual database
const userData = './userdata.json'
const port = 3000

// Express set-up
const app = express()
// Link public folder (images, resources) to express
app.use("/public", express.static('public'))

// Session (cookie) keeps track of logged in users.
app.use(session({
	secret: crypto_salt,
	resave: true,
	saveUninitialized: true
}))

// Use pugjs as view-engine
app.set('view engine', 'pug')
app.locals.basedir = path.join(__dirname, 'views') // Create an absolute /views path.
// Parse requests as JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


////////////////////////
// The actual app:

app.get('/login', (req, res) => {
	// Redirect home if user IS logged in.
	if (req.session.loggedin){ res.redirect('/') }
	// if not..

  res.render('login')
})

// Handle login POST requests
app.post('/login', (req, res) => {
  // Load the database, and check if it exists...
  var db = {}
  try 	{ db = require(userData) }
	catch { db = {} }

  // Assign the POST variables
	var data = {req: req.body}
  // username is converted to lowercase.
	let username = req.body.username.toLowerCase()
  // Add pepper and hash with sha512, to match the stored hash in the database.
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
})

// TODO:
app.get('/profile', (req, res) => {
	// Redirect home if user is NOT logged in.
	if (!req.session.loggedin) { res.redirect('/') }
	// if not..

	// Load the entire database, and filter out the user.
	let userdb = require(userData)[req.session.username]

  // Display profile page, as long as session is active.
	var data = {
		email: decrypt(userdb["email"])
	}

  res.render('profile', data)
})

// TODO:
app.post('/profile', (req, res) => {
  let username = req.session.username
  let name = req.body.name
  let oldpassword = sha512(req.body.password+crypto_pepper)
  let newpassword = sha512(req.body.newpassword+crypto_pepper)
})

// Display signup page
app.get('/signup', (req, res) => {
	// Redirect home if user IS logged in.
	if (req.session.loggedin){ res.redirect('/') }
	// if not..

  res.render('signup')
})

// Handle signup POST request.
app.post('/signup', (req, res) => {
	// Load the database, and check if it exists...
  var db = {}
  try 	{ db = require(userData) }
	catch { db = {} }

  // Assign the POST variables
	var data = {req: req.body}

  // username is converted to lowercase.
  let username = req.body.username.toLowerCase()
  let name     = req.body.name

	// Encrypted values
	let email		 = encrypt(req.body.email)

  // Password is peppered, then hashed with sha512
  let password = sha512(req.body.password+crypto_pepper)

  // Verify that all required fields are not null.
	if (username && name && email && password) {
    // Check if username is available
    if (!db[username]) {
      // Add new entry to database
      db[username] = {
                      "name": name,
											"email": email,
                      "password": password
                     }

      // Write database
      fs.writeFileSync(userData, JSON.stringify(db))

      // Success! Redirect to /login, with the same POST data (Code 307)
      // AKA. log the user in after user creation.
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

// Logout destroys the session cookie
app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

////////////////////////
// Handle every other request (.pug)

// Handle wildcard requests, attaches req.session
// Points to *.pug in views, supports directories too
app.get('/*', (req, res) => {
	// Get url and remove leading slashes (/)
	// Regex: ^\/+ - copy into regexr.com for a detailed explanation
	var url = req.url.replace(/^\/+/, '')

	// If url is empty, default to index.
	if (url == '') { url = 'index' }

	// Load page, pass in req.session as 'session'
	// If page-loading is unsuccessful render 404 instead
	res.render(url, {session: req.session}, (err, html) => {
		if (err) { res.render('404') }
		else { res.send(html) }
	})
})



////////////////////////
// Start the app
app.listen(port)
