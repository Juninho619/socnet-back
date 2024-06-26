const { ObjectId } = require("mongodb");
const { response } = require("express");
const { pool } = require("../connexions/db");

const client = require("../connexions/connexion");

const post = async (req, res) => {
  const userId = req.body.userId;
  try {
    const sql = `SELECT username FROM users WHERE user_id = ?`;
    const [rows] = await pool.query(sql, userId);
    const post = req.body.post;
    let result = await client
      .db("socnet")
      .collection("posts")
      .insertMany([
        {
          post_content: post,
          post_user_id: userId,
          post_username: rows[0],
        },
      ]);

    console.log(rows);
    res.status(200).json({ result, rows });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

const insertPostPic = async (req, res) => {
  const uploadDirectory = path.join(__dirname, "../uploads");
  console.log(uploadDirectory);
  let newFileName;
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
      newFileName = `${file.fieldname}-${Date.now()}.jpg`;
      cb(null, newFileName);
    },
  });
  const maxSize = 3 * 1000 * 1000;

  let upload = multer({
    storage: storage,

    limits: { fileSize: maxSize },

    fileFilter: function (req, file, cb) {
      var filetypes = /jpeg|jpg|png/;

      var mimetype = filetypes.test(file.mimetype);

      var extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimetype && extname) {
        return cb(null, true);
      }

      cb(
        "Error: File upload only supports the " +
          "following filetypes - " +
          filetypes
      );
    },
  }).single("image");

  upload(req, res, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send({ newFileName: newFileName });
    }
  });
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
  const id = new ObjectId(req.body.id);
  try {
    let comment = req.body.comment;
    let result = await client
      .db("socnet")
      .collection("posts")
      .updateOne({ _id: id }, { $push: { comment: comment } });
    res.status(200).json(comment);
  } catch (e) {
    res.status(500).json(e);
  }
};

const postLike = async (req, res) => {
  const id = new ObjectId(req.body.id);
  try {
    let result = await client
      .db("socnet")
      .collection("posts")
      .updateOne({ _id: id }, { $inc: { post_like: 1 } });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json(e);
  }
};

const postDislike = async (req, res) => {
  const id = new ObjectId(req.body.id);
  try {
    let result = await client
      .db("socnet")
      .collection("posts")
      .updateOne({ _id: id }, { $inc: { post_dislike: 1 } });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json(e);
  }
};

const followUser = async (req, res) => {
  const { followerId, followedId } = req.body;
  try {
    const [rows] = await pool.execute(
      `INSERT INTO follow(follower_id, followed_id) VALUES(${followerId}, ${followedId})`
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
};

const showAllPosts = async (req, res) => {
  try {
    let apiRequest = client.db("socnet").collection("posts").find();
    let posts = await apiRequest.toArray();
    if (posts && posts.length > 0) {
      response.status(200).json(posts);
    } else {
      response.status(204).json({ msg: "No content" });
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({ error });
  }
};

const displayPostbyFollowed = async (req, res) => {
  const followerId = req.params.followerId;

  try {
    const [rows] = await pool.query(
      `SELECT followed_id FROM follow WHERE follower_id=${followerId};`
    );

    const followedIds = rows.map((obj) => obj.followed_id);

    let cursor = client
      .db("socnet")
      .collection("posts")
      .find({ post_user_id: { $in: followedIds } });
    let result = await cursor.toArray();
    console.log(result);

    if (result.length > 0) res.status(200).json(result);

    if (result.length == 0)
      res.status(204).json({ msg: "User hasn't posted yet" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e });
  }
};

module.exports = {
  post,
  insertPostPic,
  updatePost,
  deletePost,
  postComment,
  postLike,
  postDislike,
  followUser,
  showAllPosts,
  displayPostbyFollowed,
};
