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
    return SuccessHandler(
      {
        message: "Statement",
        statement,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
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

module.exports = {
  createStatement,
  createArgument,
  popularStatements,
  searchStatement,
  getStatement,
  reportStatement,
};
