const { ObjectId } = require("mongodb");
const { response } = require("express");
const { pool } = require("../connexions/db");

const client = require("../connexions/connexion");

const post = async (req, res) => {
  const userId = req.body.userId;
  try {
    const post = req.body.post;
    let result = await client
      .db("socnet")
      .collection("posts")
      .insertMany([{ post_content: post, post_user_id: userId }]);
    console.log(post);
    console.log(userId);
    response.status(200).json(result);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

const updatePost = async (req, res) => {
  const { id } = req.body;
  try {
    let post = {
      post_content: req.body.post,
    };
    let result = await client
      .db("socnet")
      .collection("posts")
      .updateOne({ _id: id }, { $set: { post_content } });
    response.status(200).json(result);
  } catch (e) {
    res.status(500).json(e);
  }
};

const deletePost = async (req, res) => {
  let { id } = new ObjectId(req.body);
  console.log(id);
  try {
    let result = await client
      .db("socnet")
      .collection("posts")
      .deleteOne({ _id: id });
    if (result.deletedCount === 1)
      response.status(200).json({ msg: "DELETION!" });
    else response.status(404).json({ msg: "Could not be deleted" });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

const postComment = async (req, res) => {
  try {
    let comment = {
      post_comment: req.body.post_comment,
    };
    let result = await client
      .db("socnet")
      .collection("posts")
      .insertOne(comment);
  } catch (e) {
    res.status(500).json(e);
  }
};

const postLike = async (req, res) => {
  try {
    let result = await client
      .db("socnet")
      .collection("posts")
      .updateOne({ post_like: +1 });
  } catch (e) {
    res.status(500).json(e);
  }
};

const postDislike = async (req, res) => {
  try {
    let result = await client
      .db("socnet")
      .collection("posts")
      .updateOne({ post_dislike: -1 });
  } catch (e) {
    res.status(500).json(e);
  }
};

const displayPostbyFollowed = async (req, res) => {
  const followedId = req.params.followedId;
  try {
    let cursor = client
      .db("socnet")
      .collection("posts")
      .find({ post_user_id: followedId });
    let result = await cursor.toArray();
    console.log(result);
    if (result.length > 0) {
      res.status(200).json(result);
    } else res.status(204).json({ msg: "User hasn't posted yet" });
  } catch (error) {
    console.log(error);
    response.status(501).json(error);
  }
};

const followedUsers = async (req, res) => {
  const { followedId, followerId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM follow JOIN users AS u on follow.followed_id = u.user_id`
    );
    console.log(rows);
    res.status(200).json(rows);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

module.exports = {
  post,
  updatePost,
  deletePost,
  postComment,
  postLike,
  postDislike,
  displayPostbyFollowed,
  followedUsers,
};
