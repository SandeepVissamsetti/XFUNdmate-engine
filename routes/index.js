const express = require("express");
const router = express.Router();
const log = require("../logger");

/* GET home page. */
router.get("/", function (req, res, next) {
  try {
    res.status(200).send("<h2>XFUNdmate<h2>");
  } catch (error) {
    log.error(error);
    res.status(500).send("<h3>Internal Server Error<h3>");
  }
});

module.exports = router;
