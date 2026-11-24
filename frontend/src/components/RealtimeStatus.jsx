
import { useState } from 'react';
import './RealtimeStatus.css';

function RealtimeStatus({
  status,
  onlineUsers,
  socketError,
  onRefresh,
}) {
  const [refreshMessage, setRefreshMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusLabels = {
    connecting: 'Подключение...',
    connected: 'В реальном времени',
    disconnected: 'Соединение потеряно',
    error: 'Ошибка соединения',
    unauthorized: 'Требуется вход',
  };

  const statusClass = {
    connecting: 'realtime-connecting',
    connected: 'realtime-connected',
    disconnected: 'realtime-disconnected',
    error: 'realtime-error',
    unauthorized: 'realtime-error',
  };

  async function handleRefresh() {
    if (isRefreshing || typeof onRefresh !== 'function') {
      return;
    }

    setIsRefreshing(true);
    setRefreshMessage('');

    try {
      const result = await onRefresh();

      setRefreshMessage(
        result?.message ||
          (result?.success
            ? 'Запрос подтверждён.'
            : 'Запрос не выполнен.')
      );
    } catch (error) {
      console.error('[REALTIME] Ошибка проверки связи:', error);
      setRefreshMessage('Не удалось выполнить запрос.');
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="realtime-panel">
      <div className="realtime-status">
        <span
          className={`realtime-indicator ${statusClass[status] || ''}`}
        />

        <span className="realtime-status-label">
          {statusLabels[status] || 'Неизвестное состояние'}
        </span>
      </div>

      <div className="realtime-users">
        <span className="realtime-users-icon">●</span>

        <span>
          Онлайн: <strong>{onlineUsers.length}</strong>
        </span>
      </div>

      <button
        type="button"
        className="secondary-button"
        onClick={handleRefresh}
        disabled={status !== 'connected' || isRefreshing}
      >
        {isRefreshing ? 'Проверка...' : 'Проверить связь'}
      </button>

      {refreshMessage && (
        <span
          className="realtime-refresh-message"
          role="status"
        >
          {refreshMessage}
        </span>
      )}

      {socketError && (
        <div className="realtime-error-message" role="status">
          {socketError}
        </div>
      )}
    </div>
  );
}

export default RealtimeStatus;
