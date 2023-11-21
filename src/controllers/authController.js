const User = require("../models/User/user");
const validator = require("validator");
const sendMail = require("../utils/sendMail");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Argument = require("../models/Discussions/argument");
const Statement = require("../models/Discussions/statement");
//register
const register = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { firstName, lastName, email, password } = req.body;
    // if (
    //   !password.match(
    //     /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
    //   )
    // ) {
    //   return ErrorHandler(
    //     "Password must contain atleast one uppercase letter, one special character and one number",
    //     400,
    //     req,
    //     res
    //   );
    // }
    const user = await User.findOne({ email });
    if (user) {
      return ErrorHandler("User already exists", 400, req, res);
    }
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    newUser.save();
    return SuccessHandler("User created successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//login
const login = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
      return ErrorHandler("Invalid email format", 400, req, res);
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ErrorHandler("User does not exist", req, 400, res);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    jwtToken = user.getJWTToken();
    return SuccessHandler(
      { message: "Logged in successfully", user, jwtToken },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//logout
const logout = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    req.user = null;
    return SuccessHandler("Logged out successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const passwordResetToken = Math.floor(100000 + Math.random() * 900000);
    const passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();
    const message = `Your password reset token is ${passwordResetToken} and it expires in 10 minutes`;
    const subject = `Password reset token`;
    await sendMail(email, subject, message);
    return SuccessHandler(`Password reset token sent to ${email}`, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//reset password
const resetPassword = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { email, passwordResetToken, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    if (
      user.passwordResetToken !== passwordResetToken ||
      user.passwordResetTokenExpires < Date.now()
    ) {
      return ErrorHandler("Invalid token", 400, req, res);
    }
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();
    return SuccessHandler("Password reset successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//update password
const updatePassword = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { currentPassword, newPassword } = req.body;
    // if (
    //   !newPassword.match(
    //     /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
    //   )
    // ) {
    //   return ErrorHandler(
    //     "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
    //     400,
    //     req,
    //     res
    //   );
    // }
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    const samePasswords = await user.comparePassword(newPassword);
    if (samePasswords) {
      return ErrorHandler(
        "New password cannot be same as old password",
        400,
        req,
        res
      );
    }
    user.password = newPassword;
    await user.save();
    return SuccessHandler("Password updated successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const users = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    let usersData = await User.find();
    Promise.all(
      usersData.map(async (val, ind) => {
        const statmentCount = await Statement.countDocuments({
          user: val._id,
        });
        const argumentCount = await Argument.countDocuments({
          user: val._id,
        });
        return {
          user: val,
          statmentCount,
          argumentCount,
        };
      })
    ).then((result) => {
      return SuccessHandler(
        {
          users: result,
        },
        200,
        res
      );
    });
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const userProfile = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    let userData = await User.findById(req.user._id);
    return SuccessHandler(
      {
        message: "User Profile Fetched Successfully",
        userData,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateUserProfile = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const {
      firstName,
      lastName,
      email,
      currentPassword,
      newPassword,
      isUpdatePassword,
    } = req.body;

    if (!isUpdatePassword) {
      console.log(!updatePassword);
      console.log("Not update Password");
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            firstName,
            lastName,
            email,
          },
        }
      );
      return SuccessHandler(
        {
          message: "User Profile updated Successfully",
        },
        200,
        res
      );
    }
    if (isUpdatePassword) {
      console.log(isUpdatePassword);
      console.log("update Password");
      const user = await User.findById(req.user.id).select("+password");
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return ErrorHandler("Invalid credentials", 400, req, res);
      }
      const samePasswords = await user.comparePassword(newPassword);
      if (samePasswords) {
        return ErrorHandler(
          "New password cannot be same as old password",
          400,
          req,
          res
        );
      }
      user.password = newPassword;
      await user.save();
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            firstName,
            lastName,
            email,
          },
        }
      );
      return SuccessHandler(
        {
          message: "User Profile updated Successfully",
        },
        200,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  users,
  userProfile,
  updateUserProfile,
};
