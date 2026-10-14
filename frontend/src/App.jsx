
import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'financial-transactions'

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
]

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved === null) {
      return initialTransactions
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return initialTransactions
    }

    return parsed
  } catch (error) {
    console.error('Не удалось загрузить операции:', error)
    return initialTransactions
  }
}

function formatMoney(amount) {
  return `${amount.toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  })} ₽`
}

function App() {
  // Состояние финансовых операций
  const [transactions, setTransactions] = useState(loadTransactions)

  // Состояние формы
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Еда')
  const [editingId, setEditingId] = useState(null)

  // Поиск, фильтрация и сортировка
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // Дополнительный эффект: сообщение пользователю
  const [notice, setNotice] = useState('')

  // Эффект 1: сохраняем операции в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch (error) {
      console.error('Не удалось сохранить операции:', error)
      setNotice('Не удалось сохранить данные в браузере.')
    }
  }, [transactions])

  // Вычисляем доходы, расходы и баланс
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  const balance = income - expenses

  // Эффект 2: обновляем заголовок вкладки
  useEffect(() => {
    document.title = `Финансовая аналитика | ${formatMoney(balance)}`
  }, [balance])

  // Эффект 3: показываем уведомление при изменении количества операций
  useEffect(() => {
    if (transactions.length > 0) {
      setNotice(`Количество операций: ${transactions.length}`)
    } else {
      setNotice('Список операций пуст.')
    }
  }, [transactions.length])

  // Поиск, фильтрация и сортировка
  const filteredTransactions = transactions
    .filter((item) => {
      return filter === 'all' || item.type === filter
    })
    .filter((item) => {
      const query = search.trim().toLowerCase()

      return (
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.date.localeCompare(a.date)
      }

      if (sortOrder === 'oldest') {
        return a.date.localeCompare(b.date)
      }

      if (sortOrder === 'amount-high') {
        return b.amount - a.amount
      }

      return a.amount - b.amount
    })

  // Сбрасываем форму
  function resetForm() {
    setTitle('')
    setAmount('')
    setType('expense')
    setCategory('Еда')
    setEditingId(null)
  }

  // Добавление или редактирование операции
  function handleSubmit(event) {
    event.preventDefault()

    const numericAmount = Number(amount)

    if (!title.trim()) {
      setNotice('Введите название операции.')
      return
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setNotice('Сумма должна быть больше нуля.')
      return
    }

    if (editingId !== null) {
      setTransactions((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: title.trim(),
                amount: numericAmount,
                type,
                category,
              }
            : item
        )
      )

      resetForm()
      setNotice('Операция успешно изменена.')
      return
    }

    const newTransaction = {
      id: Date.now(),
      title: title.trim(),
      amount: numericAmount,
      type,
      category,
      date: new Date().toISOString().slice(0, 10),
    }

    setTransactions((current) => [...current, newTransaction])
    resetForm()
    setNotice('Операция успешно добавлена.')
  }

  // Заполняем форму данными выбранной операции
  function startEditing(item) {
    setEditingId(item.id)
    setTitle(item.title)
    setAmount(String(item.amount))
    setType(item.type)
    setCategory(item.category)
    setNotice(`Редактирование: ${item.title}`)
  }

  // Удаление операции
  function deleteTransaction(id) {
    const item = transactions.find((transaction) => transaction.id === id)

    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    )

    if (editingId === id) {
      resetForm()
    }

    setNotice(
      item ? `Операция «${item.title}» удалена.` : 'Операция удалена.'
    )
  }

  return (
    <main className="app">
      <header className="header">
        <p className="eyebrow">ЛИЧНЫЕ ФИНАНСЫ</p>
        <h1>Финансовая аналитика</h1>
        <p className="subtitle">
          Управляй доходами и расходами в одном месте
        </p>
      </header>

      <section className="summary">
        <article className="summary-card balance-card">
          <span>Баланс</span>
          <strong>{formatMoney(balance)}</strong>
        </article>

        <article className="summary-card">
          <span>Доходы</span>
          <strong className="income">{formatMoney(income)}</strong>
        </article>

        <article className="summary-card">
          <span>Расходы</span>
          <strong className="expense">{formatMoney(expenses)}</strong>
        </article>
      </section>

      <section className="panel">
        <h2>
          {editingId !== null ? 'Редактировать операцию' : 'Добавить операцию'}
        </h2>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <label>
            Название
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, покупка продуктов"
              required
            />
          </label>

          <label>
            Сумма (₽)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              required
            />
          </label>

          <label>
            Тип операции
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </label>

          <label>
            Категория
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="Еда">Еда</option>
              <option value="Транспорт">Транспорт</option>
              <option value="Работа">Работа</option>
              <option value="Жильё">Жильё</option>
              <option value="Развлечения">Развлечения</option>
              <option value="Другое">Другое</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit">
              {editingId !== null ? 'Сохранить изменения' : 'Добавить операцию'}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="list-header">
          <h2>История операций</h2>

          <input
            className="search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по названию или категории"
            aria-label="Поиск операций"
          />

          <div className="controls">
            <select
              aria-label="Фильтр операций"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">Все операции</option>
              <option value="income">Только доходы</option>
              <option value="expense">Только расходы</option>
            </select>

            <select
              aria-label="Сортировка операций"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="amount-high">Сначала дорогие</option>
              <option value="amount-low">Сначала дешёвые</option>
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="empty">Операции не найдены.</p>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map((item) => (
              <article className="transaction" key={item.id}>
                <div className="transaction-icon" aria-hidden="true">
                  {item.type === 'income' ? '↗' : '↘'}
                </div>

                <div className="transaction-info">
                  <strong>{item.title}</strong>
                  <span>
                    {item.category} · {item.date}
                  </span>
                </div>

                <strong className={item.type}>
                  {item.type === 'income' ? '+' : '−'}
                  {formatMoney(item.amount)}
                </strong>

                <div className="transaction-actions">
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => startEditing(item)}
                  >
                    Изменить
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteTransaction(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="notice" role="status" aria-live="polite">
        {notice}
      </p>

      <footer>
        Данные сохраняются локально в браузере на этом устройстве.
      </footer>
    </main>
  )
}

export default App
