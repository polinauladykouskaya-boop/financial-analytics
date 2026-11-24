
import { useCallback, useEffect, useRef, useState } from 'react';
import { createRealtimeSocket } from '../sockets/socket';

export function useRealtime(onTransactionsChanged) {
  const [status, setStatus] = useState('connecting');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [socketError, setSocketError] = useState('');

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = createRealtimeSocket();

    if (!socket) {
      setStatus('unauthorized');
      setSocketError('Для подключения необходимо войти в систему.');
      return undefined;
    }

    socketRef.current = socket;

    const handleConnect = () => {
      setStatus('connected');
      setSocketError('');

      // Получаем актуальные данные после подключения
      // или восстановления соединения.
      onTransactionsChanged();
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
    };

    const handleConnectError = (error) => {
      setStatus('error');
      setSocketError(
        error.message || 'Не удалось подключиться к серверу.'
      );
    };

    const handlePresence = (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    };

    const handleNotification = (data) => {
      setNotification({
        ...data,
        receivedAt: new Date().toISOString(),
      });
    };

    const handleTransactionChanged = () => {
      onTransactionsChanged();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    socket.on('presence:updated', handlePresence);
    socket.on('system:notification', handleNotification);

    socket.on('transaction:created', handleTransactionChanged);
    socket.on('transaction:updated', handleTransactionChanged);
    socket.on('transaction:deleted', handleTransactionChanged);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);

      socket.off('presence:updated', handlePresence);
      socket.off('system:notification', handleNotification);

      socket.off('transaction:created', handleTransactionChanged);
      socket.off('transaction:updated', handleTransactionChanged);
      socket.off('transaction:deleted', handleTransactionChanged);

      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [onTransactionsChanged]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Запрос проверки связи с подтверждением от сервера.
  const requestRefresh = useCallback(() => {
    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      const result = {
        success: false,
        message: 'Нет подключения к серверу Socket.IO.',
      };

      setSocketError(result.message);
      return Promise.resolve(result);
    }

    return new Promise((resolve) => {
      socket.timeout(5000).emit(
        'financial:refresh',
        {},
        async (error, response) => {
          if (error) {
            const result = {
              success: false,
              message: 'Сервер не подтвердил запрос синхронизации.',
            };

            setSocketError(result.message);
            resolve(result);
            return;
          }

          if (!response?.success) {
            const result = {
              success: false,
              message: response?.message || 'Сервер отклонил запрос.',
            };

            setSocketError(result.message);
            resolve(result);
            return;
          }

          setSocketError('');

          // После подтверждения запрашиваем актуальные данные через REST.
          try {
            await onTransactionsChanged();

            resolve({
              success: true,
              message: 'Связь с сервером установлена. Данные синхронизированы.',
            });
          } catch {
            resolve({
              success: false,
              message: 'Связь установлена, но не удалось обновить данные.',
            });
          }
        }
      );
    });
  }, [onTransactionsChanged]);

  return {
    status,
    onlineUsers,
    notification,
    socketError,
    clearNotification,
    requestRefresh,
  };
}
