const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const statementSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a statement"],
    },
    category: {
      type: [String],
      required: [true, "Please add a category"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reports: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      reason: {
        type: String,
      },
    }],
  },
  {
    timestamps: true,
  }
);

const Statement = mongoose.model("Statement", statementSchema);
module.exports = Statement;
