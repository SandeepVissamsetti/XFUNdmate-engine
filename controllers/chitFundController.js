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
    let total_members = await FundMembers.count({
      where: { fund_id: chit_fund.id },
    });
    if (total_members >= chit_fund.total_members) {
      throw {
        details: [{ message: "Fund reached max member count." }],
      };
    }
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

exports.chitFundMembersList = async (req, res, next) => {
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
        },
      ],
      order: [
        [
          { model: User, through: { attributes: [] }, as: "members" },
          "createdAt",
          "DESC",
        ],
      ],
    });
    return res
      .status(200)
      .send({ status: true, fund_members: chit_fund ? chit_fund.members : [] });
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
      attributes: ["id", "uuid", "fund_name", "fund_amount", "total_members"],
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
    let chit_fund = await ChitFund.findOne({
      where: { id: req.body.fund_id },
      include: [
        {
          model: Auctions,
          as: "auctions",
          where: { is_done: false },
          required: false,
        },
        {
          model: User.scope("withXRPLSecret"),
          through: { attributes: [] },
          as: "members",
          required: false,
        },
      ],
    });
    if (!chit_fund) {
      throw {
        details: [{ message: "Invalid Fund" }],
      };
    }
    if (!chit_fund.fund_approved) {
      throw {
        details: [{ message: "Fund not approved" }],
      };
    }
    if (chit_fund.auctions.length > 0) {
      throw {
        details: [{ message: "Auction already started." }],
      };
    }
    let auction = await Auctions.create(req.body);
    let member_pay = parseInt(chit_fund.fund_amount) / chit_fund.total_members;
    let models_array = [];
    chit_fund.members.forEach((member) => {
      models_array.push(
        helperXRPL.sendXRP(
          member.xrpl_address,
          member.xrpl_secret,
          member_pay,
          chit_fund.xrpl_address
        )
      );
    });
    let transactions = await Promise.all(models_array);
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
      order: [["createdAt", "DESC"]],
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
  let auctions = [];
  try {
    let chit_fund = await ChitFund.findOne({
      where: {
        uuid: req.params.fund_uuid,
      },
    });
    if (chit_fund) {
      auctions = await Auctions.findAll({
        where: { fund_id: chit_fund.id, is_done: false },
        attributes: { exclude: ["createdAt", "updatedAt", "uuid"] },
        order: [["createdAt", "DESC"]],
      });
    }
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
      order: [
        [
          { model: User, through: { attributes: [] }, as: "members" },
          "createdAt",
          "DESC",
        ],
      ],
    });
    return res
      .status(200)
      .send({ status: true, fund_members: chit_fund ? chit_fund.members : [] });
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

exports.auctionFulfill = async (req, res, next) => {
  try {
    let auction = await Auctions.findOne({
      where: { uuid: req.params.auction_uuid },
      include: [
        { model: ChitFund, as: "chit_fund" },
        { model: AuctionBids, as: "bids" },
      ],
    });
    let chit_amount = auction.chit_fund.fund_amount;
    let commission_percentage = auction.chit_fund.commission_percentage;
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
