(() => {
  const { useState, useMemo } = React;

  const Assets = ({ assets, setAssets }) => {
    const { Card, PlusIcon, EditIcon, DeleteIcon } = window.MySelvam.components;
    const { formatCurrency } = window.MySelvam.utils;

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);

    const summary = useMemo(() => {
      if (assets.length === 0) {
          return { totalValue: 0, overallCAGR: 0 };
      }
      const totalValue = assets.reduce((acc, item) => acc + item.currentValue, 0);
      const totalPurchaseValue = assets.reduce((acc, item) => acc + item.purchaseValue, 0);
      
      const earliestPurchaseDate = assets.reduce((earliest, asset) => {
        const assetDate = new Date(asset.purchaseDate);
        return assetDate < earliest ? assetDate : earliest;
      }, new Date());

      const years = (new Date() - earliestPurchaseDate) / (1000 * 60 * 60 * 24 * 365.25);
      if (years <= 0 || totalPurchaseValue <= 0) {
        return { totalValue, overallCAGR: 0 };
      }
      const overallCAGR = ((Math.pow(totalValue / totalPurchaseValue, 1 / years) - 1) * 100);
      
      return { totalValue, overallCAGR };
    }, [assets]);

    const calculateCAGR = (asset) => {
        const years = (new Date() - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25);
        if (years <= 0 || asset.purchaseValue <= 0) {
            return 0;
        }
        return ((Math.pow(asset.currentValue / asset.purchaseValue, 1 / years) - 1) * 100);
    };

    const handleSave = (asset) => {
      if (editingAsset) {
        setAssets(assets.map(a => a.id === editingAsset.id ? { ...a, ...asset } : a));
      } else {
        setAssets([...assets, { ...asset, id: `a${Date.now()}` }]);
      }
      setModalOpen(false);
      setEditingAsset(null);
    };

    const handleEdit = (asset) => {
      setEditingAsset(asset);
      setModalOpen(true);
    };

    const handleDelete = (id) => {
      setAssets(assets.filter(a => a.id !== id));
    };
    
    const tableHeaders = ["Name", "Type", "Purchase Date", "Purchase Value", "Current Value", "CAGR (%)", "Actions"];

    return (
      React.createElement('div', null,
        React.createElement('div', { className: 'flex justify-between items-center mb-6' },
          React.createElement('h1', { className: 'text-3xl font-bold text-slate-800' }, 'Other Assets'),
          React.createElement('button', {
            onClick: () => { setEditingAsset(null); setModalOpen(true); },
            className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center'
          }, React.createElement(PlusIcon, {className: 'w-5 h-5 mr-2'}), 'Add Asset')
        ),

        React.createElement(Card, { className: 'mb-6' },
          React.createElement('div', { className: 'grid grid-cols-2 gap-4 text-center' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-md font-semibold text-slate-600' }, 'Total Asset Value'),
              React.createElement('p', { className: 'text-2xl font-bold text-slate-900 mt-1' }, formatCurrency(summary.totalValue))
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-md font-semibold text-slate-600' }, 'Overall CAGR'),
              React.createElement('p', { className: `text-2xl font-bold mt-1 ${summary.overallCAGR >= 0 ? 'text-green-600' : 'text-red-600'}` }, `${summary.overallCAGR.toFixed(2)} %`)
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
                assets.map(item => {
                  const cagr = calculateCAGR(item);
                  return React.createElement('tr', { key: item.id, className: 'border-b' },
                    React.createElement('td', { className: 'p-4 font-semibold' }, item.name),
                    React.createElement('td', { className: 'p-4' }, item.type),
                    React.createElement('td', { className: 'p-4' }, item.purchaseDate),
                    React.createElement('td', { className: 'p-4' }, formatCurrency(item.purchaseValue)),
                    React.createElement('td', { className: 'p-4 font-bold' }, formatCurrency(item.currentValue)),
                    React.createElement('td', { className: `p-4 font-semibold ${cagr >= 0 ? 'text-green-600' : 'text-red-600'}` }, `${cagr.toFixed(2)} %`),
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
        isModalOpen && React.createElement(AssetModal, { onClose: () => { setModalOpen(false); setEditingAsset(null); }, onSave: handleSave, asset: editingAsset })
      )
    );
  };

  const AssetModal = ({ onClose, onSave, asset }) => {
    const [formData, setFormData] = useState({
      name: asset?.name || '',
      type: asset?.type || 'Real Estate',
      purchaseDate: asset?.purchaseDate || new Date().toISOString().split('T')[0],
      purchaseValue: asset?.purchaseValue || '',
      currentValue: asset?.currentValue || ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        ...formData,
        purchaseValue: parseFloat(formData.purchaseValue),
        currentValue: parseFloat(formData.currentValue)
      });
    };
    
    const assetTypes = ['Real Estate', 'Retirement Fund', 'Stock', 'Other'];

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-xl p-6 w-full max-w-md' },
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 mb-4' }, asset ? 'Edit Asset' : 'Add Asset'),
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement(InputField, { label: "Name", name: "name", value: formData.name, onChange: handleChange, required: true }),
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-1' }, 'Asset Type'),
            React.createElement('select', { name: 'type', value: formData.type, onChange: handleChange, className: 'w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500' },
              assetTypes.map(cat => React.createElement('option', { key: cat, value: cat }, cat))
            )
          ),
          React.createElement(InputField, { label: "Purchase Date", name: "purchaseDate", type: "date", value: formData.purchaseDate, onChange: handleChange, required: true }),
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

  window.MySelvam.components.Assets = Assets;
})();
