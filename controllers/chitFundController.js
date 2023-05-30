const log = require("../logger");
const xrpl = require("xrpl");
const helperXRPL = require("../helpers/xrpl");
const { sequelize, Sequelize } = require("../db/models");
const ChitFund = require("../db/models").chit_funds;
const User = require("../db/models").users;
const FundMembers = require("../db/models").fund_members;
const Auctions = require("../db/models").auctions;
const AuctionBids = require("../db/models").auction_bids;

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
      order: [["createdAt", "desc"]],
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
      // attributes: {
      //   include: [
      //     [Sequelize.fn("COUNT", Sequelize.col("members.id")), "membersCount"],
      //   ],
      // },
      include: [
        {
          model: User,
          through: { attributes: [] },
          as: "members",
          required: false,
        },
      ],
      // group: ["members.id"],
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
    delete user.dataValues.xrpl_secret;
    return res
      .status(200)
      .send({ status: true, member: user, message: "Success" });
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
      attributes: ["id", "fund_name", "uuid"],
      order: [["createdAt", "desc"]],
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
    let query = {
      where: {},
      include: [{ model: ChitFund, as: "chit_fund" }],
    };
    if (req.query.fund_id) {
      query.where.fund_id = req.query.fund_id;
    }
    let auctions = await Auctions.findAll(query);
    return res.status(200).send({ status: true, auctions });
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

exports.auctionMenu = async (req, res, next) => {
  try {
    let chit_fund = await ChitFund.findOne({
      where: {
        uuid: req.params.fund_uuid,
      },
    });
    let auctions = await Auctions.findAll({
      where: { fund_id: chit_fund.id, is_done: false },
      attributes: { exclude: ["createdAt", "updatedAt", "uuid"] },
    });
    return res.status(200).send({ status: true, auctions });
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

exports.chitFundMembersMenu = async (req, res, next) => {
  try {
    let chit_fund = await ChitFund.findOne({
      where: {
        uuid: req.params.uuid,
      },
      attributes: ["id"],
      include: [
        {
          model: User,
          through: { attributes: [] },
          as: "members",
          required: false,
          attributes: ["id", "name", "email"],
        },
      ],
    });
    return res
      .status(200)
      .send({ status: true, fund_members: chit_fund.members });
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

exports.createBid = async (req, res, next) => {
  try {
    let auction = await Auctions.findOne({
      where: { id: req.body.auction_id },
      include: [{ model: ChitFund, as: "chit_fund" }],
    });
    let bid_check = await AuctionBids.findOne({
      where: { auction_id: auction.id, user_id: req.body.user_id },
    });
    if (bid_check) {
      throw { details: [{ message: "Bid already submitted." }] };
    }
    if (
      parseInt(auction.chit_fund.min_auction_amount) >=
      parseInt(req.body.bid_amount)
    ) {
      throw {
        details: [
          { message: "Bid amount should be greater than min auction amount." },
        ],
      };
    }
    let bid = await AuctionBids.create({
      ...req.body,
      fund_id: auction.fund_id,
    });
    bid = await AuctionBids.findOne({
      where: {
        id: bid.id,
      },
    });
    return res.status(200).send({ status: true, bid });
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

exports.bidList = async (req, res, next) => {
  try {
    let query = {
      where: {},
      include: [
        { model: ChitFund, as: "chit_fund" },
        { model: User, as: "member" },
        { model: Auctions, as: "auction" },
      ],
    };
    if (req.query.fund_id) {
      query.where.fund_id = req.query.fund_id;
    }
    if (req.query.auction_id) {
      query.where.auction_id = req.query.auction_id;
    }
    let bids = await AuctionBids.findAll(query);
    return res.status(200).send({ status: true, bids });
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
