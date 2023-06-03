"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class auctions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      auctions.belongsTo(models.chit_funds, {
        as: "chit_fund",
        foreignKey: "fund_id",
      });
      auctions.hasMany(models.auction_bids, {
        as: "bids",
        foreignKey: "auction_id",
      });
      auctions.hasOne(models.auction_summary, {
        as: "auction_summary",
        foreignKey: "auction_id",
      });
    }
  }
  auctions.init(
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      fund_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      auction_start_date: {
        type: DataTypes.DATE,
      },
      auction_end_date: {
        type: DataTypes.DATE,
      },
      is_done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      auction_settled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "auctions",
    }
  );
  return auctions;
};
