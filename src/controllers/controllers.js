const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../database/models/user");

module.exports = {
  async register(req, res) {
    const { email } = req.body;

    try {
      if (await User.findOne({ email }))
        return res.status(400).send({ error: "User already exists" });

      const user = await User.create(req.body);

      user.password = undefined;

      return res.send(user);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Registration failed" });
    }
  },
  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    if (!user) return res.status(400).send({ error: "User not found" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).send({ error: "Invalid password" });

    user.password = undefined;

    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: "1d",
    });

    res.send({ user, token });
  },
  async scheduling(req, res) {
    res.status(200).send({ ok: true, user: req.userId });
  },
};
