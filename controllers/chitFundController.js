const log = require("../logger");
const xrpl = require("xrpl");
const helperXRPL = require("../helpers/xrpl");
const { sequelize, Sequelize } = require("../db/models");
const ChitFund = require("../db/models").chit_funds;
const User = require("../db/models").users;
const FundMembers = require("../db/models").fund_members;
const Auctions = require("../db/models").auctions;

exports.chitFundList = async (req, res, next) => {
  try {
    let chit_funds = await ChitFund.findAll({
      include: [
        {
          model: User,
          through: { attributes: [] },
          as: "members",
          required: false,
        },
      ],
    });
    return res.status(200).send({ status: true, chit_funds });
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

exports.chitFundcreate = async (req, res, next) => {
  try {
    let chit_fund = await ChitFund.create(req.body);
    let xrpl_account = await helperXRPL.createAccount();
    await ChitFund.update(
      {
        xrpl_address: xrpl_account.classicAddress,
        xrpl_secret: xrpl_account.seed,
      },
      { where: { id: chit_fund.id } }
    );
    chit_fund = await ChitFund.findOne({
      where: {
        id: chit_fund.id,
      },
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("members.id")), "membersCount"],
        ],
      },
      include: [
        {
          model: User,
          through: { attributes: [] },
          as: "members",
          required: false,
        },
      ],
      group: ["members.id"],
    });
    return res.status(200).send({ status: true, chit_fund });
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

exports.addMember = async (req, res, next) => {
  try {
    let chit_fund = await ChitFund.findOne({
      where: { id: req.body.fund_id },
    });
    let user = await User.create(req.body);
    await FundMembers.create({ fund_id: chit_fund.id, user_id: user.id });
    return res.status(200).send({ status: true, message: "Success" });
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

exports.fundApprove = async (req, res, next) => {
  try {
    let chit_fund = await ChitFund.findOne({
      where: { id: req.body.fund_id },
    });
    chit_fund.fund_approved = true;
    await chit_fund.save();
    await chit_fund.reload();
    return res.status(200).send({ status: true, message: "Success" });
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

exports.chitFundApprovedMenu = async (req, res, next) => {
  try {
    let chit_funds = await ChitFund.findAll({
      where: {
        fund_approved: true,
      },
      attributes: ["fund_name"],
    });
    return res.status(200).send({ status: true, chit_funds });
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

exports.startAuction = async (req, res, next) => {
  try {
    let auction = await Auctions.create(req.body);
    auction = await Auctions.findOne({
      where: { id: auction.id },
      include: [{ model: ChitFund, as: "chit_fund" }],
    });
    return res.status(200).send({ status: true, auction });
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

exports.auctionList = async (req, res, next) => {
  try {
    let auction = await Auctions.findAll({
      include: [{ model: ChitFund, as: "chit_fund" }],
    });
    return res.status(200).send({ status: true, auction });
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
