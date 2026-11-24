const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');

const {
    sendPasswordResetEmail
} = require('../services/emailService');


const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: 'Пароль должен содержать минимум 8 символов'
            });
        }

        if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            return res.status(400).json({
                error: 'Пароль должен содержать заглавную и строчную буквы, а также цифру'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            where: { email: normalizedEmail }
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'Email is already registered'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: normalizedEmail,
            passwordHash
        });

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                error: 'Email is already registered'
            });
        }

        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            where: { email: normalizedEmail }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const passwordIsValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordIsValid) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};


const forgotPassword = async (req, res, next) => {
    console.log('[PASSWORD RESET] Получен запрос на восстановление пароля.');

    try {
        const { email } = req.body;

        if (typeof email !== 'string' || !email.trim()) {
            console.log('[PASSWORD RESET] Email не передан или имеет неверный формат.');

            return res.status(400).json({
                error: 'Введите email'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        console.log('[PASSWORD RESET] Выполняется поиск пользователя.');

        const user = await User.findOne({
            where: { email: normalizedEmail }
        });

        if (!user) {
            console.log('[PASSWORD RESET] Пользователь с таким email не найден.');

            return res.status(200).json({
                message: 'Если аккаунт существует, письмо для восстановления будет отправлено.'
            });
        }

        console.log('[PASSWORD RESET] Пользователь найден.');

        const resetToken = crypto.randomBytes(32).toString('hex');

        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await user.update({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: expiresAt
        });

        console.log('[PASSWORD RESET] Токен восстановления сохранён.');

        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
            throw new Error('FRONTEND_URL is not configured');
        }

        const resetUrl =
            `${frontendUrl}/reset-password?token=${resetToken}`;

        console.log('[PASSWORD RESET] Подготовлена ссылка восстановления.');
        console.log('[PASSWORD RESET] Запускается отправка письма.');

        try {
            const emailResult = await sendPasswordResetEmail(
                user.email,
                resetUrl
            );

            console.log('[PASSWORD RESET] Отправка завершена.');
            console.log('[PASSWORD RESET] Message ID:', emailResult.messageId);
            console.log('[PASSWORD RESET] Accepted:', emailResult.accepted);
            console.log('[PASSWORD RESET] Rejected:', emailResult.rejected);
        } catch (emailError) {
            console.error('[PASSWORD RESET] Ошибка отправки письма:');
            console.error(emailError);

            await user.update({
                resetPasswordToken: null,
                resetPasswordExpires: null
            });

            throw emailError;
        }

        return res.status(200).json({
            message: 'Если аккаунт существует, письмо для восстановления будет отправлено.'
        });
    } catch (error) {
        console.error('[PASSWORD RESET] Ошибка обработки запроса:');
        console.error(error);

        next(error);
    }
};


const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (
            typeof token !== 'string' ||
            !token ||
            typeof password !== 'string' ||
            !password
        ) {
            return res.status(400).json({
                error: 'Токен и новый пароль обязательны'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: 'Пароль должен содержать минимум 8 символов'
            });
        }

        if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            return res.status(400).json({
                error: 'Пароль должен содержать заглавную и строчную буквы, а также цифру'
            });
        }

        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken: resetTokenHash
            }
        });

        if (
            !user ||
            !user.resetPasswordExpires ||
            new Date(user.resetPasswordExpires).getTime() <= Date.now()
        ) {
            return res.status(400).json({
                error: 'Ссылка недействительна или срок её действия истёк'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await user.update({
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        return res.status(200).json({
            message: 'Пароль успешно изменён. Теперь войдите с новым паролем.'
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};