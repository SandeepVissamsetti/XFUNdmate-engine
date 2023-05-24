const express = require("express");
const router = express.Router();
const log = require("../logger");
const openRouteController = require("../controllers/openRouteController");
const VerifyToken = require("../_middlewares/VerifyToken");

/* GET home page. */
router.get("/", openRouteController.index);

router.get("/test", openRouteController.test);

router.get("/protected", VerifyToken, openRouteController.protected);

module.exports = router;
