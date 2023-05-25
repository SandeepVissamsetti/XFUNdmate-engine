const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const VerifyToken = require("../_middlewares/VerifyToken");

/* GET users listing. */
router.get(
  "/",
  // VerifyToken,
  userController.index
);

module.exports = router;
