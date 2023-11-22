const router = require("express").Router();
const sendMail = require("../utils/sendMail");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Contact = require("../models/User/contact");
router.route("/").post(async (req, res) => {
  try {
    const { name, email, subject, comment } = req.body;
    const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nComment: ${comment}`;
    await sendMail(email, subject, text);
    await Contact.create({ name, email, subject, comment });
    return SuccessHandler("Email sent successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
});

router.route("/get").get(async (req, res) => {
  try {
    // const { pageNo, pageSize } = req.body;
    // const contactCounts = await Contact.countDocuments();
    const contacts = await Contact.find({})
      // .skip(pageSize * (pageNo - 1))
      // .limit(pageSize)
      .sort({ createdAt: -1 });
    return SuccessHandler(
      { message: "Contact Detail fetch", contacts },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
});

module.exports = router;
