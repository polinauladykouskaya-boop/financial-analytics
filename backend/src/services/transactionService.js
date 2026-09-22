const Transaction =
    require('../models/transaction');


const getAllTransactions = async () => {
    return await Transaction.findAll({
        order: [['id', 'ASC']]
    });
};


const getTransactionById = async (id) => {
    return await Transaction.findByPk(id);
};


const createTransaction = async ({
    type,
    amount,
    category,
    description,
    paymentMethod,
    date
}) => {
    return await Transaction.create({
        type,
        amount,
        category,
        description: description || '',
        paymentMethod,
        date
    });
};


const updateTransaction = async (
    id,
    {
        type,
        amount,
        category,
        description,
        paymentMethod,
        date
    }
) => {
    const transaction =
        await Transaction.findByPk(id);

    if (!transaction) {
        return null;
    }

    await transaction.update({
        type,
        amount,
        category,
        description: description || '',
        paymentMethod,
        date
    });

    return transaction;
};


const deleteTransaction = async (id) => {
    const transaction =
        await Transaction.findByPk(id);

    if (!transaction) {
        return null;
    }

    await transaction.destroy();

    return transaction;
};


module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
};