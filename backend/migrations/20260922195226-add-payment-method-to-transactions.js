'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'transactions',
            'paymentMethod',
            {
                type: Sequelize.STRING(30),
                allowNull: true
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            'transactions',
            'paymentMethod'
        );
    }
};