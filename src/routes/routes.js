const router = require("express").Router();

router
  .post("/login", (req, res) => {
    return res.status(200).json({ status: 200, msg: "success" });
  })
  .post("/signup", (req, res) => {
    return res.status(201).json({ status: 201, msg: "success" });
  })
  .post("/workstation", (req, res) => {
    return res.status(201).json({ status: 201, msg: "success" });
  })
  .get("/resume", (req, res) => {
    return res.status(200).json({ status: 201, msg: "success" });
  });

module.exports = router;
