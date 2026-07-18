const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const dns=require("dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
  res.json({
    message: "This is the correct server.js"
  });
});

console.log("REGISTER ROUTE LOADED");
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

console.log("Email received:", email);
console.log("Existing user found:", existingUser);

if (existingUser) {
  return res.status(400).json({
    message: "User already exists"
  });
}

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/test", (req, res) => {
  res.json({
    message: "This is the correct server.js"
  });
});

console.log("LOGIN ROUTE LOADED");
app.post("/api/auth/login-test", (req, res) => {
  res.json({
    message: "Login route is working"
  });
});


// LOGIN ROUTE — PASTE HERE
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token"
      });
    }

    req.user = user;
    next();
  });
};


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Your Stay routes continue below...
// Stay Schema
const staySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

// Stay Model
const Stay = mongoose.model("Stay", staySchema);

// GET all stays
app.get("/stays", async (req, res) => {
  try {
    const stays = await Stay.find();
    res.json(stays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single stay
app.get("/stays/:id", async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);

    if (!stay) {
      return res.status(404).json({
        message: "Stay not found"
      });
    }

    res.json(stay);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// POST new stay
app.post("/stays", async (req, res) => {
  try {
    const newStay = new Stay({
      name: req.body.name,
      location: req.body.location
    });

    const savedStay = await newStay.save();

    res.status(201).json(savedStay);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// PUT update stay
app.put("/stays/:id", async (req, res) => {
  try {
    const updatedStay = await Stay.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        location: req.body.location
      },
      { new: true }
    );

    if (!updatedStay) {
      return res.status(404).json({
        message: "Stay not found"
      });
    }

    res.json(updatedStay);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// DELETE stay
app.delete("/stays/:id", async (req, res) => {
  try {
    const deletedStay = await Stay.findByIdAndDelete(req.params.id);

    if (!deletedStay) {
      return res.status(404).json({
        message: "Stay not found"
      });
    }

    res.json({
      message: "Stay deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// SEARCH stays

app.get("/search", async (req, res) => {
  try {
    const keyword = req.query.name;

    const result = await Stay.find({
      name: { $regex: keyword, $options: "i" }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
console.log("REGISTER ROUTE LOADED");

const PORT = 5000;

app.all("/api/auth/login", (req, res) => {
  res.json({
    method: req.method,
    message: "Request reached login route"
  });
});


// Protected Route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You have access to the protected route",
    user: req.user
  });
});console.log("PROTECTED ROUTE LOADED");
app.get("/api/hello", (req, res) => {
  res.json({
    message: "HELLO ROUTE WORKING"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});