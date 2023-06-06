const log = require("../logger");
const { sequelize, Sequelize } = require("../db/models");
const xrpl = require("xrpl");
const helperXRPL = require("../helpers/xrpl");

exports.createXRPLAccount = async (req, res, next) => {
  try {
    let account = await helperXRPL.createAccount();
    return res.status(200).send({ status: true, account });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      log.error(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
};

exports.getBalance = async (req, res, next) => {
  try {
    const balance = await helperXRPL.getAccBalance(req.body.address);
    return res.status(200).send({ status: true, balance });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      log.error(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
};

exports.sendXRP = async (req, res, next) => {
  try {
    const transaction = await helperXRPL.sendXRP(
      req.body.sender_address,
      req.body.sender_secret,
      req.body.amount_xrp,
      req.body.destination_address
    );
    return res.status(200).send({ status: true, transaction });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      log.error(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
};

exports.getAccountInfo = async (req, res, next) => {
  try {
    const info = await helperXRPL.getAccInfo(req.body.address);
    return res.status(200).send({ status: true, info });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      log.error(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
};
