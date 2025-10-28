(() => {
  const { useState, useMemo } = React;

  const Goals = ({ goals, setGoals }) => {
    const { Card, PlusIcon, EditIcon, DeleteIcon } = window.MySelvam.components;
    const { formatCurrency } = window.MySelvam.utils;

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const handleSave = (goal) => {
      if (editingGoal) {
        setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goal } : g));
      } else {
        setGoals([...goals, { ...goal, id: `goal${Date.now()}` }]);
      }
      setModalOpen(false);
      setEditingGoal(null);
    };

    const handleEdit = (goal) => {
      setEditingGoal(goal);
      setModalOpen(true);
    };

    const handleDelete = (id) => {
      setGoals(goals.filter(g => g.id !== id));
    };

    return (
      React.createElement('div', null,
        React.createElement('div', { className: 'flex justify-between items-center mb-6' },
          React.createElement('h1', { className: 'text-3xl font-bold text-slate-800' }, 'Financial Goals'),
          React.createElement('button', {
            onClick: () => { setEditingGoal(null); setModalOpen(true); },
            className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center'
          }, React.createElement(PlusIcon, {className: 'w-5 h-5 mr-2'}), 'Add Goal')
        ),

        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
          goals.map(goal => {
            const progress = (goal.savedAmount / goal.targetAmount) * 100;
            
            return React.createElement(Card, { key: goal.id, className: 'flex flex-col' },
              React.createElement('div', { className: 'flex-1' },
                React.createElement('h2', { className: 'text-xl font-bold text-slate-800' }, goal.name),
                React.createElement('p', { className: 'text-slate-600 mt-2' }, `Target: ${formatCurrency(goal.targetAmount)} by ${goal.targetDate}`),
                React.createElement('p', { className: 'text-slate-600' }, `Saved: ${formatCurrency(goal.savedAmount)}`),
                React.createElement('div', { className: 'w-full bg-slate-200 rounded-full h-4 my-3' },
                  React.createElement('div', {
                    className: 'bg-teal-600 h-4 rounded-full',
                    style: { width: `${progress > 100 ? 100 : progress}%` }
                  })
                ),
                React.createElement('p', { className: 'text-right font-semibold text-teal-700' }, `${progress.toFixed(1)}% Complete`)
              ),
              React.createElement('div', { className: 'flex justify-end gap-2 mt-4' },
                React.createElement('button', { onClick: () => handleEdit(goal), className: 'text-slate-500 hover:text-blue-600' }, React.createElement(EditIcon, { className: 'w-5 h-5' })),
                React.createElement('button', { onClick: () => handleDelete(goal.id), className: 'text-slate-500 hover:text-red-600' }, React.createElement(DeleteIcon, { className: 'w-5 h-5' }))
              )
            );
          })
        ),
        isModalOpen && React.createElement(GoalModal, { onClose: () => { setModalOpen(false); setEditingGoal(null); }, onSave: handleSave, goal: editingGoal })
      )
    );
  };

  const GoalModal = ({ onClose, onSave, goal }) => {
    const [formData, setFormData] = useState({
      name: goal?.name || '',
      targetAmount: goal?.targetAmount || '',
      targetDate: goal?.targetDate || new Date().toISOString().split('T')[0],
      savedAmount: goal?.savedAmount || ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        savedAmount: parseFloat(formData.savedAmount)
      });
    };
    
    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-xl p-6 w-full max-w-md' },
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 mb-4' }, goal ? 'Edit Goal' : 'Add New Goal'),
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement(InputField, { label: "Goal Name", name: "name", value: formData.name, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Target Amount (₹)", name: "targetAmount", type: "number", value: formData.targetAmount, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Target Date", name: "targetDate", type: "date", value: formData.targetDate, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Amount Already Saved (₹)", name: "savedAmount", type: "number", value: formData.savedAmount, onChange: handleChange, required: true }),
          React.createElement('div', { className: 'flex justify-end gap-2 mt-6' },
            React.createElement('button', { type: 'button', onClick: onClose, className: 'bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300' }, 'Cancel'),
            React.createElement('button', { type: 'submit', className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700' }, 'Save Goal')
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
  
  window.MySelvam.components.Goals = Goals;
})();
