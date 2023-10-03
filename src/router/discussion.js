const router = require("express").Router();
const isAuthenticated = require("../middleware/auth");
const discussion = require("../controllers/discussionController");

router.route("/create-statement").post(
    isAuthenticated,
    discussion.createStatement
);
router.route("/create-argument/:id").post(
    isAuthenticated,
    discussion.createArgument
);

router.route("/popular-statements").get(
    discussion.popularStatements
);
router.route("/search-statement").post(
    discussion.searchStatement
);
router.route("/get-statement/:id").get(
    discussion.getStatement
);

router.route("/report-statement/:id").post(
    isAuthenticated,
    discussion.reportStatement
);

module.exports = router;
