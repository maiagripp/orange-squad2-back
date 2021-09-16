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
  updateImg,
  chairs,
} = require("../controllers/controllers");

const authMiddleware = require("../middlewares/check-auth");
const imgMiddleware = require("../middlewares/check-img");

const router = require("express").Router();

// prettier-ignore
router
  .post("/register", imgMiddleware.single("userImage"), register)
  .post("/authenticate", imgMiddleware.none(), authenticate)
  .get("/users", users)
  .get("/user/:userId", user)
  .patch("/user_update/:userId", imgMiddleware.none(), authMiddleware, userUpdate)
  .delete("/user_delete/:userId", authMiddleware, userDelete)
  .post("/scheduling", imgMiddleware.none(), authMiddleware, scheduling)
  .patch("/scheduling_update/:schedulingId", imgMiddleware.none(), authMiddleware, schedulingUpdate)
  .delete("/scheduling_delete/:schedulingId", authMiddleware, schedulingDelete)
  .post("/reminder", imgMiddleware.none(), authMiddleware, reminder)
  .patch("/reminder_update/:reminderId", imgMiddleware.none(), authMiddleware, reminderUpdate)
  .delete("/reminder_delete/:reminderId", authMiddleware, reminderDelete)
  .post("/forgot_password", imgMiddleware.none(), passRecovery)
  .post("/reset_password", imgMiddleware.none(), passReset)
  .post("/updateImage", authMiddleware, imgMiddleware.single("userImage"), updateImg)
  .get("/chairs", authMiddleware, chairs);

module.exports = router;
