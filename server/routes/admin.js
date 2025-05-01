const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

// check login

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET/
 * Admin login
 */
router.get("/admin", async (req, res) => {
  try {
    const local = {
      title: "Admin",
    };

    res.render("admin/index", { local, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// route for dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const local = {
      title: "Dashboard",
    };
    const data = await Post.find();

    res.render("admin/dashboard", { local, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
/** POST/
 * Admin check login
 */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "invalid credentials" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: "invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin Register
 */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hasPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hasPassword });
      res.status(201).json({ message: "user created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "user already in use" });
      }
      res.status(500).json({ message: "internal server errror" });
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 *ADMIN  ADD-POST
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const local = {
      title: "Add Post",
    };
    res.render("admin/add-post", { local, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
/**
 * POST/
 *ADMIN  ADD-POST
 */
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });
      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});
/**
 * GET/
 * ADMIN EDIT POST
 */
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const local = {
      title: "Edit Post",
    };
    const data = await Post.findOne({ _id: req.params.id });

    res.render(`admin/edit-post`, {
      local,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});
/**
 * PUT/
 * ADMIN edit post
 */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});
/**
 * DELETE/
 * ADMIN edit post
 */
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * ADMIN logout
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
module.exports = router;
