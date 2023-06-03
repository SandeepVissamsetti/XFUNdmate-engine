"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class auction_summary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      auction_summary.belongsTo(models.chit_funds, {
        as: "chit_fund",
        foreignKey: "fund_id",
      });
      auction_summary.belongsTo(models.auctions, {
        as: "auctions",
        foreignKey: "auction_id",
      });
    }
  }
  auction_summary.init(
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
      total_fund_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      monthly_chit_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agent_commission_percentage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      auction_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      winner_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agent_commission_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_dividend_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dividend_per_member: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "auction_summary",
    }
  );
  return auction_summary;
};
