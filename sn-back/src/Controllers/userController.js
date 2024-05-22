const { pool } = require("../connexions/db");
const bcrypt = require("bcrypt");
const bson = require("bson");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { transporter } = require("../services/mailer");
var cors = require("cors");

const register = async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body;
  // const defaultPic =

  if (!firstName || !lastName || !email || !username || !password) {
    res.status(400).json({ msg: "missing fields" });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.execute(
      `INSERT INTO users (first_name, last_name, user_email, user_profile, password, role, username )
      VALUES('${firstName}', '${lastName}', '${email}','../uploads/profile', '${hashedPassword}', 'user','${username}');`
    );
    res.status(200).json("Welcome, " + username);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const insertProfilePic = async (req, res) => {
  // Insérer image dans tableau correspondant
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

const login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ error: "missing fields" });
    return;
  }

  let email = req.body.email;
  let password = req.body.password;

  try {
    const values = [email];
    const sql = `SELECT * FROM users WHERE user_email = ? `;
    const [result] = await pool.query(sql, values);

    if (result.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    } else {
      // déclarer const isvalid et utiliser conditions
      const isValid = await bcrypt.compare(password, result[0].password);

      if (!isValid) {
        res.status(401).json({ error: "U twat" });
        return;
      }
      if (isValid) {
        const token = jwt.sign(
          {
            email: result[0].user_email,
            id: result[0].user_id,
            role: result[0].role,
          },
          process.env.MY_SECRET_KEY,
          { expiresIn: "20d" }
        );
        console.log();
        res.status(200).json({ jwt: token });
        console.log("login successful");
      }
    }
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const followUser = async (req, res) => {
  const { followerId, followedId } = req.body;
  try {
    const [rows] = await pool.query(
      `INSERT INTO follow(follower_id, followed_id)VALUES('${followerId}','${followedId}');`
    );
    console.log(rows);
    res.status(200).json({ rows });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e });
  }
};

const displayAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM users`);
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ e });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  try {
    const [rows] = await pool.execute(
      `DELETE FROM users WHERE user_id = ${id}; `
    );
    res.status(200).json({ msg: "user deleted" });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

const searchUser = async (req, res) => {
  const { username, userEmail } = req.body;

  if (!username && !userEmail)
    res.status(500).json({ msg: "nothing to search" });

  // Conditions en cas de username ou d'email
  if (username) {
    const query = `SELECT * FROM users WHERE username LIKE ?;`;
    const [rows] = await pool.query(query, [`%${username}%`]);

    console.log(rows);
    console.log(username);
    res.status(200).json(rows);
  }
  if (userEmail) {
    const [rows2] = await pool.query(
      `SELECT * FROM users WHERE user_email LIKE '%?%';`
    );
    res.status(200).json(rows2);
  }
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  const tokenBasis = email + `${new Date()}`;
  const activationToken = await bcrypt.hash(tokenBasis, 10);
  let cleanToken = activationToken.replaceAll("/", "");

  const info = await transporter.sendMail({
    from: `${process.env.SMTP_EMAIL}`,
    to: email,
    subject: "Reset your password",
    text: "Reset your password",
    html: `<p>  It seems you requested a link to reset your password. Here it is:
                <a href="http://localhost:3045/resetpassword/${cleanToken}">Reset your password</a>
          </p>
          <p>If you didn't make such a request, you can safely ignore this message.</p>
          <p>Cheers</p>`,
  });
  res.status(200).json(info);
};

const passwordReset = async (req, res) => {
  const newPassword = req.body.newPassword;
  const email = req.body.email;
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const sql = await pool.execute(`UPDATE users
  set password ='${hashedNewPassword}' WHERE user_email='${email}';`);
};

module.exports = {
  register,
  insertProfilePic,
  login,
  followUser,
  displayAllUsers,
  deleteUser,
  searchUser,
  resetPasswordRequest,
  passwordReset,
};
