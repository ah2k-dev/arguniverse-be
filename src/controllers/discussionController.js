const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Argument = require("../models/Discussions/argument");
const Statement = require("../models/Discussions/statement");

const createStatement = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const { title, category } = req.body;
    const user = req.user._id;
    const statement = await Statement.create({
      title,
      category,
      user,
    });
    statement.save();
    if (req.body.argument) {
      const { type, comment } = req.body.argument;
      const argument = await Argument.create({
        type,
        comment,
        user,
        statement: statement._id,
      });
      argument.save();
      return SuccessHandler(
        {
          message: "Statement created successfully",
          statement,
          argument,
        },
        200,
        res
      );
    }
    return SuccessHandler(
      {
        message: "Statement created successfully",
        statement,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const createArgument = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const { id } = req.params;
    const { type, comment } = req.body;
    const user = req.user._id;

    const statement = await Statement.findById(id);
    if (!statement) {
      return ErrorHandler("Statement does not exist", 400, req, res);
    }

    const argument = await Argument.create({
      type,
      comment,
      user,
      statement: statement._id,
    });

    argument.save();

    return SuccessHandler(
      {
        message: "Argument created successfully",
        argument,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const popularStatements = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    let mostArguments = await Argument.aggregate([
      {
        $group: {
          _id: "$statement",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // first 5 statements
    mostArguments = mostArguments.slice(0, 5);

    const popularStatements = await Statement.find({
      _id: { $in: mostArguments.map((val) => val._id) },
    }).populate("user");

    return SuccessHandler(
      {
        message: "Popular statements",
        popularStatements,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const searchStatement = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const { title, category } = req.body;
    const statements = await Statement.find({
      title: { $regex: title, $options: "i" },
      category: { $in: category },
    }).populate("user");
    return SuccessHandler(
      {
        message: "Statements",
        statements,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getStatement = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const { id } = req.params;
    const statement = await Statement.findById(id).populate("user");
    if (!statement) {
      return ErrorHandler("Statement does not exist", 400, req, res);
    }
    const arguments = await Argunment.find({
      statement: statement._id
    })
    return SuccessHandler(
      {
        message: "Statement",
        statement,
        arguments
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getArgument = async (req, res) => {
  try {
    const { id } = req.params
    const argument = await Argument.findById(id)
    return SuccessHandler(
      {
        message: "Argument fetched successfully",
        argument,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
}
const reportStatement = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const { reason } = req.body;
    const { id } = req.params;
    const user = req.user._id;

    const statement = await Statement.findById(id);
    if (!statement) {
      return ErrorHandler("Statement does not exist", 400, req, res);
    }

    statement.reports.push({ user, reason });

    statement.save();
    let message = `${statement.title} statement has been reported. Please check the statement and take actions if needed.`
    await sendMail("arguniverse@gmail.com", "Statement Report", message);

    return SuccessHandler(
      {
        message: "Statement reported successfully",
        statement,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const reportArgument = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const { reason } = req.body;
    const { id } = req.params;
    const user = req.user._id;

    const argument = await Argument.findById(id);
    if (!argument) {
      return ErrorHandler("Statement does not exist", 400, req, res);
    }

    argument.reports.push({ user, reason });

    argument.save();
    let message = `${argument.comment} argument has been reported. Please check the argument and take actions if needed.`
    await sendMail("arguniverse@gmail.com", "Argument Report", message);
    return SuccessHandler(
      {
        message: "Argument reported successfully",
        argument,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteStatement = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const user = req.user;
    const { id } = req.params
    const statement = await Statement.findById(id)
    if (user.role == 'user') {
      if (user._id !== statement.user) {
        return ErrorHandler("you are not allowed to delete the statement", 500, req, res);
      }
    }
    await Statement.findByIdAndDelete(id)
    return SuccessHandler(
      {
        message: "Statement deleted successfully",
        statement,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
}

const deleteArgument = async (req, res) => {
  // #swagger.tags = ['discussion']
  try {
    const user = req.user;
    const { id } = req.params
    const argument = await Argument.findById(id)
    if (user.role == 'user') {
      if (user._id !== argument.user) {
        return ErrorHandler("you are not allowed to delete the argument", 500, req, res);
      }
    }
    await Argument.findByIdAndDelete(id)
    return SuccessHandler(
      {
        message: "Argument deleted successfully",
        argument,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
}

const getReported = async (req, res) => {
  // #swagger.tags=['discussion']
  try {
    if (req.user.role !== 'admin') {
      return ErrorHandler("You are not allowed to access this resource", 500, req, res);
    }
    const statements = await Statement.find({
      reports: { $exists: true }
    })

    const arguments = await Argument.find({
      reports: { $exists: true }
    })

    return SuccessHandler(
      {
        message: "Reported arguments and statements fetched successfully",
        arguments,
        statements
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
}

module.exports = {
  createStatement,
  createArgument,
  popularStatements,
  searchStatement,
  getStatement,
  reportStatement,
  reportArgument,
  deleteStatement,
  deleteArgument,
  getReported,
  getArgument,
};
