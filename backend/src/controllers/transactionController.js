const transactionService =
    require('../services/transactionService');

const validateTransaction =
    require('../validators/transactionValidator');


const getAllTransactions = (req, res) => {
    const transactions =
        transactionService.getAllTransactions();

    res.status(200).json(transactions);
};


const getTransactionById = (req, res) => {
    const id = Number(req.params.id);

    const transaction =
        transactionService.getTransactionById(id);

    if (!transaction) {
        return res.status(404).json({
            error: 'Transaction not found'
        });
    }

    res.status(200).json(transaction);
};


const createTransaction = (req, res) => {
    const validation =
        validateTransaction(req.body);

    if (!validation.valid) {
        return res.status(400).json({
            error: validation.message
        });
    }

    const transaction =
        transactionService.createTransaction(
            req.body
        );

    res.status(201).json(transaction);
};


const updateTransaction = (req, res) => {
    const validation =
        validateTransaction(req.body);

    if (!validation.valid) {
        return res.status(400).json({
            error: validation.message
        });
    }

    const id = Number(req.params.id);

    const transaction =
        transactionService.updateTransaction(
            id,
            req.body
        );

    if (!transaction) {
        return res.status(404).json({
            error: 'Transaction not found'
        });
    }

    res.status(200).json(transaction);
};


const deleteTransaction = (req, res) => {
    const id = Number(req.params.id);

    const transaction =
        transactionService.deleteTransaction(id);

    if (!transaction) {
        return res.status(404).json({
            error: 'Transaction not found'
        });
    }

    res.status(200).json({
        message: 'Transaction deleted successfully',
        transaction
    });
};


module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
};