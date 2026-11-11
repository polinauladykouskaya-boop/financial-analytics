const mongoose = require('mongoose');

const Transaction = require('../models/transaction');

const allowedFields = [
    'type',
    'amount',
    'category',
    'description',
    'paymentMethod',
    'date'
];

const getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find()
            .sort({ date: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

const getTransactionById = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(
            req.params.id
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

const createTransaction = async (req, res, next) => {
    try {
        const transactionData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                transactionData[field] = req.body[field];
            }
        }

        const transaction = new Transaction(
            transactionData
        );

        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

const updateTransaction = async (req, res, next) => {
    try {
        const updateData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        const transaction =
            await Transaction.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
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
        const transaction =
            await Transaction.findByIdAndDelete(
                req.params.id
            );

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

// Добавление вложенного тега
const addTag = async (req, res, next) => {
    try {
        const transaction =
            await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                error: 'Transaction not found'
            });
        }

        transaction.tags.push({
            name: req.body.name,
            color: req.body.color
        });

        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

// Изменение вложенного тега
const updateTag = async (req, res, next) => {
    try {
        const { id, tagId } = req.params;

        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(tagId)
        ) {
            return res.status(400).json({
                error: 'Invalid transaction or tag ID'
            });
        }

        const updateData = {};

        if (req.body.name !== undefined) {
            updateData['tags.$.name'] = req.body.name;
        }

        if (req.body.color !== undefined) {
            updateData['tags.$.color'] = req.body.color;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: 'No tag fields provided'
            });
        }

        const transaction =
            await Transaction.findOneAndUpdate(
                {
                    _id: id,
                    'tags._id': tagId
                },
                {
                    $set: updateData
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!transaction) {
            return res.status(404).json({
                error: 'Transaction or tag not found'
            });
        }

        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

// Удаление вложенного тега
const deleteTag = async (req, res, next) => {
    try {
        const { id, tagId } = req.params;

        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(tagId)
        ) {
            return res.status(400).json({
                error: 'Invalid transaction or tag ID'
            });
        }

        const transaction =
            await Transaction.findByIdAndUpdate(
                id,
                {
                    $pull: {
                        tags: {
                            _id: tagId
                        }
                    }
                },
                {
                    new: true
                }
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

// Добавление вложенной заметки
const addNote = async (req, res, next) => {
    try {
        const transaction =
            await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                error: 'Transaction not found'
            });
        }

        transaction.notes.push({
            text: req.body.text
        });

        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    addTag,
    updateTag,
    deleteTag,
    addNote
};