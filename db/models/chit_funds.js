"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
module.exports = (sequelize, DataTypes) => {
  class chit_funds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      chit_funds.belongsToMany(models.users, {
        through: models.fund_members,
        as: "members",
        foreignKey: "fund_id",
      });
      chit_funds.hasMany(models.auctions, {
        as: "auctions",
        foreignKey: "fund_id",
      });
    }
  }
  chit_funds.init(
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      fund_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fund_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_months: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      commission_percentage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fund_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      min_auction_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      auction_start_date: {
        type: DataTypes.DATE,
      },
      auction_end_date: {
        type: DataTypes.DATE,
      },
      xrpl_address: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      xrpl_secret: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      fund_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fund_manager: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ["xrpl_secret"] },
      },
      scopes: {
        withXRPLSecret: {
          attributes: {},
        },
      },
      sequelize,
      modelName: "chit_funds",
    }
  );
  return chit_funds;
};
