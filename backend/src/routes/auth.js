const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

const authenticate = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get(
    '/profile',
    authenticate,
    userController.getProfile
);

router.post(
    '/change-password',
    authenticate,
    userController.changePassword
);

module.exports = router;