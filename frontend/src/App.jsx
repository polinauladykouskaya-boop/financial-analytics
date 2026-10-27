import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'financial-transactions'
const THEME_KEY = 'financial-theme'

const initialTransactions = [
  {
    id: 1,
    title: 'Зарплата',
    amount: 75000,
    type: 'income',
    category: 'Работа',
    date: '2026-10-01',
  },
  {
    id: 2,
    title: 'Продукты',
    amount: 3200,
    type: 'expense',
    category: 'Еда',
    date: '2026-10-03',
  },
  {
    id: 3,
    title: 'Транспорт',
    amount: 850,
    type: 'expense',
    category: 'Транспорт',
    date: '2026-10-05',
  },
  {
    id: 4,
    title: 'Развлечения',
    amount: 600,
    type: 'expense',
    category: 'Развлечения',
    date: '2026-10-10',
  },
  {
    id: 5,
    title: 'Фриланс',
    amount: 5000,
    type: 'income',
    category: 'Работа',
    date: '2026-10-12',
  },
]

const categories = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Развлечения',
  'Здоровье',
  'Покупки',
  'Работа',
  'Образование',
  'Другое',
]

const categoryColors = {
  Еда: '#f05280',
  Транспорт: '#f7b844',
  Жильё: '#37bd99',
  Развлечения: '#8b75f5',
  Здоровье: '#38bdf8',
  Покупки: '#fb923c',
  Работа: '#3978f6',
  Образование: '#a78bfa',
  Другое: '#94a3b8',
}

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Не удалось загрузить операции:', error)
  }

  return initialTransactions
}

function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value) {
  if (!value) return ''

  return new Date(`${value}T12:00:00`).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitialTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 9h18" />
        <path d="M16 14h2" />
        <path d="M7 5V3h10v2" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 6-8" />
        <path d="M17 5h4v4" />
      </>
    ),
    folder: (
      <>
        <path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    down: (
      <>
        <path d="M12 4v15" />
        <path d="m5 12 7 7 7-7" />
      </>
    ),
    up: (
      <>
        <path d="M12 20V5" />
        <path d="m5 12 7-7 7 7" />
      </>
    ),
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
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: (
      <>
        <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M7 12h10m-7 5h4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
  }

  return <svg {...common}>{paths[name] || paths.wallet}</svg>
}

function App() {
  const [transactions, setTransactions] = useState(loadTransactions)
  const [theme, setTheme] = useState(getInitialTheme)
  const [activePage, setActivePage] = useState('Главная')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Еда',
    date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (error) {
      console.error('Не удалось сохранить тему:', error)
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch (error) {
      console.error('Не удалось сохранить операции:', error)
      setNotice('Не удалось сохранить данные в браузере.')
    }
  }, [transactions])

  const income = useMemo(
    () =>
      transactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0),
    [transactions],
  )

  const expenses = useMemo(
    () =>
      transactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0),
    [transactions],
  )

  const balance = income - expenses

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const result = transactions.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch)

      const matchesType =
        filterType === 'all' || item.type === filterType

      return matchesSearch && matchesType
    })

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.date.localeCompare(b.date)
        case 'amountHigh':
          return Number(b.amount) - Number(a.amount)
        case 'amountLow':
          return Number(a.amount) - Number(b.amount)
        default:
          return b.date.localeCompare(a.date)
      }
    })
  }, [transactions, search, filterType, sortBy])

  const expenseByCategory = useMemo(() => {
    const totals = {}

    transactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => {
        totals[item.category] =
          (totals[item.category] || 0) + Number(item.amount)
      })

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        color: categoryColors[category] || categoryColors.Другое,
        percent: expenses > 0 ? (amount / expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, expenses])

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  const chartGradient = useMemo(() => {
    if (!expenseByCategory.length || expenses <= 0) {
      return 'conic-gradient(var(--border) 0% 100%)'
    }

    let current = 0
    const parts = expenseByCategory.map((item) => {
      const start = current
      current += item.percent
      return `${item.color} ${start}% ${current}%`
    })

    return `conic-gradient(${parts.join(', ')})`
  }, [expenseByCategory, expenses])

  function resetForm() {
    setForm({
      title: '',
      amount: '',
      type: 'expense',
      category: 'Еда',
      date: new Date().toISOString().slice(0, 10),
    })
    setEditingId(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const title = form.title.trim()
    const amount = Number(form.amount)

    if (!title || !form.amount || !Number.isFinite(amount) || amount <= 0) {
      setNotice('Введите название операции и сумму больше нуля.')
      return
    }

    if (!form.date) {
      setNotice('Выберите дату операции.')
      return
    }

    if (editingId !== null) {
      setTransactions((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title,
                amount,
                type: form.type,
                category: form.category,
                date: form.date,
              }
            : item,
        ),
      )
      setNotice('Операция успешно обновлена.')
    } else {
      const newTransaction = {
        id: Date.now(),
        title,
        amount,
        type: form.type,
        category: form.category,
        date: form.date,
      }

      setTransactions((current) => [newTransaction, ...current])
      setNotice('Операция успешно добавлена.')
    }

    resetForm()
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id)
    setForm({
      title: transaction.title,
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    })
    setActivePage('Главная')
    setNotice('Измените данные и сохраните операцию.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id) {
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) return

    setTransactions((current) => current.filter((item) => item.id !== id))

    if (editingId === id) {
      resetForm()
    }

    setNotice(`Операция «${transaction.title}» удалена.`)
  }

  function clearAllTransactions() {
    if (!window.confirm('Удалить все операции? Это действие нельзя отменить.')) {
      return
    }

    setTransactions([])
    resetForm()
    setNotice('История операций очищена.')
  }

  const navigation = [
    { label: 'Главная', icon: 'home' },
    { label: 'Операции', icon: 'wallet' },
    { label: 'Аналитика', icon: 'chart' },
    { label: 'Категории', icon: 'folder' },
    { label: 'Настройки', icon: 'settings' },
  ]

  function handleNavigation(label) {
    setActivePage(label)

    if (label === 'Главная') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (label === 'Операции') {
      document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' })
    } else if (label === 'Аналитика') {
      document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })
    } else if (label === 'Категории') {
      document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })
    } else if (label === 'Настройки') {
      document.getElementById('settings')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => handleNavigation('Главная')}
          aria-label="На главную"
        >
          <span className="brand-icon">
            <Icon name="chart" size={25} />
          </span>
          <span className="brand-text">
            Финансовая
            <br />
            аналитика
          </span>
        </button>

        <div className="sidebar-caption">МЕНЮ</div>

        <nav className="navigation" aria-label="Основная навигация">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${
                activePage === item.label ? 'active' : ''
              }`}
              onClick={() => handleNavigation(item.label)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === 'Операции' && (
                <span className="nav-count">{transactions.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="goal-card">
            <div className="goal-icon">
              <Icon name="target" size={25} />
            </div>
            <h3>Ваши цели</h3>
            <p>Планируйте. Контролируйте. Достигайте.</p>
            <div className="goal-progress">
              <span />
            </div>
            <div className="goal-caption">Финансовый порядок начинается здесь.</div>
          </div>

          <div className="sidebar-secure">
            <Icon name="shield" size={17} />
            <span>Ваши данные хранятся локально</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-search">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Поиск по названию или категории..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Поиск операций"
            />
            {search && (
              <button
                className="icon-button search-clear"
                onClick={() => setSearch('')}
                aria-label="Очистить поиск"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          <div className="topbar-actions">
            <span className="theme-symbol">
              <Icon name="sun" size={18} />
            </span>
            <button
              className={`theme-switch ${theme === 'dark' ? 'is-dark' : ''}`}
              onClick={() =>
                setTheme((current) => (current === 'light' ? 'dark' : 'light'))
              }
              aria-label={
                theme === 'light'
                  ? 'Включить тёмную тему'
                  : 'Включить светлую тему'
              }
              aria-pressed={theme === 'dark'}
            >
              <span />
            </button>
            <span className="theme-symbol">
              <Icon name="moon" size={18} />
            </span>

            <div className="topbar-divider" />

            <div className="profile">
              <div className="profile-avatar">ФА</div>
              <div className="profile-info">
                <span className="profile-name">Пользователь</span>
                <span className="profile-role">Личный кабинет</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                ЛИЧНЫЙ ФИНАНСОВЫЙ ЦЕНТР
              </div>
              <h1>Финансовая аналитика</h1>
              <p className="page-subtitle">
                Управляйте доходами и расходами в одном месте
              </p>
            </div>

            <div className="date-badge">
              <span className="date-badge-icon">
                <Icon name="calendar" size={18} />
              </span>
              <span>
                <strong>
                  {new Date().toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
                <small>Ваш финансовый обзор</small>
              </span>
            </div>
          </section>

          <section className="summary-grid" aria-label="Сводка финансов">
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
                <span className="summary-note">
                  <span className="mini-dot blue-dot" />
                  Доходы минус расходы
                </span>
                <span className="mini-chart blue-chart">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </article>

            <article className="summary-card income-card">
              <div className="summary-top">
                <div className="summary-icon green-icon">
                  <Icon name="up" size={24} />
                </div>
                <span className="summary-label">Доходы</span>
                <span className="summary-symbol">↗</span>
              </div>
              <div className="summary-value">{formatMoney(income)}</div>
              <div className="summary-bottom">
                <span className="summary-note">
                  <span className="mini-dot green-dot" />
                  Всего поступлений
                </span>
                <span className="mini-chart green-chart">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </article>

            <article className="summary-card expense-card">
              <div className="summary-top">
                <div className="summary-icon red-icon">
                  <Icon name="down" size={24} />
                </div>
                <span className="summary-label">Расходы</span>
                <span className="summary-symbol">↘</span>
              </div>
              <div className="summary-value">{formatMoney(expenses)}</div>
              <div className="summary-bottom">
                <span className="summary-note">
                  <span className="mini-dot red-dot" />
                  Всего списаний
                </span>
                <span className="mini-chart red-chart">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </article>
          </section>

          {notice && (
            <div className="notice" role="status">
              <span className="notice-icon">
                <Icon name="check" size={17} />
              </span>
              <span>{notice}</span>
              <button
                className="icon-button notice-close"
                onClick={() => setNotice('')}
                aria-label="Закрыть уведомление"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          <div className="dashboard-grid">
            <div className="dashboard-main-column">
              <section className="panel operation-panel" id="operation-form">
                <div className="panel-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon purple-panel-icon">
                      <Icon name="plus" size={21} />
                    </div>
                    <div>
                      <h2>{editingId ? 'Редактировать операцию' : 'Новая операция'}</h2>
                      <p>Добавьте поступление или расход</p>
                    </div>
                  </div>

                  {editingId && (
                    <span className="editing-badge">Режим редактирования</span>
                  )}
                </div>

                <form className="transaction-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <label className="field">
                      <span className="field-label">Название операции</span>
                      <input
                        type="text"
                        placeholder="Например, покупка продуктов"
                        value={form.title}
                        onChange={(event) =>
                          setForm({ ...form, title: event.target.value })
                        }
                        maxLength={100}
                        required
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Сумма, ₽</span>
                      <input
                        type="number"
                        placeholder="0"
                        min="0.01"
                        step="0.01"
                        value={form.amount}
                        onChange={(event) =>
                          setForm({ ...form, amount: event.target.value })
                        }
                        required
                      />
                    </label>

                    <div className="field">
                      <span className="field-label">Тип операции</span>
                      <div className="type-selector">
                        <button
                          type="button"
                          className={`type-option expense-option ${
                            form.type === 'expense' ? 'selected' : ''
                          }`}
                          onClick={() =>
                            setForm({ ...form, type: 'expense' })
                          }
                        >
                          <Icon name="down" size={17} />
                          Расход
                        </button>
                        <button
                          type="button"
                          className={`type-option income-option ${
                            form.type === 'income' ? 'selected' : ''
                          }`}
                          onClick={() =>
                            setForm({ ...form, type: 'income' })
                          }
                        >
                          <Icon name="up" size={17} />
                          Доход
                        </button>
                      </div>
                    </div>

                    <label className="field">
                      <span className="field-label">Категория</span>
                      <select
                        value={form.category}
                        onChange={(event) =>
                          setForm({ ...form, category: event.target.value })
                        }
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span className="field-label">Дата операции</span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                          setForm({ ...form, date: event.target.value })
                        }
                        required
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="primary-button">
                      <Icon name={editingId ? 'check' : 'plus'} size={18} />
                      {editingId ? 'Сохранить изменения' : 'Добавить операцию'}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        resetForm()
                        setNotice('')
                      }}
                    >
                      <Icon name="close" size={17} />
                      Очистить
                    </button>
                  </div>
                </form>
              </section>

              <section className="panel history-panel" id="history">
                <div className="panel-heading history-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon blue-panel-icon">
                      <Icon name="wallet" size={20} />
                    </div>
                    <div>
                      <h2>История операций</h2>
                      <p>Все ваши финансовые движения</p>
                    </div>
                  </div>

                  <span className="history-total">
                    {filteredTransactions.length} из {transactions.length}
                  </span>
                </div>

                <div className="history-controls">
                  <div className="history-search">
                    <Icon name="search" size={17} />
                    <input
                      type="search"
                      placeholder="Поиск..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  <label className="select-control">
                    <Icon name="filter" size={16} />
                    <select
                      value={filterType}
                      onChange={(event) => setFilterType(event.target.value)}
                      aria-label="Фильтр по типу"
                    >
                      <option value="all">Все операции</option>
                      <option value="income">Доходы</option>
                      <option value="expense">Расходы</option>
                    </select>
                  </label>

                  <label className="select-control sort-control">
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      aria-label="Сортировка операций"
                    >
                      <option value="newest">Сначала новые</option>
                      <option value="oldest">Сначала старые</option>
                      <option value="amountHigh">Сумма: по убыванию</option>
                      <option value="amountLow">Сумма: по возрастанию</option>
                    </select>
                  </label>
                </div>

                <div className="transaction-list">
                  {filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Icon name="wallet" size={28} />
                      </div>
                      <h3>Операции не найдены</h3>
                      <p>Попробуйте изменить параметры поиска или добавьте операцию.</p>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <article
                        className="transaction-row"
                        key={transaction.id}
                      >
                        <div
                          className={`transaction-type-icon ${
                            transaction.type === 'income'
                              ? 'transaction-income'
                              : 'transaction-expense'
                          }`}
                        >
                          <Icon
                            name={transaction.type === 'income' ? 'up' : 'down'}
                            size={19}
                          />
                        </div>

                        <div className="transaction-info">
                          <span className="transaction-title">
                            {transaction.title}
                          </span>
                          <span className="transaction-meta">
                            <span
                              className="category-dot"
                              style={{
                                background:
                                  categoryColors[transaction.category] ||
                                  categoryColors.Другое,
                              }}
                            />
                            {transaction.category}
                            <span className="meta-separator">·</span>
                            {formatDate(transaction.date)}
                          </span>
                        </div>

                        <div
                          className={`transaction-amount ${
                            transaction.type === 'income'
                              ? 'amount-income'
                              : 'amount-expense'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '−'}
                          {formatMoney(Number(transaction.amount))}
                        </div>

                        <div className="transaction-actions">
                          <button
                            className="row-action edit-action"
                            onClick={() => handleEdit(transaction)}
                            aria-label={`Редактировать ${transaction.title}`}
                            title="Редактировать"
                          >
                            <Icon name="edit" size={17} />
                          </button>
                          <button
                            className="row-action delete-action"
                            onClick={() => handleDelete(transaction.id)}
                            aria-label={`Удалить ${transaction.title}`}
                            title="Удалить"
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
                    Показано операций: <strong>{filteredTransactions.length}</strong>
                  </span>
                  {transactions.length > 0 && (
                    <button
                      className="text-button"
                      onClick={clearAllTransactions}
                    >
                      Очистить историю
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="dashboard-side-column">
              <section className="panel analytics-panel" id="analytics">
                <div className="panel-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon green-panel-icon">
                      <Icon name="chart" size={20} />
                    </div>
                    <div>
                      <h2>Структура расходов</h2>
                      <p>Распределение по категориям</p>
                    </div>
                  </div>
                </div>

                <div className="chart-area">
                  <div
                    className="donut-chart"
                    style={{ background: chartGradient }}
                    role="img"
                    aria-label="Круговая диаграмма расходов по категориям"
                  >
                    <div className="donut-hole">
                      <strong>{formatMoney(expenses)}</strong>
                      <span>Всего расходов</span>
                    </div>
                  </div>

                  <div className="chart-legend">
                    {expenseByCategory.length === 0 ? (
                      <p className="legend-empty">Пока нет расходов</p>
                    ) : (
                      expenseByCategory.slice(0, 5).map((item) => (
                        <div className="legend-item" key={item.category}>
                          <span
                            className="legend-dot"
                            style={{ background: item.color }}
                          />
                          <span className="legend-name">{item.category}</span>
                          <span className="legend-percent">
                            {Math.round(item.percent)}%
                          </span>
                          <strong>{formatMoney(item.amount)}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-icon">
                    <Icon name="target" size={21} />
                  </div>
                  <div>
                    <strong>Финансовая подсказка</strong>
                    <p>
                      {expenseByCategory.length > 0
                        ? `Больше всего расходов приходится на категорию «${expenseByCategory[0].category}».`
                        : 'Добавляйте операции, чтобы увидеть структуру расходов.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="panel activity-panel">
                <div className="panel-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon clock-panel-icon">
                      <Icon name="clock" size={20} />
                    </div>
                    <div>
                      <h2>Последние операции</h2>
                      <p>Недавние изменения в истории</p>
                    </div>
                  </div>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="activity-empty">
                    Здесь появятся ваши операции.
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentTransactions.map((transaction) => (
                      <div className="activity-item" key={transaction.id}>
                        <span
                          className={`activity-marker ${
                            transaction.type === 'income'
                              ? 'activity-marker-income'
                              : 'activity-marker-expense'
                          }`}
                        />
                        <div className="activity-content">
                          <strong>{transaction.title}</strong>
                          <span>{transaction.category}</span>
                          <small>{formatDate(transaction.date)}</small>
                        </div>
                        <span
                          className={`activity-amount ${
                            transaction.type === 'income'
                              ? 'amount-income'
                              : 'amount-expense'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '−'}
                          {formatMoney(Number(transaction.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="panel settings-panel" id="settings">
                <div className="panel-heading">
                  <div className="panel-heading-left">
                    <div className="panel-icon settings-panel-icon">
                      <Icon name="settings" size={20} />
                    </div>
                    <div>
                      <h2>Настройки интерфейса</h2>
                      <p>Персонализируйте приложение</p>
                    </div>
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-row-icon">
                    <Icon name={theme === 'light' ? 'sun' : 'moon'} size={18} />
                  </div>
                  <div className="setting-description">
                    <strong>Тема оформления</strong>
                    <span>{theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</span>
                  </div>
                  <button
                    className={`theme-switch small-switch ${
                      theme === 'dark' ? 'is-dark' : ''
                    }`}
                    onClick={() =>
                      setTheme((current) =>
                        current === 'light' ? 'dark' : 'light',
                      )
                    }
                    aria-label="Переключить тему"
                    aria-pressed={theme === 'dark'}
                  >
                    <span />
                  </button>
                </div>

                <div className="setting-row">
                  <div className="setting-row-icon">
                    <Icon name="shield" size={18} />
                  </div>
                  <div className="setting-description">
                    <strong>Хранение данных</strong>
                    <span>Локально в браузере</span>
                  </div>
                  <span className="status-badge">
                    <span />
                    Активно
                  </span>
                </div>
              </section>
            </div>
          </div>

          <footer className="page-footer">
            <div className="footer-security">
              <Icon name="shield" size={15} />
              <span>Данные сохраняются локально в браузере на этом устройстве.</span>
            </div>
            <span>Финансовая аналитика</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App