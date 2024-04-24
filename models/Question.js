const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  solution_code_lines: [
    { line_nr: { type: Number }, line_code: { type: String } },
  ],
  distraction_code_lines: [
    { line_nr: { type: Number }, line_code: { type: String } },
  ],
  chapter: {
    type: Number,
    required: true,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Question = mongoose.model("question", QuestionSchema);
