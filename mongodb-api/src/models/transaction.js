const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        color: {
            type: String,
            default: '#808080'
        }
    },
    {
        timestamps: false
    }
);

const noteSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false
    }
);

const transactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['INCOME', 'EXPENSE'],
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            default: '',
            trim: true
        },

        paymentMethod: {
            type: String,
            default: null
        },

        date: {
            type: Date,
            required: true
        },

        tags: {
            type: [tagSchema],
            default: []
        },

        notes: {
            type: [noteSchema],
            default: []
        }
    },
    {
        timestamps: true,
        collection: 'transactions'
    }
);

transactionSchema.index({
    date: -1
});

const Transaction = mongoose.model(
    'Transaction',
    transactionSchema
);

module.exports = Transaction;