const server = require("express");
const app = server();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
