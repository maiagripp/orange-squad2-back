const {
  register,
  login,
  scheduling,
  users,
} = require("../controllers/controllers");
const authMiddleware = require("../middlewares/check-auth");

const router = require("express").Router();

router
  .post("/login", login)
  .post("/register", register)
  .post("/scheduling", authMiddleware, scheduling)
  .get("/resume", (req, res) => {
    return res.status(200).json({ status: 201, msg: "success" });
  })
  .get("/users", users);

module.exports = router;
