'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'transactions',
            {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false
                },

                type: {
                    type: Sequelize.ENUM(
                        'INCOME',
                        'EXPENSE'
                    ),
                    allowNull: false
                },

                amount: {
                    type: Sequelize.DECIMAL(12, 2),
                    allowNull: false
                },

                category: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },

                description: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },

                date: {
                    type: Sequelize.DATEONLY,
                    allowNull: false
                }
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('transactions');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_transactions_type";'
        );
    }
};