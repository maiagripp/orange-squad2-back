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
};
