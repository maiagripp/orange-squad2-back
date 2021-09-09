const {
  register,
  authenticate,
  scheduling,
  users,
  passRecovery,
  passReset,
} = require("../controllers/controllers");
const authMiddleware = require("../middlewares/check-auth");

const router = require("express").Router();

router
  .post("/authenticate", authenticate)
  .post("/register", register)
  .post("/scheduling", authMiddleware, scheduling)
  .post("/forgot_password", passRecovery)
  .post("/reset_password", passReset)
  .get("/resume", (req, res) => {
    return res.status(200).json({ status: 201, msg: "success" });
  })
  .get("/users", users);

module.exports = router;
