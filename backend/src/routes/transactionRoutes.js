
const express = require('express');

const router = express.Router();

const transactionController = require('../controllers/transactionController');
const authenticate = require('../middleware/auth');

// Все операции доступны только авторизованным пользователям.
router.use(authenticate);

router.get('/', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
