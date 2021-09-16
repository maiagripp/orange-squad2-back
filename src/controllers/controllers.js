const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../modules/mailer");
const User = require("../database/models/user");
const Schedule = require("../database/models/scheduling");
const Reminder = require("../database/models/reminder");
const uploadImage = require("../modules/uploadImage");
const deleteFile = require("../modules/deleteImage");
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
      const { name, squad, email, phone, address, password } = req.body;

      if (await User.findOne({ email }))
        return res.status(400).send({ error: "User already exists" });

      if (!req.file)
        return res.status(400).send({ error: "There is no image" });

      const hash = await passwordEncrypt(password);

      const imageUrl = await uploadImage(req.file);

      await Promise.all([hash, imageUrl]);

      const user = await User.create({
        name: name,
        squad: squad,
        email: email,
        phone: phone,
        address: address,
        password: hash,
        image: imageUrl,
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
      const users = await User.find().populate(["reminder", "scheduling"]);
      return res.status(200).send({ users });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "No users found" });
    }
  },
  async user(req, res) {
    try {
      const user = await User.findById(req.params.userId).populate([
        "scheduling",
        "reminder",
      ]);
      return res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "User not found" });
    }
  },
  async userUpdate(req, res) {
    try {
      const { name, squad, email, phone, address } = req.body;

      const id = req.params.userId;

      if (!(await User.findById(id)))
        return res.status(400).send({ error: "User not found" });

      const user = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            name: name,
            squad: squad,
            email: email,
            phone: phone,
            address: address,
          },
        },
        { new: true }
      );

      user.password = undefined;

      return res.status(200).send(user);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Updated failed" });
    }
  },
  async userDelete(req, res) {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).send({ error: "User not found" });

      await deleteFile(user.image);
      await User.findByIdAndRemove(req.params.userId);
      return res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Delete failed" });
    }
  },
  async scheduling(req, res) {
    try {
      const scheduling = req.body;
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
      const { date, chair, place } = req.body;
      const user = await User.findById(req.userId);

      if (!user) return res.status(404).send({ error: "User not found" });

      const id = req.params.schedulingId;
      const schedule = await Schedule.findById(id);
      if (!schedule)
        return res.status(404).send({ error: "Schedule not found" });

      const scheduleUpdate = await Schedule.findByIdAndUpdate(
        id,
        {
          $set: {
            date: date,
            chair: chair,
            place: place,
          },
        },
        { new: true }
      );

      return res.status(200).send({ scheduleUpdate });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Update scheduling failed" });
    }
  },
  async schedulingDelete(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).send({ error: "User not found" });

      const id = req.params.schedulingId;
      const schedule = await Schedule.findById(id);
      if (!schedule)
        return res.status(404).send({ error: "Schedule not found" });

      await Schedule.findByIdAndRemove(id);

      user.scheduling = user.scheduling.map((element) => {
        if (element == id) element = null;
      });
      await user.save();
      return res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Delete scheduling failed" });
    }
  },
  async reminder(req, res) {
    try {
      const reminder = req.body;
      const user = await User.findById(req.userId);

      if (!user) return res.status(404).send({ error: "User not found" });

      await Promise.all(
        reminder.map(async (rem) => {
          const reminder = new Reminder({ ...rem, user: user._id });

          await reminder.save();

          user.reminder.push(reminder);
        })
      );
      await user.save();
      return res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Error creating reminder" });
    }
  },
  async reminderUpdate(req, res) {
    try {
      const rem = req.body;
      const user = await User.findById(req.userId);

      if (!user) return res.status(404).send({ error: "User not found" });

      const id = req.params.reminderId;
      const reminder = await Reminder.findById(id);
      if (!reminder)
        return res.status(404).send({ error: "Reminder not found" });

      const reminderUpdate = await Reminder.findByIdAndUpdate(
        id,
        {
          rem,
        },
        { new: true }
      );

      return res.status(200).send({ reminderUpdate });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Update reminder failed" });
    }
  },
  async reminderDelete(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).send({ error: "User not found" });

      const id = req.params.reminderId;
      const reminder = await Reminder.findById(id);
      if (!reminder)
        return res.status(404).send({ error: "Reminder not found" });

      await Reminder.findByIdAndRemove(id);

      user.reminder = user.reminder.map((element) => {
        if (element == id) element = null;
      });
      return res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Delete reminder failed" });
    }
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
  async updateImg(req, res) {
    if (!req.file) {
      return res.status(400).send({ error: "The file is invalid" });
    } else {
      try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).send({ error: "User not found" });

        const myFile = req.file;
        const imageUrl = await uploadImage(myFile);
        const deleteUrl = await deleteFile(user.image);

        await Promise.all([imageUrl, deleteUrl]);

        const updated = await User.findByIdAndUpdate(
          req.userId,
          {
            $set: {
              image: imageUrl,
            },
          },
          { new: true }
        );
        return res.status(200).send(updated);
      } catch (err) {
        console.log(err);
        return res.status(400).send({ error: "Can't update image" });
      }
    }
  },
  async chairs(req, res) {
    try {
      const schedule = await Schedule.find({}, "chair").select("-_id").exec();
      return res.status(200).send({ schedule });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: "Getting chairs failed" });
    }
  },
};
