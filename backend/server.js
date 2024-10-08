const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "your_secret_key";

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pond",
});

db.connect((err) => {
  if (err) {
    console.log("Database connection error: " + err);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

// Add a blacklist (in-memory or a database, based on your requirement)
const tokenBlacklist = new Set();
router.post("/api/logout", (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(400).send({ message: "Token missing" });
  }

  // Add the token to the blacklist
  tokenBlacklist.add(token);
  res.send({ message: "Logged out successfully" });
});

// Middleware to check for blacklisted tokens (optional)
const checkTokenBlacklist = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (tokenBlacklist.has(token)) {
    return res.status(401).send({ message: "Token is blacklisted" });
  }
  next();
};

module.exports = { router, checkTokenBlacklist };

// Register new user
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  // Check if the user already exists
  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert new user into the database
      const insertQuery = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
      db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: "User registered successfully" });
      });
    }
  });
});

// Login user
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  // Check if the user exists
  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result[0];

    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

// Example of a protected route
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// CRUD operations
// Create a record
app.post("/api/create", (req, res) => {
  const { name, email } = req.body;
  const query = `INSERT INTO users (name, email) VALUES (?, ?)`;
  db.query(query, [name, email], (err, result) => {
    if (err) throw err;
    res.send({ message: "Record inserted", id: result.insertId });
  });
});

// Read records
app.get("/api/users", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Read record
app.get("/api/user/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Update a record
app.put("/api/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const query = `UPDATE users SET name = ?, email = ? WHERE id = ?`;
  db.query(query, [name, email, id], (err, result) => {
    if (err) throw err;
    res.send({ message: "Record updated" });
  });
});

// Delete a record
app.delete("/api/delete/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM users WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) throw err;
    res.send({ message: "Record deleted" });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
