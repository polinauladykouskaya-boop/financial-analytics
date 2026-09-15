const Transaction = require('../models/transactionModel');
const transactions = require('../data/transactions');

const getAllTransactions = () => {
    return transactions;
};

const getTransactionById = (id) => {
    return transactions.find(
        transaction => transaction.id === id
    );
};

const createTransaction = ({
    type,
    amount,
    category,
    description,
    date
}) => {
    const newId =
        transactions.length > 0
            ? Math.max(
                ...transactions.map(
                    transaction => transaction.id
                )
            ) + 1
            : 1;

    const transaction = new Transaction(
        newId,
        type,
        amount,
        category,
        description || '',
        date
    );

    transactions.push(transaction);

    return transaction;
};

const updateTransaction = (
    id,
    {
        type,
        amount,
        category,
        description,
        date
    }
) => {
    const transaction =
        getTransactionById(id);

    if (!transaction) {
        return null;
    }

    transaction.type = type;
    transaction.amount = amount;
    transaction.category = category;
    transaction.description = description || '';
    transaction.date = date;

    return transaction;
};

const deleteTransaction = (id) => {
    const index =
        transactions.findIndex(
            transaction => transaction.id === id
        );

    if (index === -1) {
        return null;
    }

    return transactions.splice(index, 1)[0];
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
};