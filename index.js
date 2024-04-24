const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const challanges = require("./routes/api/challanges");

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "*"],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = process.env.mongoURI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.use("/api/questions", challanges);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
