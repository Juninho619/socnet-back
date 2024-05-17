const express = require("express");
const {
  post,
  updatePost,
  deletePost,
  postComment,
  postLike,
  postDislike,
  displayPostbyFollowed,
} = require("../postController");
const router = express.Router();

router.post("/newpost", post);
router.put("/updatepost", updatePost);
router.delete("/deletepost", deletePost);
router.post("/comment", postComment);
router.post("/like", postLike);
router.post("/dislike", postDislike);
router.get("/postsbyfollowed/:followedId", displayPostbyFollowed);

module.exports = router;
