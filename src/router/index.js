const auth = require("./auth");
const discussion = require("./discussion");
const router = require("express").Router();

router.use("/auth", auth);
router.use("/discussion", discussion);

module.exports = router;
