"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class auction_bids extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      auction_bids.belongsTo(models.chit_funds, {
        as: "chit_fund",
        foreignKey: "fund_id",
      });
      auction_bids.belongsTo(models.auctions, {
        as: "auction",
        foreignKey: "auction_id",
      });
      auction_bids.belongsTo(models.users, {
        as: "member",
        foreignKey: "user_id",
      });
    }
  }
  auction_bids.init(
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
      auction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bid_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_winner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      received_amount: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
    },
    {
      sequelize,
      modelName: "auction_bids",
    }
  );
  return auction_bids;
};
