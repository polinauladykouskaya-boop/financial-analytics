'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'transactions',
            [
                {
                    type: 'INCOME',
                    amount: 150000,
                    category: 'Зарплата',
                    description: 'Заработная плата',
                    paymentMethod: 'BANK_TRANSFER',
                    date: '2026-09-01'
                },

                {
                    type: 'EXPENSE',
                    amount: 15000,
                    category: 'Продукты',
                    description: 'Покупка продуктов',
                    paymentMethod: 'CARD',
                    date: '2026-09-02'
                },

                {
                    type: 'EXPENSE',
                    amount: 8000,
                    category: 'Транспорт',
                    description: 'Транспортные расходы',
                    paymentMethod: 'CARD',
                    date: '2026-09-03'
                },

                {
                    type: 'EXPENSE',
                    amount: 5000,
                    category: 'Рестораны',
                    description: 'Ужин',
                    paymentMethod: 'CARD',
                    date: '2026-09-04'
                }
            ]
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete(
            'transactions',
            null,
            {}
        );
    }
};