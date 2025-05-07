const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db');

function servePage(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Page Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index') {
    servePage(res, path.join(__dirname, 'pages', 'index.html'));

  } else if (req.url === '/login') {
    servePage(res, path.join(__dirname, 'pages', 'login.html'));

  } else if (req.url === '/register') {
    servePage(res, path.join(__dirname, 'pages', 'register.html'));

  } else if (req.url === '/home') {
    servePage(res, path.join(__dirname, 'pages', 'home.html'));

  } else if (req.url === '/logout') {
    servePage(res, path.join(__dirname, 'pages', 'logout.html'));

  } 
  // Handle Register with duplicate check
  else if (req.url === '/submit-register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const username = params.get('username');
      const password = params.get('password');

      const checkQuery = 'SELECT * FROM users WHERE username = ?';
      db.query(checkQuery, [username], (err, results) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Database error');
        } else if (results.length > 0) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <script>
              alert("Username already exists!");
              window.location.href = "/register";
            </script>
          `);
        } else {
          const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
          db.query(insertQuery, [username, password], (err) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Error inserting user');
            } else {
              res.writeHead(302, { 'Location': '/login' });
              res.end();
            }
          });
        }
      });
    });
  } 
  // Handle Login
  else if (req.url === '/submit-login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const username = params.get('username');
      const password = params.get('password');

      const checkQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
      db.query(checkQuery, [username, password], (err, results) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Database error');
        } else if (results.length > 0) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <script>
              sessionStorage.setItem("username", "${username}");
              alert("Login Successful!");
              window.location.href = "/home";
            </script>
          `);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <script>
              alert("Invalid Credentials!");
              window.location.href = "/login";
            </script>
          `);
        }
      });
    });
  } 
  // Else 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Page Not Found');
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});


