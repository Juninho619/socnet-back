const express = require("express");
const {
  post,
  updatePost,
  deletePost,
  postComment,
  postLike,
  postDislike,
  displayPostbyFollowed,
  insertPostPic,
  followUser,
  showAllPosts,
} = require("../postController");
const router = express.Router();

router.post("/newpost", post);
router.post("/postpic", insertPostPic);
router.put("/updatepost", updatePost);
router.delete("/deletepost", deletePost);
router.post("/comment", postComment);
router.post("/like", postLike);
router.post("/dislike", postDislike);
router.post("/follow", followUser);
router.get("allposts", showAllPosts);
router.get("/postsbyfollowed/:followerId", displayPostbyFollowed);

module.exports = router;
