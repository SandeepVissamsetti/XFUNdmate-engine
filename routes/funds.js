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

router.get(
  "/members/list/:uuid",
  // VerifyToken,
  chitFundController.chitFundMembersList
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
  // paylodValidation(validationSchemas.auctionSchema),
  chitFundController.startAuction
);

router.get(
  "/auction/list",
  // VerifyToken,
  chitFundController.auctionList
);

router.get(
  "/auction/menu/:fund_uuid",
  // VerifyToken,
  chitFundController.auctionMenu
);

router.get(
  "/members/menu/:uuid",
  // VerifyToken,
  chitFundController.chitFundMembersMenu
);

router.post(
  "/auction/bid",
  // VerifyToken,
  // paylodValidation(validationSchemas.bidSchema),
  chitFundController.createBid
);

router.get(
  "/auction/bid/list",
  // VerifyToken,
  chitFundController.bidList
);

router.get(
  "/auction/fulfill/:auction_uuid",
  // VerifyToken,
  chitFundController.auctionFulfill
);

module.exports = router;
