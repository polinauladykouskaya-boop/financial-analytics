const express = require('express');

const router = express.Router();

const transactionController =
    require('../controllers/transactionController');

// Основные CRUD-маршруты

router.get(
    '/',
    transactionController.getAllTransactions
);

router.get(
    '/:id',
    transactionController.getTransactionById
);

router.post(
    '/',
    transactionController.createTransaction
);

router.put(
    '/:id',
    transactionController.updateTransaction
);

router.delete(
    '/:id',
    transactionController.deleteTransaction
);

// Маршруты для вложенных тегов

router.post(
    '/:id/tags',
    transactionController.addTag
);

router.patch(
    '/:id/tags/:tagId',
    transactionController.updateTag
);

router.delete(
    '/:id/tags/:tagId',
    transactionController.deleteTag
);

// Маршрут для вложенных заметок

router.post(
    '/:id/notes',
    transactionController.addNote
);

module.exports = router;