import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'

function App() {
  const [editingExpense, setEditingExpense] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleSaved() {
    setEditingExpense(null)
    setRefreshKey(current => current + 1)
  }

  function handleDeleted(deletedId) {
    setEditingExpense(current => current?._id === deletedId ? null : current)
  }

  return (
    <>
      <ExpenseForm
        key={editingExpense?._id ?? 'new-expense'}
        expenseToEdit={editingExpense}
        onSaved={handleSaved}
        onCancel={() => setEditingExpense(null)}
      />
      <ExpenseList
        onEdit={setEditingExpense}
        onDeleted={handleDeleted}
        refreshKey={refreshKey}
      />
    </>
  )
}

export default App
