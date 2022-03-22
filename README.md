# User Registration Demo
Note: This project is for educational purposes and should not be used in a production environment.<br>
An Express demo-app featuring encrypted user signup forms, user login forms & session variables (cookies). All stored in a .json format.
![Login preview](/assets/login.jpg)
---
## Goal
The goal of this project is to function as a reference for teaching, and learning, the fundamentals of:
- Cryptography (Two-way (en|de)cryption, incl. salt & pepper)
- Hashing algorithms (One-way encryption)
- GET/POST request handling
- Handling user data
- Managing databases / datasets
- Spotting edge cases
- Input sanitization
- Session files / Cookies
And of course:
- NodeJS
- Pug templating
---
## Todo
- Edge case: Add a redirect callback wherever `/login` is referenced
- Add "Edit Profile" functionality; display name, password, etc.
- Define "login" protected zones in a more intuitive manner.
- Sanitize inputs (no special characters in name etc.)
- Add a NoSQL/SQL version.
Ideally this project should be segmented and further explained in a wiki, step by step. Detailing the wrong ways & the less wrong ways.
<br>
Might get to that eventually, for now a classroom environment will do.
---
## Setup
- Clone repository
- `npm install`
- A 32-character `secretKey` is defined `crypto.js`, salt & pepper is defined in `app.js`
- The .json database file is defined by `userData` in `app.js` (Created on first sign-up)
- `node app.js`
- Visit `http://localhost:3000` in the browser.
