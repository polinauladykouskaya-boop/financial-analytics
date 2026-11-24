require('dotenv').config();

const http = require('http');
const app = require('./src/app');

const createSocketServer = require('./src/sockets/socketServer');

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

const io = createSocketServer(httpServer);

httpServer.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
    console.log(`Socket.IO server is ready.`);
});

const shutdown = (signal) => {
    console.log(`[SERVER] Получен сигнал ${signal}. Завершение работы...`);

    io.close(() => {
        httpServer.close(() => {
            console.log('[SERVER] Сервер остановлен.');
            process.exit(0);
        });
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));