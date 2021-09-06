const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const routes = require("./routes/routes");

dotenv.config();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);
app.use(cors());
app.use(helmet());

// server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
