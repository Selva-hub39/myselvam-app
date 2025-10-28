import React, { useState, useMemo } from 'react';
// FIX: Changed import path to be relative.
import type { Expense, Budget as BudgetType } from '../types';
import Card from './common/Card';
// FIX: Changed import path to be relative.
import { PlusIcon, TrashIcon, YearIcon } from './common/Icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


// --- Helper Components ---

const YTD_Summary_Modal: React.FC<{
    expenses: Expense[];
    onClose: () => void;
}> = ({ expenses, onClose }) => {
    const { ytdSpendingData, totalYTDSpent, currentMonthName } = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthName = now.toLocaleString('default', { month: 'long' });

        const expensesForYear = expenses.filter(exp => new Date(exp.date).getFullYear() === currentYear);

        const spendingByCategory = expensesForYear.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as { [key: string]: number });

        const ytdSpendingData = Object.entries(spendingByCategory)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
        
        const totalYTDSpent = ytdSpendingData.reduce((sum, item) => sum + item.value, 0);

        return { ytdSpendingData, totalYTDSpent, currentMonthName };
    }, [expenses]);

    const COLORS = ['#0d9488', '#0ea5e9', '#facc15', '#f43f5e', '#8b5cf6', '#ec4899', '#64748b'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-semibold">Year-to-Date Summary</h3>
                        <p className="text-slate-500">Jan - {currentMonthName} {new Date().getFullYear()}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Total Spent YTD</p>
                        <p className="text-4xl font-bold text-red-500 mb-6">₹{totalYTDSpent.toLocaleString('en-IN')}</p>
                        <div className="space-y-2">
                           {ytdSpendingData.sort((a,b) => b.value - a.value).map((item, index) => (
                               <div key={item.name} className="flex justify-between items-center text-sm">
                                   <div className="flex items-center">
                                       <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                       <span>{item.name}</span>
                                   </div>
                                   <span className="font-medium">₹{item.value.toLocaleString('en-IN')}</span>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        {ytdSpendingData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={ytdSpendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5}>
                                        {ytdSpendingData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">No spending this year.</div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Close</button>
                </div>
            </Card>
        </div>
    );
};


type EditableBudget = {
    originalCategory: string;
    category: string;
    amount: number;
    isNew: boolean;
};

const BudgetEditModal: React.FC<{
    budgets: BudgetType[];
    onSave: (updatedBudgets: BudgetType[], renames: Map<string, string>) => void;
    onClose: () => void;
}> = ({ budgets, onSave, onClose }) => {
    const [localBudgets, setLocalBudgets] = useState<EditableBudget[]>(() => 
        budgets.map(b => ({ originalCategory: b.category, category: b.category, amount: b.amount, isNew: false }))
    );
    const [newCategory, setNewCategory] = useState('');

    const handleCategoryNameChange = (index: number, newName: string) => {
        setLocalBudgets(prev =>
            prev.map((b, i) => i === index ? { ...b, category: newName } : b)
        );
    };

    const handleBudgetAmountChange = (index: number, amount: string) => {
        const newAmount = parseFloat(amount) || 0;
        setLocalBudgets(prev =>
            prev.map((b, i) => i === index ? { ...b, amount: newAmount } : b)
        );
    };

    const handleRemoveCategory = (index: number) => {
        setLocalBudgets(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddNewCategory = () => {
        if (newCategory && !localBudgets.some(b => b.category.toLowerCase() === newCategory.toLowerCase())) {
            const newBudget: EditableBudget = {
                originalCategory: '',
                category: newCategory,
                amount: 0,
                isNew: true,
            };
            setLocalBudgets(prev => [...prev, newBudget]);
            setNewCategory('');
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalBudgets: BudgetType[] = localBudgets
            .filter(b => b.category.trim() !== '')
            .map(({ category, amount }) => ({ category, amount }));
        
        const renames = new Map<string, string>();
        localBudgets.forEach(b => {
            if (!b.isNew && b.originalCategory !== b.category) {
                renames.set(b.originalCategory, b.category);
            }
        });

        onSave(finalBudgets, renames);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4">Set Monthly Budgets</h3>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto p-1">
                    {localBudgets.map((budget, index) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                            <input
                                type="text"
                                value={budget.category}
                                onChange={e => handleCategoryNameChange(index, e.target.value)}
                                className="flex-grow bg-slate-100 dark:bg-slate-700 p-2 rounded-md"
                            />
                            <div className="flex items-center">
                                <span className="mr-2 text-slate-500">₹</span>
                                <input
                                    type="number"
                                    value={budget.amount}
                                    onChange={e => handleBudgetAmountChange(index, e.target.value)}
                                    className="w-28 bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-right"
                                />
                            </div>
                            <button onClick={() => handleRemoveCategory(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 pt-4 border-t dark:border-slate-600">
                    <h4 className="font-semibold mb-2">Add New Category</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Category Name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-grow bg-slate-100 dark:bg-slate-700 p-2 rounded-md"
                        />
                        <button type="button" onClick={handleAddNewCategory} className="px-4 py-2 rounded-md text-white bg-sky-500 hover:bg-sky-600">Add</button>
                    </div>
                </div>
                 <div className="flex justify-end space-x-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 rounded-md text-white bg-teal-500">Save</button>
                </div>
            </Card>
        </div>
    );
};


const QuickAddExpense: React.FC<{ categories: string[], onAdd: (expense: Omit<Expense, 'id'>) => void }> = ({ categories, onAdd }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories[0] || '');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount && category && date) {
            onAdd({
                amount: parseFloat(amount),
                category,
                notes,
                date,
                paymentMethod: 'UPI' // Default, can be expanded
            });
            setAmount('');
            setNotes('');
            setCategory(categories[0] || '');
        }
    };

    return (
        <Card>
            <h3 className="font-semibold mb-2">Quick Add Expense</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label className="text-sm">Amount</label>
                    <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                </div>
                 <div>
                    <label className="text-sm">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                </div>
                <div>
                    <label className="text-sm">Notes (Optional)</label>
                    <input type="text" placeholder="e.g., Lunch with team" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                </div>
                <button type="submit" className="w-full px-4 py-2 rounded-md text-white bg-teal-500 hover:bg-teal-600 self-end h-[42px] flex items-center justify-center">
                    <PlusIcon className="mr-2" /> Add
                </button>
            </form>
        </Card>
    );
};

// --- Main Component ---

interface ExpensesProps {
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    budgets: BudgetType[];
    setBudgets: React.Dispatch<React.SetStateAction<BudgetType[]>>;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, setExpenses, budgets, setBudgets }) => {
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showYTDModal, setShowYTDModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'budgets' | 'transactions'>('budgets');

    const expensesForMonth = useMemo(() => {
        return expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getFullYear() === currentDate.getFullYear() && expDate.getMonth() === currentDate.getMonth();
        });
    }, [expenses, currentDate]);

    const spendingByCategory = useMemo(() => {
        const spending: { [key: string]: number } = {};
        for (const expense of expensesForMonth) {
            spending[expense.category] = (spending[expense.category] || 0) + expense.amount;
        }
        return spending;
    }, [expensesForMonth]);

    const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...newExpenseData, id: Date.now().toString() };
        setExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    
    const handleSaveBudgets = (updatedBudgets: BudgetType[], renames: Map<string, string>) => {
        setBudgets(updatedBudgets);

        if (renames.size > 0) {
            setExpenses(prevExpenses =>
                prevExpenses.map(exp => {
                    if (renames.has(exp.category)) {
                        return { ...exp, category: renames.get(exp.category)! };
                    }
                    return exp;
                })
            );
        }
        setShowBudgetModal(false);
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + (amount || 0), 0);
    const remaining = totalBudget - totalSpent;

    const spendingData = Object.entries(spendingByCategory)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0);
    
    const COLORS = ['#0d9488', '#0ea5e9', '#facc15', '#f43f5e', '#8b5cf6', '#ec4899', '#64748b'];

    return (
        <div className="space-y-6">
            {showBudgetModal && <BudgetEditModal budgets={budgets} onSave={handleSaveBudgets} onClose={() => setShowBudgetModal(false)} />}
            {showYTDModal && <YTD_Summary_Modal expenses={expenses} onClose={() => setShowYTDModal(false)} />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Expenses</h2>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-l-lg hover:bg-slate-200 dark:hover:bg-slate-700">{"<"}</button>
                        <span className="font-semibold w-32 text-center px-2">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-r-lg hover:bg-slate-200 dark:hover:bg-slate-700">{">"}</button>
                    </div>
                     <button onClick={() => setShowYTDModal(true)} className="flex items-center px-3 py-2 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 transition-colors text-sm">
                        <YearIcon className="mr-2" /> YTD Summary
                    </button>
                     <button onClick={() => setShowBudgetModal(true)} className="px-3 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition-colors text-sm">
                        Edit Budgets
                    </button>
                </div>
            </div>

            <QuickAddExpense categories={budgets.map(b => b.category)} onAdd={handleAddExpense} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">Total Budget</p>
                            <p className="text-2xl font-bold">₹{totalBudget.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">Spent</p>
                            <p className="text-2xl font-bold text-red-500">₹{totalSpent.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">Remaining</p>
                            <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{remaining.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}></div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                    <div style={{ width: '100%', height: 180 }}>
                        {spendingData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={spendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                        {spendingData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">No spending this month.</div>
                        )}
                    </div>
                </Card>
            </div>

            <div>
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('budgets')} className={`py-2 px-4 font-semibold ${activeTab === 'budgets' ? 'border-b-2 border-teal-500 text-teal-500' : 'text-slate-500'}`}>Budgets</button>
                        <button onClick={() => setActiveTab('transactions')} className={`py-2 px-4 font-semibold ${activeTab === 'transactions' ? 'border-b-2 border-teal-500 text-teal-500' : 'text-slate-500'}`}>Transactions</button>
                    </nav>
                </div>
                <div className="mt-6">
                    {activeTab === 'budgets' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {budgets.map(budget => {
                                if(budget.amount === 0) return null;
                                const spent = spendingByCategory[budget.category] || 0;
                                const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                                const remaining = budget.amount - spent;
                                let barColor = 'bg-teal-500';
                                if (percentage > 100) barColor = 'bg-red-500';
                                else if (percentage > 75) barColor = 'bg-yellow-500';

                                return (
                                    <div key={budget.category}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium">{budget.category}</span>
                                            <span className="text-sm text-slate-500">₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div className={`${barColor} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                        </div>
                                         <p className={`text-xs mt-1 text-right ${remaining < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                            {remaining >= 0 ? `₹${remaining.toLocaleString()} left` : `₹${Math.abs(remaining).toLocaleString()} over`}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {activeTab === 'transactions' && (
                        <div className="space-y-3">
                            {expensesForMonth.length > 0 ? expensesForMonth.map(exp => (
                                <div key={exp.id} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <div>
                                        <p className="font-medium">{exp.category}</p>
                                        <p className="text-sm text-slate-500">{new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {exp.notes && `- ${exp.notes}`}</p>
                                    </div>
                                    <p className="font-bold text-lg">₹{exp.amount.toLocaleString()}</p>
                                </div>
                            )) : <p className="text-center text-slate-500 py-8">No transactions this month.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;