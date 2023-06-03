"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("auction_summaries", {
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
      fund_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      auction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_fund_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_members: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      monthly_chit_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agent_commission_percentage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      auction_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      winner_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agent_commission_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_dividend_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dividend_per_member: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("auction_summaries");
  },
};
