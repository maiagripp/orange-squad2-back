const mongoose = require("mongoose");
require("dotenv").config();
// prettier-ignore
const uri = process.env.NODE_ENV === "development" ? process.env.MONGO_TEST : process.env.MONGO_PROD
console.log(uri);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;

module.exports = mongoose;
