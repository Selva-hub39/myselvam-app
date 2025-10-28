(() => {
  const { useState, useMemo } = React;

  const Portfolio = ({ funds, setFunds }) => {
    const { Card, EditIcon, DeleteIcon, RupeeIcon, EyeIcon, PlusIcon, CoinsIcon, UploadIcon } = window.MySelvam.components;
    const { formatCurrency, calculateXIRR, parseCamsStatement, generateMissingSipTransactions } = window.MySelvam.utils;

    const [isAddFundModalOpen, setAddFundModalOpen] = useState(false);
    const [isAddLumpsumModalOpen, setAddLumpsumModalOpen] = useState(false);
    const [isUpdateValueModalOpen, setUpdateValueModalOpen] = useState(false);
    const [isViewTxModalOpen, setViewTxModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [selectedFund, setSelectedFund] = useState(null);

    const portfolioSummary = useMemo(() => {
      const totalCurrentValue = funds.reduce((acc, fund) => acc + fund.currentValue, 0);
      const totalInvested = funds.reduce((acc, fund) => acc + (fund.transactions || []).reduce((sum, tx) => sum + tx.amount, 0), 0);
      const totalGain = totalCurrentValue - totalInvested;
      const allTransactions = funds.flatMap(f => (f.transactions || []).map(tx => ({...tx, amount: -tx.amount})));
      const portfolioXIRR = calculateXIRR(allTransactions, totalCurrentValue);

      return { totalCurrentValue, totalInvested, totalGain, portfolioXIRR };
    }, [funds]);
    
    // Handlers
    const handleAddFund = (newFundData) => {
        const newFund = {
            id: `mf${Date.now()}`,
            ...newFundData,
            transactions: []
        };
        const fundWithHistory = generateMissingSipTransactions(newFund);
        setFunds(prev => [...prev, fundWithHistory]);
        setAddFundModalOpen(false);
    };

    const handleAddLumpsum = (lumpsumData) => {
        setFunds(prev => prev.map(f => {
            if (f.id === selectedFund.id) {
                const newTx = {
                    date: lumpsumData.date,
                    description: 'Lumpsum',
                    amount: lumpsumData.amount,
                    units: lumpsumData.units,
                    nav: lumpsumData.nav,
                    type: 'purchase'
                };
                return { ...f, transactions: [...(f.transactions || []), newTx] };
            }
            return f;
        }));
        setAddLumpsumModalOpen(false);
    };

    const handleUpdateValue = (newValue) => {
        setFunds(prev => prev.map(f => f.id === selectedFund.id ? { ...f, currentValue: newValue } : f));
        setUpdateValueModalOpen(false);
    };

    const handleDeleteFund = (fundId) => {
        setFunds(prev => prev.filter(f => f.id !== fundId));
    };
    
    // UI Helpers
    const openModal = (modalSetter, fund) => {
      setSelectedFund(fund);
      modalSetter(true);
    };

    const tableHeaders = ["Fund Name", "Owner", "Invested", "Current Value", "Gain", "XIRR", "Actions"];

    return (
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-3xl font-bold text-slate-800 mb-6' }, 'Mutual Fund Portfolio'),
        
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
            React.createElement(SummaryCard, { title: "Current Value", value: formatCurrency(portfolioSummary.totalCurrentValue) }),
            React.createElement(SummaryCard, { title: "Invested", value: formatCurrency(portfolioSummary.totalInvested) }),
            React.createElement(SummaryCard, { title: "Total Gain", value: formatCurrency(portfolioSummary.totalGain), isPositive: portfolioSummary.totalGain >= 0 }),
            React.createElement(SummaryCard, { title: "Portfolio XIRR", value: `${portfolioSummary.portfolioXIRR.toFixed(2)} %`, isPositive: portfolioSummary.portfolioXIRR >= 0 })
        ),
        
        React.createElement('div', { className: 'flex justify-end gap-2 mb-4' },
            React.createElement('button', {
                onClick: () => setImportModalOpen(true),
                className: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center'
            }, React.createElement(UploadIcon, {className: 'w-5 h-5 mr-2'}), 'Import Statement'),
            React.createElement('button', {
                onClick: () => setAddFundModalOpen(true),
                className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center'
            }, React.createElement(PlusIcon, {className: 'w-5 h-5 mr-2'}), 'Add Fund')
        ),

        React.createElement(Card, null,
          React.createElement('div', { className: 'overflow-x-auto' },
            React.createElement('table', { className: 'w-full text-left' },
              React.createElement('thead', null, 
                React.createElement('tr', { className: 'border-b bg-slate-50' },
                  tableHeaders.map(h => React.createElement('th', { key: h, className: 'p-4 text-sm font-semibold text-slate-600' }, h))
                )
              ),
              React.createElement('tbody', null,
                funds.map(fund => {
                  const invested = (fund.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
                  const gain = fund.currentValue - invested;
                  const fundXIRR = calculateXIRR((fund.transactions || []).map(tx => ({...tx, amount: -tx.amount})), fund.currentValue);
                  
                  return React.createElement('tr', { key: fund.id, className: 'border-b' },
                    React.createElement('td', { className: 'p-4 font-semibold' }, fund.name),
                    React.createElement('td', { className: 'p-4' }, fund.owner),
                    React.createElement('td', { className: 'p-4' }, formatCurrency(invested)),
                    React.createElement('td', { className: 'p-4 font-bold' }, formatCurrency(fund.currentValue)),
                    React.createElement('td', { className: `p-4 font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}` }, formatCurrency(gain)),
                    React.createElement('td', { className: `p-4 font-semibold ${fundXIRR >= 0 ? 'text-green-600' : 'text-red-600'}` }, `${fundXIRR.toFixed(2)} %`),
                    React.createElement('td', { className: 'p-4' },
                      React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement(ActionButton, { icon: CoinsIcon, onClick: () => openModal(setAddLumpsumModalOpen, fund), title: "Add Lumpsum" }),
                        React.createElement(ActionButton, { icon: RupeeIcon, onClick: () => openModal(setUpdateValueModalOpen, fund), title: "Update Value" }),
                        React.createElement(ActionButton, { icon: EyeIcon, onClick: () => openModal(setViewTxModalOpen, fund), title: "View Transactions" }),
                        React.createElement(ActionButton, { icon: DeleteIcon, onClick: () => handleDeleteFund(fund.id), title: "Delete" })
                      )
                    )
                  )
                })
              )
            )
          )
        ),
        
        isAddFundModalOpen && React.createElement(AddFundModal, { onClose: () => setAddFundModalOpen(false), onSave: handleAddFund }),
        isAddLumpsumModalOpen && React.createElement(AddLumpsumModal, { fund: selectedFund, onClose: () => setAddLumpsumModalOpen(false), onSave: handleAddLumpsum }),
        isUpdateValueModalOpen && React.createElement(UpdateValueModal, { fund: selectedFund, onClose: () => setUpdateValueModalOpen(false), onSave: handleUpdateValue }),
        isViewTxModalOpen && React.createElement(ViewTransactionsModal, { fund: selectedFund, onClose: () => setViewTxModalOpen(false) }),
        isImportModalOpen && React.createElement(ImportStatementModal, { onClose: () => setImportModalOpen(false), setFunds: setFunds })
      )
    );
  };
  
  // Helper components
  const SummaryCard = ({ title, value, isPositive }) => (
    React.createElement(window.MySelvam.components.Card, { className: 'text-center' },
      React.createElement('h3', { className: 'text-md font-semibold text-slate-600' }, title),
      React.createElement('p', { className: `text-2xl font-bold mt-1 ${isPositive === true ? 'text-green-600' : isPositive === false ? 'text-red-600' : 'text-slate-900'}` }, value)
    )
  );
  
  const ActionButton = ({ icon: Icon, onClick, title }) => (
    React.createElement('button', { onClick: onClick, className: 'text-slate-500 hover:text-slate-800', title: title },
      React.createElement(Icon, { className: 'w-5 h-5' })
    )
  );

  // Modals
    const Modal = ({ children, title, onClose }) => (
        React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
            React.createElement('div', { className: 'bg-white rounded-lg shadow-xl p-6 w-full max-w-md' },
                React.createElement('div', { className: 'flex justify-between items-center mb-4' },
                    React.createElement('h2', { className: 'text-xl font-bold text-slate-800' }, title),
                    React.createElement('button', { onClick: onClose, className: 'text-slate-500 hover:text-slate-800' }, '✖')
                ),
                children
            )
        )
    );
    
    const AddFundModal = ({ onClose, onSave }) => {
        const [formData, setFormData] = useState({ name: '', owner: 'Self', sipAmount: '', sipStartDate: '', currentValue: ''});
        const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({
                name: formData.name,
                owner: formData.owner,
                currentValue: parseFloat(formData.currentValue),
                sipAmount: formData.sipAmount ? parseFloat(formData.sipAmount) : undefined,
                sipStartDate: formData.sipStartDate || undefined
            });
        };

        return React.createElement(Modal, { title: "Add New Fund", onClose: onClose },
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement(InputField, { label: "Fund Name", name: "name", value: formData.name, onChange: handleChange, required: true }),
                React.createElement(SelectField, { label: "Owner", name: "owner", value: formData.owner, onChange: handleChange, options: ["Self", "Spouse"]}),
                React.createElement(InputField, { label: "Current Value (₹)", name: "currentValue", type: "number", value: formData.currentValue, onChange: handleChange, required: true }),
                React.createElement('hr', {className: 'my-4'}),
                React.createElement('p', {className: 'text-sm text-slate-500 mb-2'}, 'Optional: Add SIP details for automatic tracking.'),
                React.createElement(InputField, { label: "SIP Amount (₹)", name: "sipAmount", type: "number", value: formData.sipAmount, onChange: handleChange }),
                React.createElement(InputField, { label: "SIP Start Date", name: "sipStartDate", type: "date", value: formData.sipStartDate, onChange: handleChange }),
                React.createElement('div', { className: 'flex justify-end gap-2 mt-6' },
                    React.createElement(CancelButton, { onClick: onClose }),
                    React.createElement(SaveButton, { text: "Add Fund" })
                )
            )
        );
    };

    const AddLumpsumModal = ({ fund, onClose, onSave }) => {
        const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], amount: '', units: '', nav: '' });
        const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({
                date: formData.date,
                amount: parseFloat(formData.amount),
                units: parseFloat(formData.units),
                nav: parseFloat(formData.nav)
            });
        };
        return React.createElement(Modal, { title: `Add Lumpsum to ${fund.name}`, onClose: onClose },
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement(InputField, { label: "Date", name: "date", type: "date", value: formData.date, onChange: handleChange, required: true }),
                React.createElement(InputField, { label: "Amount (₹)", name: "amount", type: "number", value: formData.amount, onChange: handleChange, required: true }),
                React.createElement(InputField, { label: "Units", name: "units", type: "number", value: formData.units, onChange: handleChange, required: true }),
                React.createElement(InputField, { label: "NAV", name: "nav", type: "number", value: formData.nav, onChange: handleChange, required: true }),
                React.createElement('div', { className: 'flex justify-end gap-2 mt-6' },
                    React.createElement(CancelButton, { onClick: onClose }),
                    React.createElement(SaveButton, { text: "Add Transaction" })
                )
            )
        );
    };

    const UpdateValueModal = ({ fund, onClose, onSave }) => {
        const [value, setValue] = useState(fund.currentValue);
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(parseFloat(value));
        };
        return React.createElement(Modal, { title: `Update Value for ${fund.name}`, onClose: onClose },
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement(InputField, { label: "Current Value (₹)", type: "number", value: value, onChange: (e) => setValue(e.target.value), required: true }),
                React.createElement('div', { className: 'flex justify-end gap-2 mt-6' },
                    React.createElement(CancelButton, { onClick: onClose }),
                    React.createElement(SaveButton, { text: "Update Value" })
                )
            )
        );
    };

    const ViewTransactionsModal = ({ fund, onClose }) => (
        React.createElement(Modal, { title: `Transactions for ${fund.name}`, onClose: onClose },
            React.createElement('div', { className: 'max-h-96 overflow-y-auto' },
                React.createElement('table', { className: 'w-full text-sm' },
                    React.createElement('thead', null, React.createElement('tr', { className: 'border-b' },
                        React.createElement('th', {className: 'p-2 text-left'}, 'Date'),
                        React.createElement('th', {className: 'p-2 text-left'}, 'Description'),
                        React.createElement('th', {className: 'p-2 text-right'}, 'Amount (₹)')
                    )),
                    React.createElement('tbody', null,
                        [...(fund.transactions || [])].sort((a,b) => new Date(b.date) - new Date(a.date)).map((tx, i) => (
                            React.createElement('tr', { key: i, className: 'border-b' },
                                React.createElement('td', {className: 'p-2'}, tx.date),
                                React.createElement('td', {className: 'p-2'}, tx.description),
                                React.createElement('td', {className: 'p-2 text-right'}, window.MySelvam.utils.formatCurrency(tx.amount))
                            )
                        ))
                    )
                )
            )
        )
    );
    
    const ImportStatementModal = ({ onClose, setFunds }) => {
        // This is a placeholder for a real implementation
        const handleImport = async () => {
            alert("This is a placeholder for the PDF import functionality. In a real app, you would select a CAMS/KFintech PDF, enter your PAN as the password, and the app would parse it.");
            onClose();
        };

        return React.createElement(Modal, { title: "Import CAMS/KFintech Statement", onClose: onClose},
            React.createElement('div', null, 
                React.createElement('p', {className: 'mb-4 text-slate-600'}, 'Upload your consolidated account statement (CAS) PDF to automatically import all your mutual fund transactions.'),
                React.createElement('div', {className: 'flex justify-end'},
                    React.createElement('button', {onClick: handleImport, className: 'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'}, 'Select PDF and Import')
                )
            )
        );
    };

    // Form field components
    const InputField = ({ label, ...props }) => (
        React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-1' }, label),
            React.createElement('input', { ...props, className: 'w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500' })
        )
    );

    const SelectField = ({ label, name, value, onChange, options }) => (
        React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-1' }, label),
            React.createElement('select', { name, value, onChange, className: 'w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500' },
                options.map(opt => React.createElement('option', { key: opt, value: opt }, opt))
            )
        )
    );

    const SaveButton = ({ text }) => React.createElement('button', { type: 'submit', className: 'bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700' }, text);
    const CancelButton = ({ onClick }) => React.createElement('button', { type: 'button', onClick: onClick, className: 'bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300' }, 'Cancel');

  window.MySelvam.components.Portfolio = Portfolio;
})();
