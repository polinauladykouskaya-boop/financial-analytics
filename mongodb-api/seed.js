
require('dotenv').config();

const mongoose = require('mongoose');

const connectDatabase = require('./src/config/database');
const Transaction = require('./src/models/transaction');

const transactions = [
    {
        type: 'INCOME',
        amount: 3500.00,
        category: 'Salary',
        description: 'Monthly salary',
        paymentMethod: 'BANK_TRANSFER',
        date: '2026-11-01T09:00:00.000Z',
        tags: [
            { name: 'Regular income', color: '#28A745' },
            { name: 'Important', color: '#007BFF' }
        ],
        notes: [
            { text: 'Monthly salary received.' },
            { text: 'Main source of income.' }
        ]
    },
    {
        type: 'EXPENSE',
        amount: 125.50,
        category: 'Food',
        description: 'Groceries at supermarket',
        paymentMethod: 'CARD',
        date: '2026-11-02T14:30:00.000Z',
        tags: [
            { name: 'Food', color: '#FF9800' },
            { name: 'Daily expenses', color: '#808080' }
        ],
        notes: [
            { text: 'Weekly grocery shopping.' }
        ]
    },
    {
        type: 'EXPENSE',
        amount: 45.00,
        category: 'Transport',
        description: 'Public transport expenses',
        paymentMethod: 'CASH',
        date: '2026-11-03T08:15:00.000Z',
        tags: [
            { name: 'Transport', color: '#2196F3' }
        ],
        notes: []
    },
    {
        type: 'EXPENSE',
        amount: 80.00,
        category: 'Entertainment',
        description: 'Cinema tickets',
        paymentMethod: 'CARD',
        date: '2026-11-04T18:00:00.000Z',
        tags: [
            { name: 'Leisure', color: '#9C27B0' }
        ],
        notes: [
            { text: 'Entertainment expenses for the weekend.' }
        ]
    },
    {
        type: 'INCOME',
        amount: 650.00,
        category: 'Freelance',
        description: 'Freelance development project',
        paymentMethod: 'BANK_TRANSFER',
        date: '2026-11-05T12:00:00.000Z',
        tags: [
            { name: 'Additional income', color: '#28A745' },
            { name: 'Freelance', color: '#17A2B8' }
        ],
        notes: [
            { text: 'Payment for completed development work.' }
        ]
    },
    {
        type: 'EXPENSE',
        amount: 230.00,
        category: 'Shopping',
        description: 'Clothes and household purchases',
        paymentMethod: 'CARD',
        date: '2026-11-06T16:20:00.000Z',
        tags: [
            { name: 'Shopping', color: '#E91E63' }
        ],
        notes: [
            { text: 'Monthly personal purchases.' }
        ]
    },
    {
        type: 'EXPENSE',
        amount: 115.75,
        category: 'Utilities',
        description: 'Electricity and internet bills',
        paymentMethod: 'BANK_TRANSFER',
        date: '2026-11-07T10:00:00.000Z',
        tags: [
            { name: 'Bills', color: '#607D8B' },
            { name: 'Monthly', color: '#795548' }
        ],
        notes: [
            { text: 'Regular monthly utility payments.' }
        ]
    },
    {
        type: 'EXPENSE',
        amount: 60.00,
        category: 'Health',
        description: 'Pharmacy purchases',
        paymentMethod: 'CARD',
        date: '2026-11-08T11:45:00.000Z',
        tags: [
            { name: 'Health', color: '#4CAF50' }
        ],
        notes: []
    },
    {
        type: 'INCOME',
        amount: 120.00,
        category: 'Investment',
        description: 'Investment return',
        paymentMethod: 'BANK_TRANSFER',
        date: '2026-11-09T13:00:00.000Z',
        tags: [
            { name: 'Investment', color: '#3F51B5' }
        ],
        notes: [
            { text: 'Additional investment income.' }
        ]
    },
    {
        type: 'EXPENSE',
        amount: 95.00,
        category: 'Education',
        description: 'Online programming course',
        paymentMethod: 'CARD',
        date: '2026-11-10T17:30:00.000Z',
        tags: [
            { name: 'Education', color: '#673AB7' },
            { name: 'Development', color: '#009688' }
        ],
        notes: [
            { text: 'Professional development and learning.' }
        ]
    }
];

const seedDatabase = async () => {
    try {
        await connectDatabase();

        const existingCount = await Transaction.countDocuments();

        if (existingCount > 0) {
            console.log(
                `Database already contains ${existingCount} transactions.`
            );
            console.log('Seeding skipped to prevent duplicate data.');
            return;
        }

        const insertedTransactions =
            await Transaction.insertMany(transactions);

        console.log(
            `Successfully inserted ${insertedTransactions.length} transactions.`
        );

        console.log('MongoDB database has been populated.');

    } catch (error) {
        console.error('Database seeding error:', error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

seedDatabase();
