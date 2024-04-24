const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  student_id: {
    type: String,
    required: true,
  },
  completed_question: {
    type: mongoose.Schema.Types.ObjectId, // Using ObjectId type for reference
    ref: "Question", // Reference to the 'Question' model
    required: true,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Submission = mongoose.model("submission", SubmissionSchema);
