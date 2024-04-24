const express = require("express");
const router = express.Router();
const Question = require("../../models/Question"); // Import your Question model
const Submission = require("../../models/Submission");
const DistractorLines = require("../../models/DistractorLines");

// POST endpoint to create a new question
// api/questions/create/question
router.post("/create/question", async (req, res) => {
  try {
    // Extract data from the request body
    const {
      name,
      description,
      solution_code_lines,
      distraction_code_lines,
      chapter,
    } = req.body;

    // Create a new Question document
    const newQuestion = new Question({
      name,
      description,
      solution_code_lines,
      distraction_code_lines,
      chapter,
    });

    // Save the new question to the database
    const savedQuestion = await newQuestion.save();

    // Process distraction_code_lines and save each line_code as a DistractorLines document
    const savedDistractorLines = await Promise.all(
      distraction_code_lines.map(async (element) => {
        const distractorLine = new DistractorLines({
          line_code: element.line_code,
        });
        return await distractorLine.save();
      })
    );

    res.status(201).json(savedQuestion); // Respond with the saved question
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET endpoint to fetch questions categorized by chapters
router.get("/questions-by-chapter", async (req, res) => {
  try {
    const allQuestions = await Question.find(); // Fetch all questions

    // Categorize questions by chapters
    const questionsByChapter = {};
    for (let question of allQuestions) {
      const chapterNumber = question.chapter;

      if (!questionsByChapter[chapterNumber]) {
        questionsByChapter[chapterNumber] = [];
      }

      questionsByChapter[chapterNumber].push(question);
    }

    // Fill in missing chapters with empty arrays
    for (let chapter = 1; chapter <= 14; chapter++) {
      if (!questionsByChapter[chapter]) {
        questionsByChapter[chapter] = [];
      }
    }

    res.status(200).json(questionsByChapter); // Respond with categorized questions
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint to fetch questions by chapter
// Example route: /api/questions/chapter/:chapterNumber
router.get("/chapter/:chapterNumber", async (req, res) => {
  const chapterNumber = parseInt(req.params.chapterNumber);

  try {
    // Find questions based on the specified chapter number
    const questions = await Question.find({ chapter: chapterNumber });

    res.status(200).json(questions); // Respond with the fetched questions
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint to fetch a question by ID
router.get("/chapter/:chapterId/problem/:problemId", async (req, res) => {
  const { chapterId, problemId } = req.params;
  try {
    const question = await Question.findOne({
      _id: problemId,
      chapter: chapterId,
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT endpoint to update a question
router.put("/:problemId", async (req, res) => {
  const { problemId } = req.params;
  const updatedQuestionData = req.body;
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      problemId,
      updatedQuestionData,
      { new: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:problemId", async (req, res) => {
  const problemId = req.params.problemId;

  try {
    // Find the question by ID and delete it
    await Question.findByIdAndDelete(problemId);

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to handle submission
router.post("/submit", async (req, res) => {
  const { name, studentId, questionId } = req.body;

  try {
    // Create new Submission document
    const submission = new Submission({
      name,
      student_id: studentId,
      completed_question: questionId, // Assuming 'questionId' is the reference to Question._id
    });

    // Save Submission to the database
    await submission.save();

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/submissions", async (req, res) => {
  const { chapter } = req.query;
  const chapterNr = parseInt(chapter); // Parse chapter as an integer

  try {
    const submissions = await Submission.aggregate([
      {
        $lookup: {
          from: "questions", // Name of the 'questions' collection
          localField: "completed_question",
          foreignField: "_id",
          as: "question", // Alias for the joined 'Question' document
        },
      },
      {
        $match: {
          "question.chapter": chapterNr,
        },
      },
    ]);

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/submissions", async (req, res) => {
  const { chapter } = req.query;

  try {
    // Ensure chapter parameter is provided and parse it as an integer
    if (!chapter) {
      return res.status(400).json({ message: "Chapter parameter is required" });
    }

    const chapterNr = parseInt(chapter);

    // Find submissions to delete based on the specified chapter
    const submissionsToDelete = await Submission.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "completed_question",
          foreignField: "_id",
          as: "question",
        },
      },
      {
        $match: {
          "question.chapter": chapterNr,
        },
      },
    ]);

    // Extract submission IDs to be deleted
    const submissionIdsToDelete = submissionsToDelete.map(
      (submission) => submission._id
    );

    // Delete submissions that match the specified chapter
    const deletionResult = await Submission.deleteMany({
      _id: { $in: submissionIdsToDelete },
    });

    res.status(200).json({
      message: `${deletionResult.deletedCount} submissions deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting submissions:", error);
    res
      .status(500)
      .json({ message: "Failed to delete submissions", error: error.message });
  }
});

// GET all distractor lines
router.get("/get/all/distractors", async (req, res) => {
  try {
    const distractorLines = await DistractorLines.find();
    console.log("Success, all distractors loaded");
    res.json(distractorLines);
  } catch (err) {
    console.error("Error fetching distractor lines:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
