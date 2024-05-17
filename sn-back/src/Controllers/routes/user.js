const express = require("express");
const {
  register,
  login,
  followUser,
  displayAllUsers,
  deleteUser,
  searchUser,
  resetPassword,
  insertProfilePic,
  resetPasswordRequest,
  passwordReset,
} = require("../userController");
const router = express.Router();

router.post("/register", register);
router.post("/profile", insertProfilePic);
router.post("/login", login);
router.get("/follow", followUser);
router.get("/displayusers", displayAllUsers);
router.delete("/deleteuser", deleteUser);
router.post("/searchuser", searchUser);
router.post("/resetpasswordrequest", resetPasswordRequest);
router.post("/passwordreset", passwordReset);

module.exports = router;
