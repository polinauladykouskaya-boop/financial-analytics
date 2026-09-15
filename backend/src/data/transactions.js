const Transaction = require('../models/transactionModel');

const transactions = [
    new Transaction(
        1,
        'INCOME',
        150000,
        'Зарплата',
        'Заработная плата',
        '2026-09-01'
    ),

    new Transaction(
        2,
        'EXPENSE',
        15000,
        'Продукты',
        'Покупка продуктов',
        '2026-09-02'
    ),

    new Transaction(
        3,
        'EXPENSE',
        8000,
        'Транспорт',
        'Транспортные расходы',
        '2026-09-03'
    )
];

module.exports = transactions;