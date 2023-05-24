"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("chit_funds", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      fund_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fund_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_months: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      commission_percentage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_members: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fund_start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      min_auction_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      auction_start_date: {
        type: Sequelize.DATE,
      },
      auction_end_date: {
        type: Sequelize.DATE,
      },
      xrpl_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fund_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      fund_manager: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("chit_funds");
  },
};
