const log = require("../logger");
const xrpl = require("xrpl");
const helperXRPL = require("../helpers/xrpl");
const { sequelize, Sequelize } = require("../db/models");
const ChitFund = require("../db/models").chit_funds;
const User = require("../db/models").users;
const FundMembers = require("../db/models").fund_members;
const Auctions = require("../db/models").auctions;
const AuctionBids = require("../db/models").auction_bids;
const AuctionSummary = require("../db/models").auction_summary;
const AuctionSettlements = require("../db/models").auction_settlements;

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
          // where: { is_done: false },
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
      include: [
        { model: ChitFund, as: "chit_fund" },
        {
          model: AuctionSummary,
          as: "auction_summary",
          attributes: ["id", "uuid"],
        },
      ],
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
    if (!req.query.fund_id) {
      throw {
        details: [{ message: "Please select a fund." }],
      };
    }
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
    let chit_fund = await ChitFund.findOne({
      where: { id: req.query.fund_id },
    });
    let bids = await AuctionBids.findAll(query);
    return res.status(200).send({ status: true, bids, chit_fund });
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
        {
          model: ChitFund,
          as: "chit_fund",
          include: [
            {
              model: User,
              through: { attributes: [] },
              as: "members",
              required: false,
            },
          ],
        },
        { model: AuctionBids, as: "bids" },
      ],
      order: [[{ model: AuctionBids, as: "bids" }, "createdAt", "desc"]],
    });
    if (auction && (auction.is_done || auction.auction_settled)) {
      throw { details: [{ message: "Auction already ended." }] };
    }
    let chit_amount = parseInt(auction.chit_fund.fund_amount);
    let commission_percentage = parseInt(
      auction.chit_fund.commission_percentage
    );
    let max_bid_user = auction.bids.reduce((prev, current) =>
      parseInt(prev.bid_amount) > parseInt(current.bid_amount) ? prev : current
    );
    let auction_amount = parseInt(max_bid_user.bid_amount);
    let winner_amount = chit_amount - auction_amount;
    let agent_commission_amount =
      (auction_amount * commission_percentage) / 100;
    let total_dividend_amount = auction_amount - agent_commission_amount;
    let dividend_per_member =
      total_dividend_amount / (auction.chit_fund.total_members - 1);
    let auction_summary = await AuctionSummary.create({
      fund_id: auction.chit_fund.id,
      auction_id: auction.id,
      total_fund_amount: auction.chit_fund.fund_amount,
      total_members: auction.chit_fund.total_members,
      monthly_chit_amount:
        parseInt(auction.chit_fund.fund_amount) /
        auction.chit_fund.total_members,
      agent_commission_percentage: auction.chit_fund.commission_percentage,
      auction_amount,
      winner_amount,
      agent_commission_amount,
      total_dividend_amount,
      dividend_per_member,
    });
    await Auctions.update({ is_done: true }, { where: { id: auction.id } });
    let auction_settlements = auction.chit_fund.members.map((member) => {
      return {
        fund_id: auction.fund_id,
        auction_id: auction.id,
        user_id: member.id,
        is_winner: max_bid_user.user_id == member.id,
        received_amount:
          max_bid_user.user_id == member.id
            ? winner_amount
            : dividend_per_member,
      };
    });
    await AuctionSettlements.bulkCreate(auction_settlements);
    auction_summary = await AuctionSummary.findOne({
      where: { id: auction_summary.id },
      include: [
        { model: ChitFund, as: "chit_fund" },
        {
          model: Auctions,
          as: "auction",
          include: [
            {
              model: AuctionSettlements,
              as: "auction_settlements",
              include: [{ model: User, as: "member" }],
            },
          ],
        },
      ],
    });
    return res.status(200).send({ status: true, auction_summary });
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

exports.auctionSettle = async (req, res, next) => {
  try {
    let auction = await Auctions.findOne({
      where: { uuid: req.params.auction_uuid },
      include: [
        { model: ChitFund.scope("withXRPLSecret"), as: "chit_fund" },
        {
          model: AuctionSettlements,
          as: "auction_settlements",
          include: [{ model: User, as: "member" }],
        },
      ],
    });
    let models_array = [],
      result_array = [];
    auction.auction_settlements.forEach(async (settle_obj) => {
      models_array.push({
        sender: auction.chit_fund.xrpl_address,
        secret: auction.chit_fund.xrpl_secret,
        amount: settle_obj.received_amount,
        destination: settle_obj.member.xrpl_address,
      });
    });
    // Sequential promise
    const starterPromise = Promise.resolve(null);
    await models_array.reduce(
      (p, spec) =>
        p.then(() =>
          helperXRPL
            .sendXRP(spec.sender, spec.secret, spec.amount, spec.destination)
            .then((result) => result_array.push(result))
        ),
      starterPromise
    );
    let auction_update = await Auctions.update(
      { auction_settled: true },
      { where: { uuid: req.params.auction_uuid } }
    );
    if (auction_update[0]) {
      auction.auction_settled = true;
    }
    return res.status(200).send({ status: true, auction, result_array });
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

exports.auctionSummary = async (req, res, next) => {
  try {
    let auction_summary = await AuctionSummary.findOne({
      where: { uuid: req.params.summary_uuid },
      include: [
        { model: ChitFund, as: "chit_fund" },
        {
          model: Auctions,
          as: "auction",
          include: [
            {
              model: AuctionSettlements,
              as: "auction_settlements",
              include: [{ model: User, as: "member" }],
            },
          ],
        },
      ],
    });
    return res.status(200).send({ status: true, auction_summary });
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
