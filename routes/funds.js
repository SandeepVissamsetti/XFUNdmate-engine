const express = require("express");
const router = express.Router();
const VerifyToken = require("../_middlewares/VerifyToken");
const chitFundController = require("../controllers/chitFundController");
const paylodValidation = require("../_middlewares/paylodValidation");
const validationSchemas = require("../helpers/validationSchemas");

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

router.get(
  "/approved/menu",
  // VerifyToken,
  chitFundController.chitFundApprovedMenu
);

router.post(
  "/auction/start",
  // VerifyToken,
  // paylodValidation(validationSchemas.fundApproveSchema),
  chitFundController.startAuction
);

router.get(
  "/auction/list",
  // VerifyToken,
  chitFundController.auctionList
);

module.exports = router;
