const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../database/models/user");
const Schedule = require("../database/models/scheduling");

module.exports = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email }))
        return res.status(400).send({ error: "User already exists" });

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name,
        email: email,
        password: hash,
      });

      user.password = undefined;

      return res.status(201).send(user);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Registration failed" });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      console.log(user);
      if (!user) return res.status(404).send({ error: "User not found" });

      if (!(await bcrypt.compare(password, user.password)))
        return res.status(400).send({ error: "Invalid password" });

      user.password = undefined;

      const token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: "1d",
      });

      res.status(200).send({ user, token });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Login failed" });
    }
  },
  async scheduling(req, res) {
    try {
      const { scheduling } = req.body;
      const user = await User.findById(req.userId);

      if (!user) return res.status(404).send({ error: "User doesn't exists" });

      await Promise.all(
        scheduling.map(async (sched) => {
          const schedule = new Schedule({ ...sched, user: user._id });

          await schedule.save();

          user.scheduling.push(schedule);
        })
      );
      await user.save();
      return res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Scheduling failed" });
    }
  },
  async users(req, res) {
    try {
      const users = await User.find().populate("scheduling");
      return res.status(200).send({ users });
    } catch (error) {
      console.log(err);
      res.status(500).send({ error: "Internal error" });
    }
  },
};
