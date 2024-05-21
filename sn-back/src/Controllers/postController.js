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
      .updateOne({ _id: id }, { $set: { post_comment: comment } });
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

const displayPostbyFollowed = async (req, res) => {
  const followerId = req.params.followerId;

  if (!followerId) res.status(400).json({ error: "missing parameter" });

  try {
    const [rows] = await pool.query(
      `SELECT followed_id FROM follow WHERE follower_id=${followerId};`
    );

    let cursor = client
      .db("socnet")
      .collection("posts")
      .find({ post_user_id: { $in: rows } });
    let result = await cursor.toArray();
    console.log(result);
    console.log(rows);

    if (result.length > 0) res.status(200).json(result);

    if (result.length == 0)
      res.status(204).json({ msg: "User hasn't posted yet" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Internal server Error" });
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
  displayPostbyFollowed,
};
