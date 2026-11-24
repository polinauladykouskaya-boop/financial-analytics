let io = null;

const FINANCIAL_ROOM = 'financial-space';

const initializeRealtime = (socketServer) => {
    io = socketServer;
};

const emitTransactionCreated = (transaction) => {
    if (!io) return;

    io.to(FINANCIAL_ROOM).emit(
        'transaction:created',
        transaction
    );
};

const emitTransactionUpdated = (transaction) => {
    if (!io) return;

    io.to(FINANCIAL_ROOM).emit(
        'transaction:updated',
        transaction
    );
};

const emitTransactionDeleted = (transaction) => {
    if (!io) return;

    io.to(FINANCIAL_ROOM).emit(
        'transaction:deleted',
        {
            id: transaction.id
        }
    );
};

const emitSystemNotification = (notification) => {
    if (!io) return;

    io.to(FINANCIAL_ROOM).emit(
        'system:notification',
        notification
    );
};

module.exports = {
    initializeRealtime,
    emitTransactionCreated,
    emitTransactionUpdated,
    emitTransactionDeleted,
    emitSystemNotification
};