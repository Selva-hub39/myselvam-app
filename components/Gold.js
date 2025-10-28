(() => {
  const { useState, useMemo } = React;

  const Gold = ({ goldHoldings, setGoldHoldings }) => {
    const { Card, PlusIcon, EditIcon, DeleteIcon } = window.MySelvam.components;
    const { formatCurrency } = window.MySelvam.utils;

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingHolding, setEditingHolding] = useState(null);

    const summary = useMemo(() => {
      const totalWeight = goldHoldings.reduce((acc, item) => acc + item.weightGr, 0);
      const totalValue = goldHoldings.reduce((acc, item) => acc + item.currentValue, 0);
      return { totalWeight, totalValue };
    }, [goldHoldings]);

    const handleSave = (holding) => {
      if (editingHolding) {
        setGoldHoldings(goldHoldings.map(h => h.id === editingHolding.id ? { ...h, ...holding } : h));
      } else {
        setGoldHoldings([...goldHoldings, { ...holding, id: `g${Date.now()}` }]);
      }
      setModalOpen(false);
      setEditingHolding(null);
    };

    const handleEdit = (holding) => {
      setEditingHolding(holding);
      setModalOpen(true);
    };

    const handleDelete = (id) => {
      setGoldHoldings(goldHoldings.filter(h => h.id !== id));
    };
    
    const tableHeaders = ["Name", "Weight (g)", "Purchase Value", "Current Value", "Gain", "Actions"];

    return (
      React.createElement('div', null,
        React.createElement('div', { className: 'flex justify-between items-center mb-6' },
          React.createElement('h1', { className: 'text-3xl font-bold text-slate-800' }, 'Gold Holdings'),
          React.createElement('button', {
            onClick: () => { setEditingHolding(null); setModalOpen(true); },
            className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center'
          }, React.createElement(PlusIcon, {className: 'w-5 h-5 mr-2'}), 'Add Gold')
        ),
        
        React.createElement(Card, { className: 'mb-6' },
          React.createElement('div', { className: 'grid grid-cols-2 gap-4 text-center' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-md font-semibold text-slate-600' }, 'Total Weight'),
              React.createElement('p', { className: 'text-2xl font-bold text-slate-900 mt-1' }, `${summary.totalWeight.toFixed(2)} g`)
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-md font-semibold text-slate-600' }, 'Total Current Value'),
              React.createElement('p', { className: 'text-2xl font-bold text-slate-900 mt-1' }, formatCurrency(summary.totalValue))
            )
          )
        ),
        
        React.createElement(Card, null,
          React.createElement('div', { className: 'overflow-x-auto' },
            React.createElement('table', { className: 'w-full text-left' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b bg-slate-50' },
                tableHeaders.map(h => React.createElement('th', { key: h, className: 'p-4 text-sm font-semibold text-slate-600' }, h))
              )),
              React.createElement('tbody', null,
                goldHoldings.map(item => {
                  const gain = item.currentValue - item.purchaseValue;
                  return React.createElement('tr', { key: item.id, className: 'border-b' },
                    React.createElement('td', { className: 'p-4 font-semibold' }, item.name),
                    React.createElement('td', { className: 'p-4' }, item.weightGr),
                    React.createElement('td', { className: 'p-4' }, formatCurrency(item.purchaseValue)),
                    React.createElement('td', { className: 'p-4 font-bold' }, formatCurrency(item.currentValue)),
                    React.createElement('td', { className: `p-4 font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}` }, formatCurrency(gain)),
                    React.createElement('td', { className: 'p-4' },
                      React.createElement('div', { className: 'flex gap-2' },
                        React.createElement('button', { onClick: () => handleEdit(item), className: 'text-slate-500 hover:text-blue-600' }, React.createElement(EditIcon, { className: 'w-5 h-5' })),
                        React.createElement('button', { onClick: () => handleDelete(item.id), className: 'text-slate-500 hover:text-red-600' }, React.createElement(DeleteIcon, { className: 'w-5 h-5' }))
                      )
                    )
                  )
                })
              )
            )
          )
        ),
        isModalOpen && React.createElement(GoldModal, { onClose: () => { setModalOpen(false); setEditingHolding(null); }, onSave: handleSave, holding: editingHolding })
      )
    );
  };

  const GoldModal = ({ onClose, onSave, holding }) => {
    const [formData, setFormData] = useState({
      name: holding?.name || '',
      purchaseDate: holding?.purchaseDate || new Date().toISOString().split('T')[0],
      weightGr: holding?.weightGr || '',
      purchaseValue: holding?.purchaseValue || '',
      currentValue: holding?.currentValue || ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        ...formData,
        weightGr: parseFloat(formData.weightGr),
        purchaseValue: parseFloat(formData.purchaseValue),
        currentValue: parseFloat(formData.currentValue)
      });
    };
    
    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-xl p-6 w-full max-w-md' },
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 mb-4' }, holding ? 'Edit Gold Holding' : 'Add Gold Holding'),
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement(InputField, { label: "Name", name: "name", value: formData.name, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Purchase Date", name: "purchaseDate", type: "date", value: formData.purchaseDate, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Weight (grams)", name: "weightGr", type: "number", value: formData.weightGr, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Purchase Value (₹)", name: "purchaseValue", type: "number", value: formData.purchaseValue, onChange: handleChange, required: true }),
          React.createElement(InputField, { label: "Current Value (₹)", name: "currentValue", type: "number", value: formData.currentValue, onChange: handleChange, required: true }),
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

  window.MySelvam.components.Gold = Gold;
})();
