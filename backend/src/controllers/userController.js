const User = require('../models/user');

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const bcrypt = require('bcrypt');

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (
            typeof oldPassword !== 'string' ||
            typeof newPassword !== 'string' ||
            !oldPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                error: 'Old and new passwords are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'New password must contain at least 8 characters'
            });
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const isOldPasswordValid = await bcrypt.compare(
            oldPassword,
            user.passwordHash
        );

        if (!isOldPasswordValid) {
            return res.status(400).json({
                error: 'Old password is incorrect'
            });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await user.update({ passwordHash });

        return res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    changePassword
};