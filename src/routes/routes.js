const {
  register,
  authenticate,
  users,
  user,
  userUpdate,
  userDelete,
  scheduling,
  schedulingUpdate,
  schedulingDelete,
  reminder,
  reminderUpdate,
  reminderDelete,
  passRecovery,
  passReset,
} = require("../controllers/controllers");
const authMiddleware = require("../middlewares/check-auth");

const router = require("express").Router();

router
  .post("/register", register)
  .post("/authenticate", authenticate)
  .get("/users", users)
  .get("/user/:userId", user)
  .patch("/user_update/:user_id", authMiddleware, userUpdate)
  .delete("/user_delete/:user_id", authMiddleware, userDelete)
  .post("/scheduling", authMiddleware, scheduling)
  .patch("/scheduling_update/:scheduling_id", authMiddleware, schedulingUpdate)
  .delete("/scheduling_delete/:scheduling_id", authMiddleware, schedulingDelete)
  .post("/reminder", authMiddleware, reminder)
  .patch("/reminder_update/:reminder_id", authMiddleware, reminderUpdate)
  .delete("/reminder_delete/:reminder_id", authMiddleware, reminderDelete)
  .post("/forgot_password", passRecovery)
  .post("/reset_password", passReset);

module.exports = router;
