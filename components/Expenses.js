(() => {
  const { useState, useMemo } = React;
  const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = window.Recharts;

  const Expenses = ({ expenses, setExpenses }) => {
    const { Card, PlusIcon, EditIcon, DeleteIcon } = window.MySelvam.components;
    const { formatCurrency } = window.MySelvam.utils;

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const monthlySummary = useMemo(() => {
      const now = new Date();
      return expenses.reduce((acc, exp) => {
        const expDate = new Date(exp.date);
        if (expDate.getFullYear() === now.getFullYear() && expDate.getMonth() === now.getMonth()) {
          acc.total += exp.amount;
          acc.byCategory[exp.category] = (acc.byCategory[exp.category] || 0) + exp.amount;
        }
        return acc;
      }, { total: 0, byCategory: {} });
    }, [expenses]);

    const categoryChartData = useMemo(() => {
      return Object.entries(monthlySummary.byCategory).map(([name, value]) => ({ name, value }));
    }, [monthlySummary]);
    
    const COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
    
    const handleSave = (expense) => {
      if (editingExpense) {
        setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...e, ...expense } : e));
      } else {
        setExpenses([...expenses, { ...expense, id: `e${Date.now()}` }]);
      }
      setModalOpen(false);
      setEditingExpense(null);
    };

    const handleEdit = (expense) => {
      setEditingExpense(expense);
      setModalOpen(true);
    };

    const handleDelete = (id) => {
      setExpenses(expenses.filter(e => e.id !== id));
    };

    return (
      React.createElement('div', null,
        React.createElement('div', { className: 'flex justify-between items-center mb-6' },
          React.createElement('h1', { className: 'text-3xl font-bold text-slate-800' }, 'Expense Tracker'),
          React.createElement('button', {
            onClick: () => { setEditingExpense(null); setModalOpen(true); },
            className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center'
          }, React.createElement(PlusIcon, {className: 'w-5 h-5 mr-2'}), 'Add Expense')
        ),

        React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6' },
          React.createElement(Card, { className: 'lg:col-span-1' },
            React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-1' }, 'This Month\'s Total'),
            React.createElement('p', { className: 'text-4xl font-bold text-slate-900' }, formatCurrency(monthlySummary.total))
          ),
          React.createElement(Card, { className: 'lg:col-span-2' },
            React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-2' }, 'Monthly Spend by Category'),
            categoryChartData.length > 0 ?
              React.createElement('div', { style: { width: '100%', height: 200 } },
                React.createElement(ResponsiveContainer, null,
                  React.createElement(PieChart, null,
                    React.createElement(Pie, { data: categoryChartData, cx: "50%", cy: "50%", outerRadius: 80, fill: "#8884d8", dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`},
                      categoryChartData.map((entry, index) => React.createElement(Cell, { key: `cell-${index}`, fill: COLORS[index % COLORS.length] }))
                    ),
                    React.createElement(Tooltip, { formatter: (value) => formatCurrency(value) })
                  )
                )
              ) : React.createElement('p', {className: 'flex items-center justify-center h-full text-slate-500'}, 'No expenses this month.')
          )
        ),
        
        React.createElement(Card, null,
          React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-4' }, 'Recent Transactions'),
          React.createElement('div', { className: 'overflow-x-auto' },
            React.createElement('table', { className: 'w-full text-left' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b bg-slate-50' },
                ['Date', 'Category', 'Description', 'Amount', 'Actions'].map(h => React.createElement('th', { key: h, className: 'p-4 text-sm font-semibold text-slate-600' }, h))
              )),
              React.createElement('tbody', null,
                [...expenses].sort((a,b) => new Date(b.date) - new Date(a.date)).map(exp => 
                  React.createElement('tr', { key: exp.id, className: 'border-b' },
                    React.createElement('td', { className: 'p-4' }, exp.date),
                    React.createElement('td', { className: 'p-4' }, exp.category),
                    React.createElement('td', { className: 'p-4' }, exp.description),
                    React.createElement('td', { className: 'p-4 font-semibold' }, formatCurrency(exp.amount)),
                    React.createElement('td', { className: 'p-4' },
                      React.createElement('div', { className: 'flex gap-2' },
                        React.createElement('button', { onClick: () => handleEdit(exp), className: 'text-slate-500 hover:text-blue-600' }, React.createElement(EditIcon, { className: 'w-5 h-5' })),
                        React.createElement('button', { onClick: () => handleDelete(exp.id), className: 'text-slate-500 hover:text-red-600' }, React.createElement(DeleteIcon, { className: 'w-5 h-5' }))
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        isModalOpen && React.createElement(ExpenseModal, { onClose: () => { setModalOpen(false); setEditingExpense(null); }, onSave: handleSave, expense: editingExpense })
      )
    );
  };
  
  const ExpenseModal = ({ onClose, onSave, expense }) => {
    const [formData, setFormData] = useState({
      date: expense?.date || new Date().toISOString().split('T')[0],
      category: expense?.category || 'Household',
      amount: expense?.amount || '',
      description: expense?.description || ''
    });
    
    const categories = ['Household', 'Utilities', 'Transport', 'Food', 'Entertainment', 'Health', 'Other'];
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...formData, amount: parseFloat(formData.amount) });
    };

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-xl p-6 w-full max-w-md' },
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 mb-4' }, expense ? 'Edit Expense' : 'Add Expense'),
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement(InputField, { label: "Date", name: "date", type: "date", value: formData.date, onChange: handleChange, required: true }),
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-1' }, 'Category'),
            React.createElement('select', { name: 'category', value: formData.category, onChange: handleChange, className: 'w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500' },
              categories.map(cat => React.createElement('option', { key: cat, value: cat }, cat))
            )
          ),
          React.createElement(InputField, { label: "Description", name: "description", value: formData.description, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Amount (₹)", name: "amount", type: "number", value: formData.amount, onChange: handleChange, required: true }),
          React.createElement('div', { className: 'flex justify-end gap-2 mt-6' },
            React.createElement('button', { type: 'button', onClick: onClose, className: 'bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300' }, 'Cancel'),
            React.createElement('button', { type: 'submit', className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700' }, 'Save')
          )
        )
      )
    );
  };
  
  const InputField = ({ label, ...props }) => (
    React.createElement('div', { className: 'mb-4' },
      React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-1' }, label),
      React.createElement('input', { ...props, className: 'w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500' })
    )
  );

  window.MySelvam.components.Expenses = Expenses;
})();
