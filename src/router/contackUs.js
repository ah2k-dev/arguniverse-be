const router = require("express").Router();
const sendMail = require("../utils/sendMail");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
router.route("/").post((req, res) => {
  try {
    const { name, email, subject, comment } = req.body;
    const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nComment: ${comment}`;
    sendMail(email, subject, text);
    return SuccessHandler("Email sent successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
});

module.exports = router;
