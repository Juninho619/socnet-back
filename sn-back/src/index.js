const express = require("express");
const router = require("./Controllers/routes/user");
const postRouter = require("./Controllers/routes/post");
const app = express();
const mysql = require("mysql2");
const { connect } = require("./connexions/connexion");
require("dotenv").config();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

connect("mongodb://127.0.0.1:27017/"),
  (error) => {
    if (error) {
      console.log("failed to connect to mongodb database");
      process.exit(-1);
    } else {
      console.log("connected to mongodb database");
      app.listen(process.env.PORT);
    }
  };

app.use("/", router);
app.use("/post", postRouter);

app.listen(process.env.PORT, () => {
  console.log("Hello, world\nListening on port " + process.env.PORT);
});
