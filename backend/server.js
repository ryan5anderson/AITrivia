const express = require("express");
const router = express.Router();
const { getTriviaQuestion } = require("./controllers/openaiController");

router.post("/generate-question", getTriviaQuestion);

module.exports = router;
