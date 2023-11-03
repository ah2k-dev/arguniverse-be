const auth = require("./auth");
const discussion = require("./discussion");
const contactUs = require("./contactUs");
const router = require("express").Router();

router.use("/auth", auth);
router.use("/discussion", discussion);
router.use("/contactUs", contactUs);

module.exports = router;
