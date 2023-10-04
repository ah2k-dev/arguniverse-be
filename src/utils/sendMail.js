const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/config.env" });
const { createTransport } = nodemailer;

const sendMail = async (email, subject, text) => {
  const transport = createTransport(
    {
      service: process.env.SMPT_SERVICE,
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },

    }
  );
  await transport.sendMail({
    from: "arguniverse@gmail.com",
    to: email,
    subject,
    text,
  });
};

module.exports = sendMail;
