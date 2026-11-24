const { Server } = require('socket.io');
const socketAuth = require('./socketAuth');

const {
    initializeRealtime
} = require('../services/realtimeService');

const FINANCIAL_ROOM = 'financial-space';

const onlineUsers = new Map();

const MAX_EVENTS_PER_WINDOW = 30;
const RATE_LIMIT_WINDOW_MS = 10000;

const createSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        },

        maxHttpBufferSize: 1e6,

        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: false
        }
    });

    initializeRealtime(io);

    // Проверка JWT перед подключением клиента
    io.use(socketAuth);

    io.on('connection', (socket) => {
        const user = socket.user;
        const userId = String(user.id);

        console.log(
            `[SOCKET] Пользователь ${user.email} подключился: ${socket.id}`
        );

        // Подключаем пользователя к общему финансовому пространству
        socket.join(FINANCIAL_ROOM);

        // Обновляем список подключённых пользователей
        const existingUser = onlineUsers.get(userId);

        if (existingUser) {
            existingUser.connections += 1;
            existingUser.email = user.email;
        } else {
            onlineUsers.set(userId, {
                id: user.id,
                email: user.email,
                connections: 1
            });
        }

        const getOnlineUsers = () => {
            return Array.from(onlineUsers.values()).map((item) => ({
                id: item.id,
                email: item.email
            }));
        };

        const broadcastPresence = () => {
            io.to(FINANCIAL_ROOM).emit(
                'presence:updated',
                getOnlineUsers()
            );
        };

        broadcastPresence();

        // Уведомление о подключении
        socket.emit('system:notification', {
            type: 'success',
            message: 'Вы подключились к общему финансовому пространству.',
            createdAt: new Date().toISOString()
        });

        // Ограничение частоты запросов синхронизации
        let eventCount = 0;
        let windowStartedAt = Date.now();

        const checkRateLimit = () => {
            const now = Date.now();

            if (now - windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
                eventCount = 0;
                windowStartedAt = now;
            }

            eventCount += 1;

            return eventCount <= MAX_EVENTS_PER_WINDOW;
        };

        // Проверка связи с сервером
        socket.on('client:ping', (callback) => {
            if (typeof callback !== 'function') {
                return;
            }

            callback({
                success: true,
                serverTime: new Date().toISOString()
            });
        });

        // Запрос на синхронизацию финансовых данных
        socket.on('financial:refresh', (data, callback) => {
            console.log(
                `[SOCKET] Получен financial:refresh от ${user.email}`
            );

            if (!checkRateLimit()) {
                console.log('[SOCKET] Превышен лимит запросов синхронизации.');

                if (typeof callback === 'function') {
                    callback({
                        success: false,
                        message: 'Слишком много запросов. Повторите позже.'
                    });
                }

                return;
            }

            if (typeof callback !== 'function') {
                console.log(
                    '[SOCKET] Не передан callback подтверждения.'
                );

                return;
            }

            // Подтверждаем получение запроса клиенту
            callback({
                success: true,
                message: 'Сервер получил запрос синхронизации.',
                serverTime: new Date().toISOString()
            });

            console.log(
                '[SOCKET] Подтверждение синхронизации отправлено клиенту.'
            );

            // Уведомляем остальных пользователей пространства
            socket.to(FINANCIAL_ROOM).emit(
                'system:notification',
                {
                    type: 'info',
                    message: `${user.email} запросил обновление финансовых данных.`,
                    createdAt: new Date().toISOString()
                }
            );
        });

        // Отключение пользователя
        socket.on('disconnect', (reason) => {
            console.log(
                `[SOCKET] Пользователь ${user.email} отключился: ${reason}`
            );

            const currentUser = onlineUsers.get(userId);

            if (currentUser) {
                currentUser.connections -= 1;

                // Удаляем пользователя только если закрыты все его подключения
                if (currentUser.connections <= 0) {
                    onlineUsers.delete(userId);
                }
            }

            broadcastPresence();
        });
    });

    return io;
};

module.exports = createSocketServer;