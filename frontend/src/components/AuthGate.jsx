
import { useState } from 'react';
import App from '../App';
import AuthPage from '../pages/AuthPage';
import PasswordRecovery from '../pages/PasswordRecovery';

export default function AuthGate() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Страницы восстановления пароля доступны без авторизации.
  const currentPath = window.location.pathname;

  if (
    currentPath === '/forgot-password' ||
    currentPath === '/reset-password'
  ) {
    return <PasswordRecovery />;
  }

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <>
      <div className="session-bar">
        <span>
          Вы вошли как <strong>{user.email}</strong>
        </span>

        <button type="button" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <App />
    </>
  );
}
