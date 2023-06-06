const express = require("express");
const router = express.Router();
const VerifyToken = require("../_middlewares/VerifyToken");
const XRPLController = require("../controllers/XRPLController");
const paylodValidation = require("../_middlewares/paylodValidation");
const validationSchemas = require("../helpers/validationSchemas");

router.post(
  "/create-account",
  // VerifyToken,
  // paylodValidation(validationSchemas.fundCreateSchema),
  XRPLController.createXRPLAccount
);

router.post(
  "/get-balance",
  // VerifyToken,
  // paylodValidation(validationSchemas.fundCreateSchema),
  XRPLController.getBalance
);

router.post(
  "/send-xrp",
  // VerifyToken,
  // paylodValidation(validationSchemas.fundCreateSchema),
  XRPLController.sendXRP
);

router.post(
  "/acc-info",
  // VerifyToken,
  // paylodValidation(validationSchemas.fundCreateSchema),
  XRPLController.getAccountInfo
);

module.exports = router;
