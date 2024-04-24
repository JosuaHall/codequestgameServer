const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DistractorLinesSchema = new Schema({
  line_code: {
    type: String,
    required: true,
    unique: true,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = DistractorLines = mongoose.model(
  "distractorlines",
  DistractorLinesSchema
);
