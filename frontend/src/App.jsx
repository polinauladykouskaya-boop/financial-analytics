import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './api/transactions'

const EMPTY_FORM = {
  type: 'EXPENSE',
  amount: '',
  category: 'Продукты',
  description: '',
  paymentMethod: 'CARD',
  date: new Date().toISOString().slice(0, 10),
}

const CATEGORIES = [
  'Продукты',
  'Транспорт',
  'Жильё',
  'Рестораны',
  'Развлечения',
  'Здоровье',
  'Покупки',
  'Зарплата',
  'Работа',
  'Образование',
  'Другое',
]

const PAYMENT_METHODS = [
  { value: 'CARD', label: 'Банковская карта' },
  { value: 'CASH', label: 'Наличные' },
  { value: 'BANK_TRANSFER', label: 'Банковский перевод' },
  { value: 'OTHER', label: 'Другое' },
]

const CHART_COLORS = [
  '#34d399',
  '#60a5fa',
  '#a78bfa',
  '#fbbf24',
  '#fb7185',
  '#22d3ee',
  '#f97316',
  '#818cf8',
  '#4ade80',
  '#e879f9',
]

function normalizeTransaction(item) {
  return {
    id: item.id,
    type: String(item.type).toUpperCase(),
    amount: Number(item.amount),
    category: item.category || 'Другое',
    description: item.description || '',
    paymentMethod: item.paymentMethod || '',
    date: String(item.date).slice(0, 10),
  }
}

function toApiTransaction(form) {
  return {
    type: form.type,
    amount: Number(form.amount),
    category: form.category,
    description: form.description.trim() || null,
    paymentMethod: form.paymentMethod || null,
    date: form.date,
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return ''

  const date = new Date(`${value}T12:00:00`)

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function paymentMethodLabel(value) {
  return PAYMENT_METHODS.find((item) => item.value === value)?.label || ''
}

function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.response?.status === 401) {
    return 'Требуется авторизация. Проверьте вход в систему.'
  }

  if (error.response?.status === 400) {
    return 'Проверьте правильность заполнения полей.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'Сервер слишком долго отвечает. Попробуйте ещё раз.'
  }

  if (!error.response) {
    return 'Не удалось связаться с сервером. Проверьте, запущен ли backend.'
  }

  return 'Не удалось выполнить операцию. Попробуйте ещё раз.'
}

function Icon({ name, size = 20 }) {
  const paths = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    transactions: (
      <>
        <path d="M4 7h15" />
        <path d="m15 3 4 4-4 4" />
        <path d="M20 17H5" />
        <path d="m9 13-4 4 4 4" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 9h18" />
        <path d="M16 14h2" />
      </>
    ),
    up: (
      <>
        <path d="M12 20V4" />
        <path d="m5 11 7-7 7 7" />
      </>
    ),
    down: (
      <>
        <path d="M12 4v16" />
        <path d="m5 13 7 7 7-7" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    edit: (
      <>
        <path d="m15 5 4 4" />
        <path d="m4 20 4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6M14 11v6" />
        <path d="m5 7 1 14h12l1-14" />
        <path d="M9 7V4h6v3" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 18 6l2 6" />
        <path d="M18.5 15A7 7 0 0 1 6 18l-2-6" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.wallet}
    </svg>
  )
}

function App() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('success')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [theme, setTheme] = useState(
    () => localStorage.getItem('financial-theme') || 'light',
  )

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true)

      const data = await getTransactions()

      if (!Array.isArray(data)) {
        throw new Error('Сервер вернул неожиданный формат данных')
      }

      setTransactions(data.map(normalizeTransaction))
      setNotice('')
    } catch (error) {
      console.error('Ошибка загрузки операций:', error)
      setNotice(getErrorMessage(error))
      setNoticeType('error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const retryLoadTransactions = useCallback(async () => {
    setIsRetrying(true)
    try {
      await loadTransactions()
    } finally {
      setIsRetrying(false)
    }
  }, [loadTransactions])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('financial-theme', theme)
  }, [theme])

  const income = useMemo(
    () =>
      transactions
        .filter((item) => item.type === 'INCOME')
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions],
  )

  const expenses = useMemo(
    () =>
      transactions
        .filter((item) => item.type === 'EXPENSE')
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions],
  )

  const balance = income - expenses

  // Распределение всех расходов по категориям
  const categoryBreakdown = useMemo(() => {
    const totals = transactions
      .filter((item) => item.type === 'EXPENSE')
      .reduce((result, item) => {
        const category = item.category || 'Другое'
        result[category] = (result[category] || 0) + item.amount
        return result
      }, {})

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: expenses > 0 ? (amount / expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, expenses])

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return transactions
      .filter((item) => {
        const matchesSearch =
          item.category.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)

        const matchesType =
          filterType === 'ALL' || item.type === filterType

        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        if (sortBy === 'OLDEST') {
          return a.date.localeCompare(b.date)
        }

        if (sortBy === 'AMOUNT_HIGH') {
          return b.amount - a.amount
        }

        if (sortBy === 'AMOUNT_LOW') {
          return a.amount - b.amount
        }

        return b.date.localeCompare(a.date)
      })
  }, [transactions, search, filterType, sortBy])

  function resetForm() {
    setForm({ ...EMPTY_FORM })
    setEditingId(null)
  }

  function showError(error) {
    console.error('Ошибка операции:', error)
    setNotice(getErrorMessage(error))
    setNoticeType('error')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const amount = Number(form.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice('Введите сумму больше нуля.')
      setNoticeType('error')
      return
    }

    if (!form.category || !form.date) {
      setNotice('Заполните категорию и дату операции.')
      setNoticeType('error')
      return
    }

    const payload = toApiTransaction(form)
    const currentEditingId = editingId
    const previousTransactions = [...transactions]
    const temporaryId = `temp-${Date.now()}`

    const optimisticTransaction = normalizeTransaction({
      ...payload,
      id: currentEditingId ?? temporaryId,
    })

    try {
      setIsSaving(true)
      setNotice('')

      if (currentEditingId !== null) {
        setTransactions((current) =>
          current.map((item) =>
            item.id === currentEditingId ? optimisticTransaction : item,
          ),
        )

        await updateTransaction(currentEditingId, payload)
        setNotice('Операция успешно обновлена.')
      } else {
        setTransactions((current) => [optimisticTransaction, ...current])

        await createTransaction(payload)
        setNotice('Операция успешно добавлена.')
      }

      setNoticeType('success')
      resetForm()
      await loadTransactions()
    } catch (error) {
      setTransactions(previousTransactions)
      showError(error)
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id)

    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      category: transaction.category,
      description: transaction.description,
      paymentMethod: transaction.paymentMethod || 'CARD',
      date: transaction.date,
    })

    document
      .getElementById('operation-form')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleDelete(id) {
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) return

    const confirmed = window.confirm(
      `Удалить операцию «${transaction.description || transaction.category}»?`,
    )
    if (!confirmed) return

    const previousTransactions = [...transactions]

    try {
      setTransactions((current) => current.filter((item) => item.id !== id))
      setNotice('Удаление операции...')
      setNoticeType('success')

      await deleteTransaction(id)

      setNotice('Операция успешно удалена.')
      setNoticeType('success')

      if (editingId === id) resetForm()

      await loadTransactions()
    } catch (error) {
      setTransactions(previousTransactions)
      showError(error)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="brand-icon">
            <Icon name="overview" size={25} />
          </span>
          <span className="brand-text">
            FinSight
            <br />
            Финансовая аналитика
          </span>
        </button>

        <div className="sidebar-caption">РАБОЧАЯ ОБЛАСТЬ</div>

        <nav className="navigation">
          <button
            className="nav-item active"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Icon name="overview" size={19} />
            <span>Обзор</span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              document
                .getElementById('history')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Icon name="transactions" size={19} />
            <span>Транзакции</span>
            <span className="nav-count">{transactions.length}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-secure">
            <span>Финансовый контроль</span>
          </div>
          <div className="sidebar-secure">
            <span>Лабораторная работа №5</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-search">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Поиск по категории или описанию..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Поиск операций"
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => setSearch('')}
                aria-label="Очистить поиск"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() =>
                setTheme((current) =>
                  current === 'light' ? 'dark' : 'light',
                )
              }
              aria-label="Переключить тему"
            >
              <Icon name="sun" size={19} />
            </button>

            <div className="profile">
              <div className="profile-avatar">ФА</div>
              <div className="profile-info">
                <span className="profile-name">FinSight</span>
                <span className="profile-role">Финансовая аналитика</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                РАБОЧАЯ ОБЛАСТЬ / ОБЗОР
              </div>
              <h1>Финансовый обзор</h1>
              <p className="page-subtitle">
                Управляйте доходами и расходами в одном месте
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={loadTransactions}
              disabled={isLoading}
            >
              <Icon name="refresh" size={18} />
              {isLoading ? 'Загрузка...' : 'Обновить'}
            </button>
          </section>

          {notice && (
            <div
              className={`notice ${noticeType === 'error' ? 'notice-error' : ''}`}
              role="status"
            >
              <span>{notice}</span>
              {noticeType === 'error' && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={retryLoadTransactions}
                  disabled={isRetrying}
                >
                  <Icon name="refresh" size={16} />
                  {isRetrying ? 'Повтор...' : 'Повторить запрос'}
                </button>
              )}
              <button
                className="icon-button"
                onClick={() => setNotice('')}
                aria-label="Закрыть уведомление"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          <section className="summary-grid" aria-label="Финансовая сводка">
            <article className="summary-card balance-card">
              <div className="summary-top">
                <div className="summary-icon blue-icon">
                  <Icon name="wallet" size={23} />
                </div>
                <span className="summary-label">Общий баланс</span>
                <span className="summary-symbol">₽</span>
              </div>
              <div className="summary-value">{formatMoney(balance)}</div>
              <div className="summary-bottom">
                <span className="summary-note">Доходы минус расходы</span>
              </div>
            </article>

            <article className="summary-card income-card">
              <div className="summary-top">
                <div className="summary-icon green-icon">
                  <Icon name="up" size={23} />
                </div>
                <span className="summary-label">Доходы</span>
                <span className="summary-symbol">↗</span>
              </div>
              <div className="summary-value">{formatMoney(income)}</div>
              <div className="summary-bottom">
                <span className="summary-note">Все поступления</span>
              </div>
            </article>

            <article className="summary-card expense-card">
              <div className="summary-top">
                <div className="summary-icon red-icon">
                  <Icon name="down" size={23} />
                </div>
                <span className="summary-label">Расходы</span>
                <span className="summary-symbol">↘</span>
              </div>
              <div className="summary-value">{formatMoney(expenses)}</div>
              <div className="summary-bottom">
                <span className="summary-note">Все списания</span>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-top">
                <div className="summary-icon purple-panel-icon">
                  <Icon name="transactions" size={23} />
                </div>
                <span className="summary-label">Операции</span>
                <span className="summary-symbol">▤</span>
              </div>
              <div className="summary-value">
                {isLoading ? '…' : transactions.length}
              </div>
              <div className="summary-bottom">
                <span className="summary-note">Всего записей в системе</span>
              </div>
            </article>
          </section>

          <div className="dashboard-grid">
            <div className="dashboard-main-column">
              <section className="panel operation-panel" id="operation-form">
                <div className="panel-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon purple-panel-icon">
                      <Icon name="plus" size={21} />
                    </div>
                    <div>
                      <h2>
                        {editingId !== null
                          ? 'Редактировать операцию'
                          : 'Новая операция'}
                      </h2>
                      <p>Заполните информацию о финансовой операции</p>
                    </div>
                  </div>
                </div>

                <form className="transaction-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="field">
                      <span className="field-label">Тип операции</span>
                      <div className="type-selector">
                        <button
                          type="button"
                          className={`type-option expense-option ${
                            form.type === 'EXPENSE' ? 'selected' : ''
                          }`}
                          onClick={() =>
                            setForm({ ...form, type: 'EXPENSE' })
                          }
                        >
                          <Icon name="down" size={17} />
                          Расход
                        </button>
                        <button
                          type="button"
                          className={`type-option income-option ${
                            form.type === 'INCOME' ? 'selected' : ''
                          }`}
                          onClick={() =>
                            setForm({ ...form, type: 'INCOME' })
                          }
                        >
                          <Icon name="up" size={17} />
                          Доход
                        </button>
                      </div>
                    </div>

                    <label className="field">
                      <span className="field-label">Сумма, ₽</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0,00"
                        value={form.amount}
                        onChange={(event) =>
                          setForm({ ...form, amount: event.target.value })
                        }
                        required
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Категория</span>
                      <select
                        value={form.category}
                        onChange={(event) =>
                          setForm({ ...form, category: event.target.value })
                        }
                        required
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span className="field-label">Дата</span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                          setForm({ ...form, date: event.target.value })
                        }
                        required
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Способ оплаты</span>
                      <select
                        value={form.paymentMethod}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            paymentMethod: event.target.value,
                          })
                        }
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span className="field-label">Описание</span>
                      <input
                        type="text"
                        placeholder="Например, покупка продуктов"
                        value={form.description}
                        maxLength={500}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            description: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={isSaving}
                    >
                      <Icon
                        name={editingId !== null ? 'edit' : 'plus'}
                        size={18}
                      />
                      {isSaving
                        ? 'Сохранение...'
                        : editingId !== null
                          ? 'Сохранить изменения'
                          : 'Добавить операцию'}
                    </button>

                    {editingId !== null && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={resetForm}
                      >
                        Отмена
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section className="panel history-panel" id="history">
                <div className="panel-heading history-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon blue-panel-icon">
                      <Icon name="transactions" size={20} />
                    </div>
                    <div>
                      <h2>Последние операции</h2>
                      <p>Данные загружаются с сервера</p>
                    </div>
                  </div>

                  <span className="history-total">
                    {filteredTransactions.length} записей
                  </span>
                </div>

                <div className="history-controls">
                  <label className="history-search">
                    <Icon name="search" size={17} />
                    <input
                      type="search"
                      placeholder="Поиск..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>

                  <label className="select-control">
                    <select
                      value={filterType}
                      onChange={(event) => setFilterType(event.target.value)}
                      aria-label="Фильтр по типу"
                    >
                      <option value="ALL">Все типы</option>
                      <option value="INCOME">Доходы</option>
                      <option value="EXPENSE">Расходы</option>
                    </select>
                  </label>

                  <label className="select-control sort-control">
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      aria-label="Сортировка"
                    >
                      <option value="NEWEST">Сначала новые</option>
                      <option value="OLDEST">Сначала старые</option>
                      <option value="AMOUNT_HIGH">Сначала крупные</option>
                      <option value="AMOUNT_LOW">Сначала небольшие</option>
                    </select>
                  </label>
                </div>

                <div className="transaction-list">
                  {isLoading ? (
                    <div className="empty-state" role="status" aria-live="polite">
                      <div className="loading-spinner" aria-hidden="true" />
                      <p>Загрузка операций с сервера...</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Icon name="wallet" size={28} />
                      </div>
                      <h3>Операции не найдены</h3>
                      <p>Добавьте операцию или измените параметры поиска.</p>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <article
                        className="transaction-row"
                        key={transaction.id}
                      >
                        <div
                          className={`transaction-type-icon ${
                            transaction.type === 'INCOME'
                              ? 'transaction-income'
                              : 'transaction-expense'
                          }`}
                        >
                          <Icon
                            name={
                              transaction.type === 'INCOME' ? 'up' : 'down'
                            }
                            size={19}
                          />
                        </div>

                        <div className="transaction-info">
                          <span className="transaction-title">
                            {transaction.category}
                          </span>
                          <span className="transaction-meta">
                            {transaction.description || 'Без описания'}
                            <span className="meta-separator">·</span>
                            {formatDate(transaction.date)}
                            {transaction.paymentMethod && (
                              <>
                                <span className="meta-separator">·</span>
                                {paymentMethodLabel(
                                  transaction.paymentMethod,
                                )}
                              </>
                            )}
                          </span>
                        </div>

                        <div
                          className={`transaction-amount ${
                            transaction.type === 'INCOME'
                              ? 'amount-income'
                              : 'amount-expense'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '+' : '−'}
                          {formatMoney(transaction.amount)}
                        </div>

                        <div className="transaction-actions">
                          <button
                            type="button"
                            className="row-action edit-action"
                            onClick={() => handleEdit(transaction)}
                            title="Редактировать"
                            aria-label="Редактировать операцию"
                          >
                            <Icon name="edit" size={17} />
                          </button>
                          <button
                            type="button"
                            className="row-action delete-action"
                            onClick={() => handleDelete(transaction.id)}
                            title="Удалить"
                            aria-label="Удалить операцию"
                          >
                            <Icon name="trash" size={17} />
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <div className="history-footer">
                  <span>
                    Показано операций:{' '}
                    <strong>{filteredTransactions.length}</strong>
                  </span>
                </div>
              </section>
            </div>

            <div className="dashboard-side-column">
              <section className="panel analytics-panel">
                <div className="panel-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon green-panel-icon">
                      <Icon name="overview" size={20} />
                    </div>
                    <div>
                      <h2>Структура расходов</h2>
                      <p>Распределение по категориям</p>
                    </div>
                  </div>
                </div>

                {expenses === 0 ? (
                  <div className="empty-state">
                    <p>Пока нет расходов.</p>
                    <span>Добавьте расход, чтобы увидеть диаграмму.</span>
                  </div>
                ) : (
                  <div className="expense-analytics">
                    <div className="expense-chart">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={57}
                            outerRadius={88}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {categoryBreakdown.map((item, index) => (
                              <Cell
                                key={item.category}
                                fill={
                                  CHART_COLORS[index % CHART_COLORS.length]
                                }
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            formatter={(value, name) => [
                              formatMoney(value),
                              name,
                            ]}
                            contentStyle={{
                              backgroundColor:
                                'var(--panel-bg, #172438)',
                              border:
                                '1px solid var(--border-color, #29384d)',
                              borderRadius: '12px',
                              fontSize: '13px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="expense-chart-center">
                        <span>Всего расходов</span>
                        <strong>{formatMoney(expenses)}</strong>
                      </div>
                    </div>

                    <div className="category-breakdown">
                      {categoryBreakdown.map((item, index) => (
                        <div className="legend-item" key={item.category}>
                          <div className="expense-category-info">
                            <span
                              className="expense-category-dot"
                              style={{
                                backgroundColor:
                                  CHART_COLORS[
                                    index % CHART_COLORS.length
                                  ],
                              }}
                            />
                            <span className="legend-name">
                              {item.category}
                            </span>
                          </div>

                          <div className="expense-category-values">
                            <strong>{formatMoney(item.amount)}</strong>
                            <span className="legend-percent">
                              {item.percentage.toLocaleString('ru-RU', {
                                maximumFractionDigits: 1,
                              })}
                              %
                            </span>
                          </div>

                          <div className="expense-progress-track">
                            <div
                              className="expense-progress-fill"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor:
                                  CHART_COLORS[
                                    index % CHART_COLORS.length
                                  ],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="insight-card">
                  <div>
                    <strong>Финансовая подсказка</strong>
                    <p>
                      {expenses > 0
                        ? `Ваши расходы составляют ${formatMoney(expenses)}.`
                        : 'Добавляйте расходы, чтобы увидеть аналитику.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="panel activity-panel">
                <div className="panel-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon clock-panel-icon">
                      <Icon name="refresh" size={20} />
                    </div>
                    <div>
                      <h2>Состояние сервера</h2>
                      <p>Синхронизация операций</p>
                    </div>
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-description">
                    <strong>Источник данных</strong>
                    <span>Backend API / PostgreSQL</span>
                  </div>
                  <span className="status-badge">
                    <span />
                    {isLoading ? 'Загрузка' : 'Подключено'}
                  </span>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={loadTransactions}
                  disabled={isLoading}
                >
                  <Icon name="refresh" size={17} />
                  Обновить данные
                </button>
              </section>
            </div>
          </div>

          <footer className="page-footer">
            <div className="footer-security">
              <span>FinSight · Финансовая аналитика</span>
            </div>
            <span>Лабораторная работа №5</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App