const transactionService = require('../services/transactionService');

const validateTransaction = require('../validators/transactionValidator');

const {
    emitTransactionCreated,
    emitTransactionUpdated,
    emitTransactionDeleted,
    emitSystemNotification
} = require('../services/realtimeService');


const getAllTransactions = async (req, res, next) => {
    try {
        const transactions =
            await transactionService.getAllTransactions();

        return res.status(200).json(transactions);
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

        return res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};


const createTransaction = async (req, res, next) => {
    try {
        const validation = validateTransaction(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                error: validation.message
            });
        }

        const transaction =
            await transactionService.createTransaction(req.body);

        const result = transaction.toJSON
            ? transaction.toJSON()
            : transaction;

        emitTransactionCreated(result);

        emitSystemNotification({
            type: 'success',
            message: 'В общем финансовом пространстве добавлена новая операция.',
            createdAt: new Date().toISOString()
        });

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};


const updateTransaction = async (req, res, next) => {
    try {
        const validation = validateTransaction(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                error: validation.message
            });
        }

        const id = Number(req.params.id);

        const transaction =
            await transactionService.updateTransaction(id, req.body);

        if (!transaction) {
            return res.status(404).json({
                error: 'Transaction not found'
            });
        }

        const result = transaction.toJSON
            ? transaction.toJSON()
            : transaction;

        emitTransactionUpdated(result);

        emitSystemNotification({
            type: 'info',
            message: 'Операция в общем финансовом пространстве изменена.',
            createdAt: new Date().toISOString()
        });

        return res.status(200).json(result);
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

        const result = transaction.toJSON
            ? transaction.toJSON()
            : transaction;

        emitTransactionDeleted(result);

        emitSystemNotification({
            type: 'warning',
            message: 'Операция удалена из общего финансового пространства.',
            createdAt: new Date().toISOString()
        });

        return res.status(200).json({
            message: 'Transaction deleted successfully',
            transaction: result
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