
import { useState } from 'react';
import api from '../api/client';
import '../styles/auth.css';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLogin = mode === 'login';

  const validatePassword = (value) => {
    if (value.length < 8) {
      return 'Пароль должен содержать минимум 8 символов';
    }

    if (!/[A-Z]/.test(value)) {
      return 'Добавьте хотя бы одну заглавную латинскую букву';
    }

    if (!/[a-z]/.test(value)) {
      return 'Добавьте хотя бы одну строчную латинскую букву';
    }

    if (!/[0-9]/.test(value)) {
      return 'Добавьте хотя бы одну цифру';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!isLogin) {
      const passwordError = validatePassword(password);

      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/auth/login', {
          email,
          password,
        });

        const { token, user } = response.data;

        if (!token || !user) {
          throw new Error('Сервер не вернул данные авторизации');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        onLogin(user);
      } else {
        await api.post('/auth/register', {
          email,
          password,
        });

        setSuccess(
          'Регистрация успешна. Теперь войдите в аккаунт.'
        );

        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Не удалось выполнить запрос. Проверьте подключение к серверу.'
      );
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">F</div>
          <h1>FinSight</h1>
          <p>Общее финансовое пространство</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => changeMode('login')}
          >
            Вход
          </button>

          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => changeMode('register')}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-email">
            Электронная почта
          </label>

          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@mail.com"
            autoComplete="email"
            required
          />

          <label htmlFor="auth-password">
            Пароль
          </label>

          <div className="password-input-wrap">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Не менее 8 символов"
              autoComplete={
                isLogin ? 'current-password' : 'new-password'
              }
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-visibility"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? 'Скрыть пароль' : 'Показать пароль'
              }
              title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {!isLogin && (
            <>
              <label htmlFor="auth-confirm">
                Повторите пароль
              </label>

              <div className="password-input-wrap">
                <input
                  id="auth-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-visibility"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Скрыть пароль'
                      : 'Показать пароль'
                  }
                  title={
                    showConfirmPassword
                      ? 'Скрыть пароль'
                      : 'Показать пароль'
                  }
                >
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>

              <p className="password-hint">
                Пароль должен содержать минимум 8 символов,
                заглавную и строчную латинские буквы и цифру.
              </p>
            </>
          )}

          {isLogin && (
            <a
              href="/forgot-password"
              className="forgot-password-link"
            >
              Забыли пароль?
            </a>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Подождите...'
              : isLogin
                ? 'Войти'
                : 'Создать аккаунт'}
          </button>
        </form>

        <p className="auth-footer">
          {isLogin
            ? 'Войдите, чтобы работать с общими финансовыми данными.'
            : 'Создайте аккаунт для доступа к FinSight.'}
        </p>
      </section>
    </main>
  );
}
