const express = require("express");
const router = express.Router();
const Post = require("../models/post");

/**
 * GET/
 * Home
 */
router.get("/", async (req, res) => {
  try {
    const local = {
      title: "AmmarFayed Blog ",
    };
    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      local,
      data,
      currnet: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});
/**
 * GET/
 * Post :id
 */
router.get("/Post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });

    const local = {
      title: data.title,
    };

    res.render("Post", { local, data });
  } catch (error) {}
});
/**
 * POST/
 * Post SearchTrem
 */
router.post("/search", async (req, res) => {
  try {
    const local = {
      title: "Search",
    };
    let SearchTrem = req.body.searchTerm;
    const searchNoSpecialChar = SearchTrem.replace(/[^a-zA-Z0-9 ]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    res.render("search", { local, data });
  } catch (error) {}
});
/*
 * GET/
 * GET About Page
 */
router.get("/about", (req, res) => {
  const local = {
    title: "About",
  };
  res.render("about", { local });
});

module.exports = router;
