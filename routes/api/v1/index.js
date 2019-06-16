var express = require("express");
var router = express.Router();
var cgTranscripts = require("./cgTranscripts");

router.use("/cg-transcripts", cgTranscripts); // APIs must always be versioned.

module.exports = router;
