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
      `SELECT user_id FROM follow JOIN users AS u on follow.follower_id = u.user_id`
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
  insertPostPic,
  updatePost,
  deletePost,
  postComment,
  postLike,
  postDislike,
  displayPostbyFollowed,
  followedUsers,
};
