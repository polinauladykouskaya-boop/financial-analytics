const jwt = require('jsonwebtoken');

const socketAuth = (socket, next) => {
    try {
        // Получаем JWT из handshake
        const token = socket.handshake.auth?.token;

        if (!token) {
            console.log(
                '[SOCKET AUTH] Подключение отклонено: JWT отсутствует.'
            );

            return next(new Error('Требуется авторизация'));
        }

        if (!process.env.JWT_SECRET) {
            console.error(
                '[SOCKET AUTH] JWT_SECRET не настроен в переменных окружения.'
            );

            return next(new Error('Ошибка конфигурации сервера'));
        }

        // Проверяем подпись и срок действия токена
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Проверяем обязательные поля токена
        if (!decoded.id || !decoded.email) {
            console.log(
                '[SOCKET AUTH] Подключение отклонено: некорректный JWT.'
            );

            return next(new Error('Некорректный токен'));
        }

        // Сохраняем пользователя в объекте socket
        socket.user = {
            id: decoded.id,
            email: decoded.email
        };

        console.log(
            `[SOCKET AUTH] Авторизация успешна: ${decoded.email}`
        );

        next();
    } catch (error) {
        console.log(
            '[SOCKET AUTH] Подключение отклонено:',
            error.message
        );

        return next(
            new Error('Недействительный или просроченный токен')
        );
    }
};

module.exports = socketAuth;