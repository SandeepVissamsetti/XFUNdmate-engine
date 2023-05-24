const express = require("express");
const router = express.Router();
const log = require("../logger");
const ChitFund = require("../db/models").chit_funds;
const VerifyToken = require("../_middlewares/VerifyToken");
const chitFundController = require("../controllers/chitFundController");
const paylodValidation = require("../_middlewares/paylodValidation");
const validationSchemas = require("../helpers/validationSchemas");

/* GET home page. */
router.get("/list", chitFundController.chitFundList);

router.post(
  "/create",
  // VerifyToken,
  // paylodValidation(validationSchemas.fundCreateSchema),
  chitFundController.chitFundcreate
);

router.post(
  "/add-member",
  // VerifyToken,
  // paylodValidation(validationSchemas.addMemberSchema),
  chitFundController.addMember
);

router.post(
  "/approve",
  // VerifyToken,
  // paylodValidation(validationSchemas.fundApproveSchema),
  chitFundController.fundApprove
);

module.exports = router;
