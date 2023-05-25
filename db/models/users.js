"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users.belongsToMany(models.chit_funds, {
        through: models.fund_members,
        as: "chit_funds",
        foreignKey: "user_id",
      });
    }
  }
  users.init(
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
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
      modelName: "users",
    }
  );
  return users;
};
