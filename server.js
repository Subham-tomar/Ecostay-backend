const OpenAI = require("openai");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("./models/User");
const dns=require("dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

console.log(
  "OpenAI key loaded:",
  process.env.OPENAI_API_KEY ? "YES" : "NO"
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails[0].value
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "GOOGLE_OAUTH_USER"
          });
        }

        done(null, user);

      } catch (error) {
        done(error, null);
      }
    }
  )
);
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // maximum 5 attempts
  message: {
    message: "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: "Too many registration attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.get("/rate-test", registerLimiter, (req, res) => {
  res.json({
    message: "Rate limit test successful"
  });
});
app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
app.get(
  "/api/auth/google/callback",

  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login"
  }),

  (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user._id,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.redirect(
      `http://localhost:3000/oauth-success?token=${token}`
    );
  }
);

app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
  res.json({
    message: "This is the correct server.js"
  });
});

console.log("REGISTER ROUTE LOADED");
app.post(
  "/api/auth/register",

  registerLimiter,

  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
  ],

  async (req, res) => {
    console.log("VALIDATION REGISTER ROUTE HIT");

    try {
      // Check validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists"
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword
      });

      // Success response
      res.status(201).json({
        message: "User registered successfully",
        userId: user._id
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);
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
app.post(
  "/api/auth/login",

  loginLimiter,

  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ],

  async (req, res) => {
    console.log("VALIDATION LOGIN ROUTE HIT");

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Your existing login logic continues here

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

// ===============================
// AI STAY RECOMMENDATION ROUTE
// ===============================

app.post("/api/ai/recommend", async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || preferences.trim() === "") {
      return res.status(400).json({
        message: "Please provide your travel preferences"
      });
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI response
    const recommendation = `
Based on your preferences, an eco-friendly mountain retreat would be an excellent choice.

Why it matches:
• Peaceful natural surroundings
• Sustainable and environmentally responsible practices
• Clean and relaxing environment
• Ideal for nature lovers and peaceful travel

Sustainable features to look for:
• Solar energy usage
• Rainwater harvesting
• Waste reduction and recycling
• Locally sourced food and materials

EcoStay AI recommends choosing a nature-focused stay that combines comfort with responsible and sustainable tourism.
    `;

    res.status(200).json({
      recommendation
    });

  } catch (error) {
    console.error("AI API Error:", error);

    res.status(500).json({
      message: "Unable to generate AI recommendation. Please try again later."
    });
  }
});

app.get("/api/ai-test", (req, res) => {
  res.json({
    message: "AI route section is working"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});