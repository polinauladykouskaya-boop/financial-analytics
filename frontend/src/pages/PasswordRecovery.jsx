
import { useState } from 'react';
import api from '../api/client';
import '../styles/recovery.css';

export default function PasswordRecovery() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = new URLSearchParams(window.location.search)
    .get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleForgotPassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email
      });

      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Не удалось отправить запрос. Попробуйте ещё раз.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password
      });

      setMessage(response.data.message);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Не удалось изменить пароль.'
      );
    } finally {
      setLoading(false);
    }
  }

  const passwordFields = (
    <>
      <label>
        Новый пароль
        <div className="password-input-wrap">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
            placeholder="Введите новый пароль"
          />
          <button
            type="button"
            className="password-visibility"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
      </label>

      <label>
        Повторите новый пароль
        <div className="password-input-wrap">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            placeholder="Повторите пароль"
          />
          <button
            type="button"
            className="password-visibility"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label={
              showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'
            }
          >
            {showConfirmPassword ? '🙈' : '👁'}
          </button>
        </div>
      </label>
    </>
  );

  return (
    <main className="recovery-page">
      <form
        className="recovery-card"
        onSubmit={
          token ? handleResetPassword : handleForgotPassword
        }
      >
        <h1>FinSight</h1>

        <h2>
          {token ? 'Новый пароль' : 'Восстановление пароля'}
        </h2>

        <p>
          {token
            ? 'Придумайте новый пароль для своего аккаунта.'
            : 'Введите email, указанный при регистрации. Мы отправим ссылку для восстановления.'}
        </p>

        {!token && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="name@example.com"
            />
          </label>
        )}

        {token && passwordFields}

        {error && <p className="recovery-error">{error}</p>}
        {message && <p className="recovery-success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? 'Подождите...'
            : token
              ? 'Сохранить новый пароль'
              : 'Отправить ссылку'}
        </button>

        <a href="/">Вернуться ко входу</a>
      </form>
    </main>
  );
}
