const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../modules/mailer");
const User = require("../database/models/user");
const Schedule = require("../database/models/scheduling");
const Reminder = require("../database/models/reminder");
require("dotenv").config();

async function passwordEncrypt(password) {
  return await bcrypt.hash(password, 10);
}

function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: "1d",
  });
}

module.exports = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email }))
        return res.status(400).send({ error: "User already exists" });

      const hash = await passwordEncrypt(password);

      const user = await User.create({
        name: name,
        email: email,
        password: hash,
      });

      user.password = undefined;

      return res.status(201).send({
        user,
        token: generateToken({ id: user.id }),
      });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Registration failed" });
    }
  },
  async authenticate(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) return res.status(404).send({ error: "User not found" });

      if (!(await bcrypt.compare(password, user.password)))
        return res.status(400).send({ error: "Invalid password" });

      user.password = undefined;

      res.status(200).send({
        user,
        token: generateToken({ id: user.id }),
      });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Login failed" });
    }
  },
  async users(req, res) {
    try {
      const users = await User.find().populate("scheduling");
      return res.status(200).send({ users });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal error" });
    }
  },
  async user(req, res) {
    try {
      const user = await User.findById(req.params.userId).populate(
        "scheduling"
      );
      return res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal error" });
    }
  },
  async userUpdate(req, res) {
    try {
      const { name, email } = req.body;
      id = req.params.userId;
      if (!(await User.findOne(id)))
        return res.status(400).send({ error: "User not found" });

      const user = await User.findByIdAndUpdate(
        id,
        {
          name: name,
          email: email,
        },
        { new: true }
      );

      user.password = undefined;

      return res.status(201).send(user);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Registration failed" });
    }
  },
  async userDelete(req, res) {
    try {
      await User.findByIdAndRemove(req.params.userId);
      return res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal error" });
    }
  },
  async scheduling(req, res) {
    try {
      const { scheduling } = req.body;
      const user = await User.findById(req.userId);

      if (!user) return res.status(404).send({ error: "User not found" });

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
  async schedulingUpdate(req, res) {
    try {
    } catch (err) {}
  },
  async schedulingDelete(req, res) {
    try {
    } catch (err) {}
  },
  async reminder(req, res) {
    try {
      const reminder = await Reminder.create({ ...req.body, user: req.userId });
      return res.send({ reminder });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Error creating new reminder" });
    }
  },
  async reminderUpdate(req, res) {
    try {
    } catch (err) {}
  },
  async reminderDelete(req, res) {
    try {
    } catch (err) {}
  },
  async passRecovery(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).send({ error: "User not found" });

      const token = crypto.randomBytes(20).toString("hex");

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await User.findByIdAndUpdate(user.id, {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });

      mailer.sendMail(
        {
          to: email,
          from: process.env.EMAIL,
          template: "auth/forgot_password",
          context: { token },
        },
        (err) => {
          if (err)
            return res
              .status(400)
              .send({ error: "Could not sent recovery email" });

          return res.status(200).send();
        }
      );
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Error on forgot password, try again" });
    }
  },
  async passReset(req, res) {
    try {
      const { email, token, password } = req.body;

      const user = await User.findOne({ email }).select(
        "+passwordResetToken passwordResetExpires"
      );

      if (!user) return res.status(404).send({ error: "User not found" });

      if (token !== user.passwordResetToken)
        return res.status(400).send({ error: "Token invalid" });

      const now = new Date();

      if (now > user.passwordResetExpires)
        return res
          .status(400)
          .send({ error: "Token expired, generate a new one" });

      user.password = await passwordEncrypt(password);

      await user.save();

      res.send();
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Cannot reset password, try again" });
    }
  },
};
