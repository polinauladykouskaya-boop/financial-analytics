const transactionService =
    require('../services/transactionService');

const validateTransaction =
    require('../validators/transactionValidator');


const getAllTransactions = async (req, res, next) => {
    try {
        const transactions =
            await transactionService.getAllTransactions();

        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};


const getTransactionById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const transaction =
            await transactionService.getTransactionById(id);

        if (!transaction) {
            return res.status(404).json({
                error: 'Transaction not found'
            });
        }

        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};


const createTransaction = async (req, res, next) => {
    try {
        const validation =
            validateTransaction(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                error: validation.message
            });
        }

        const transaction =
            await transactionService.createTransaction(
                req.body
            );

        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};


const updateTransaction = async (req, res, next) => {
    try {
        const validation =
            validateTransaction(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                error: validation.message
            });
        }

        const id = Number(req.params.id);

        const transaction =
            await transactionService.updateTransaction(
                id,
                req.body
            );

        if (!transaction) {
            return res.status(404).json({
                error: 'Transaction not found'
            });
        }

        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};


const deleteTransaction = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const transaction =
            await transactionService.deleteTransaction(id);

        if (!transaction) {
            return res.status(404).json({
                error: 'Transaction not found'
            });
        }

        res.status(200).json({
            message: 'Transaction deleted successfully',
            transaction
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
};