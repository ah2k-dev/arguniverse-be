const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const argumentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["for", "against"],
      required: [true, "Please add a type"],
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    statement: {
      type: mongoose.Schema.ObjectId,
      ref: "Statement",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Argument = mongoose.model("Argument", argumentSchema);
module.exports = Argument;
