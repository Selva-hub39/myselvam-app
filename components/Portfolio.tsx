import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, RupeeIcon, EyeIcon, CoinsIcon } from './common/Icons';
import type { MutualFund, Transaction } from '../types';
import { calculateXIRR } from '../utils/finance';
import type { CashFlow } from '../types';
// In a real app, you'd use a library like pdf.js
// For this example, we'll simulate the parsing.
import { parseCamsStatement } from '../utils/casParser';

interface PortfolioProps {
    funds: MutualFund[];
    setFunds: React.Dispatch<React.SetStateAction<MutualFund[]>>;
}

// --- Helper Modals ---

const AddFundModal: React.FC<{ onSave: (fund: Omit<MutualFund, 'id' | 'transactions'>) => void; onClose: () => void; }> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [owner, setOwner] = useState<'Self' | 'Spouse'>('Self');
    const [sipAmount, setSipAmount] = useState('');
    const [sipStartDate, setSipStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentValue, setCurrentValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sipAmountNum = parseFloat(sipAmount);
        const currentValueNum = parseFloat(currentValue);
        
        if (!name || isNaN(currentValueNum) || currentValueNum < 0) return;

        onSave({
            name,
            owner,
            currentValue: currentValueNum,
            sipAmount: isNaN(sipAmountNum) ? undefined : sipAmountNum,
            sipStartDate: sipAmountNum > 0 ? sipStartDate : undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add New Fund</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm">Fund Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1" />
                    </div>
                     <div>
                        <label className="text-sm">Owner</label>
                         <select value={owner} onChange={e => setOwner(e.target.value as 'Self' | 'Spouse')} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1">
                            <option value="Self">Self</option>
                            <option value="Spouse">Spouse</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm">SIP Amount (Monthly)</label>
                            <input type="number" placeholder="Optional" value={sipAmount} onChange={e => setSipAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1" />
                        </div>
                        <div>
                            <label className="text-sm">SIP Start Date</label>
                            <input type="date" value={sipStartDate} onChange={e => setSipStartDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1" disabled={!sipAmount} />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm">Initial Current Value</label>
                        <input type="number" placeholder="e.g., 50000" value={currentValue} onChange={e => setCurrentValue(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-teal-500">Add Fund</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const AddLumpsumModal: React.FC<{ fund: MutualFund; onSave: (fundId: string, transaction: Transaction) => void; onClose: () => void; }> = ({ fund, onSave, onClose }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [units, setUnits] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = parseFloat(amount);
        const unitsNum = parseFloat(units);
        const priceNum = parseFloat(price);

        if (isNaN(amountNum) || amountNum <= 0 || !date) {
            // Basic validation
            return;
        }

        const newTransaction: Transaction = {
            date,
            amount: amountNum,
            units: isNaN(unitsNum) ? 0 : unitsNum,
            price: isNaN(priceNum) ? 0 : priceNum,
            description: 'Lumpsum Purchase',
            type: 'Purchase',
        };
        onSave(fund.id, newTransaction);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Add Lumpsum to</h3>
                <p className="text-slate-500 mb-4">{fund.name}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="text-sm">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                    </div>
                     <div>
                        <label className="text-sm">Amount</label>
                        <input type="number" placeholder="e.g., 50000" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm">Units (Optional)</label>
                            <input type="number" placeholder="e.g., 510.5" value={units} onChange={e => setUnits(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                        </div>
                         <div>
                            <label className="text-sm">NAV/Price (Optional)</label>
                            <input type="number" placeholder="e.g., 97.94" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-md mt-1"/>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-teal-500">Add Transaction</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const UpdateValueModal: React.FC<{ fund: MutualFund; onSave: (fundId: string, newValue: number) => void; onClose: () => void; }> = ({ fund, onSave, onClose }) => {
    const [currentValue, setCurrentValue] = useState(fund.currentValue.toString());
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const value = parseFloat(currentValue);
        if (!isNaN(value)) {
            onSave(fund.id, value);
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-2">Update Value for</h3>
                <p className="text-slate-500 mb-4">{fund.name}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-teal-500">Save</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const TransactionHistoryModal: React.FC<{ fund: MutualFund; onClose: () => void; }> = ({ fund, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                <p className="text-slate-500 mb-4">{fund.name}</p>
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="p-2">Date</th>
                                <th className="p-2">Description</th>
                                <th className="p-2 text-right">Amount</th>
                                <th className="p-2 text-right">Units</th>
                                <th className="p-2 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fund.transactions.map((tx, index) => (
                                <tr key={index} className="border-b dark:border-slate-600">
                                    <td className="p-2">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                                    <td className="p-2">{tx.description}</td>
                                    <td className="p-2 text-right">₹{tx.amount.toLocaleString('en-IN')}</td>
                                    <td className="p-2 text-right">{tx.units.toFixed(4)}</td>
                                    <td className="p-2 text-right">₹{tx.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="flex justify-end mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Close</button>
                </div>
            </Card>
        </div>
    );
};

const ImportCasModal: React.FC<{ onImport: (parsedFunds: MutualFund[]) => void; onClose: () => void; }> = ({ onImport, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a PDF file.');
            return;
        }
        if (!password) {
            setError('Please enter the statement password.');
            return;
        }
        
        setIsLoading(true);
        setError('');

        try {
            // Simulate reading file and parsing
            // In a real app, this would involve a PDF library
            const parsedData = await parseCamsStatement(file, password);
            onImport(parsedData);
        } catch (err) {
            setError((err as Error).message || 'Failed to parse statement.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Import CAMS/KFintech Statement</h3>
                <p className="text-sm text-slate-500 mb-4">Upload your password-protected consolidated statement PDF. All processing happens securely in your browser.</p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="file" onChange={handleFileChange} accept=".pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                    <input type="password" placeholder="Statement Password (PAN)" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-sky-500" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Import'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


// --- Main Component ---

const Portfolio: React.FC<PortfolioProps> = ({ funds, setFunds }) => {
    const [filter, setFilter] = useState<'All' | 'Self' | 'Spouse'>('All');
    const [modal, setModal] = useState<'none' | 'import' | 'update' | 'history' | 'lumpsum' | 'addFund'>('none');
    const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
    
    const filteredFunds = funds.filter(fund => filter === 'All' || fund.owner === filter);

    const { totalInvested, totalCurrentValue, portfolioXIRR } = useMemo(() => {
        let totalInvested = 0;
        let totalCurrentValue = 0;
        const allCashflows: CashFlow[] = [];

        filteredFunds.forEach(fund => {
            const investedInFund = fund.transactions
                .filter(tx => tx.type === 'Purchase' || tx.type === 'SIP' || tx.type === 'Dividend Reinvestment')
                .reduce((sum, tx) => sum + tx.amount, 0);
            
            totalInvested += investedInFund;
            totalCurrentValue += fund.currentValue;

            fund.transactions.forEach(tx => {
                if(tx.type !== 'Redemption') {
                   allCashflows.push({ amount: -tx.amount, date: new Date(tx.date) });
                }
            });
        });
        
        if (totalCurrentValue > 0) {
            allCashflows.push({ amount: totalCurrentValue, date: new Date() });
        }

        const xirr = calculateXIRR(allCashflows) * 100;
        
        return {
            totalInvested,
            totalCurrentValue,
            portfolioXIRR: isNaN(xirr) || !isFinite(xirr) ? 0 : xirr,
        };
    }, [filteredFunds]);

    const totalGain = totalCurrentValue - totalInvested;
    
    const handleAddFund = (newFundData: Omit<MutualFund, 'id' | 'transactions'>) => {
        const newFund: MutualFund = {
            ...newFundData,
            id: Date.now().toString(),
            transactions: [],
        };
        setFunds(prev => [newFund, ...prev]);
        setModal('none');
    };

    const handleUpdateValue = (fundId: string, newValue: number) => {
        setFunds(prev => prev.map(f => f.id === fundId ? { ...f, currentValue: newValue } : f));
        setModal('none');
        setSelectedFund(null);
    };

    const handleAddLumpsum = (fundId: string, transaction: Transaction) => {
        setFunds(prev => prev.map(f => {
            if (f.id === fundId) {
                const updatedTransactions = [...f.transactions, transaction]
                    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return { ...f, transactions: updatedTransactions };
            }
            return f;
        }));
        setModal('none');
        setSelectedFund(null);
    };

    const handleImportFunds = (parsedFunds: MutualFund[]) => {
        setFunds(prevFunds => {
            const fundsMap = new Map(prevFunds.map(f => [f.name.toLowerCase(), f]));
            
            parsedFunds.forEach(newFund => {
                const existingFund = fundsMap.get(newFund.name.toLowerCase());
                if (existingFund) {
                    // Merge transactions, avoiding duplicates
                    const existingTxDates = new Set(existingFund.transactions.map(tx => `${tx.date}-${tx.amount}`));
                    const newUniqueTxs = newFund.transactions.filter(tx => !existingTxDates.has(`${tx.date}-${tx.amount}`));
                    existingFund.transactions.push(...newUniqueTxs);
                    existingFund.transactions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                } else {
                    fundsMap.set(newFund.name.toLowerCase(), newFund);
                }
            });
            return Array.from(fundsMap.values());
        });
        setModal('none');
    };

    const getFundXIRR = (fund: MutualFund) => {
        const cashflows: CashFlow[] = fund.transactions.map(tx => ({
            amount: -tx.amount,
            date: new Date(tx.date),
        }));
        if(fund.currentValue > 0) {
            cashflows.push({ amount: fund.currentValue, date: new Date() });
        }
        const xirr = calculateXIRR(cashflows) * 100;
        return isNaN(xirr) || !isFinite(xirr) ? 0 : xirr;
    };

    return (
        <div className="space-y-6">
            {modal === 'addFund' && <AddFundModal onSave={handleAddFund} onClose={() => setModal('none')} />}
            {modal === 'update' && selectedFund && <UpdateValueModal fund={selectedFund} onSave={handleUpdateValue} onClose={() => setModal('none')} />}
            {modal === 'history' && selectedFund && <TransactionHistoryModal fund={selectedFund} onClose={() => setModal('none')} />}
            {modal === 'import' && <ImportCasModal onImport={handleImportFunds} onClose={() => setModal('none')} />}
            {modal === 'lumpsum' && selectedFund && <AddLumpsumModal fund={selectedFund} onSave={handleAddLumpsum} onClose={() => setModal('none')} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Mutual Fund Portfolio</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setModal('import')} className="flex items-center px-3 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition-colors text-sm">
                        <UploadIcon className="mr-2" /> Import Statement
                    </button>
                    <button onClick={() => setModal('addFund')} className="flex items-center px-3 py-2 rounded-lg text-white bg-teal-500 hover:bg-teal-600 transition-colors text-sm">
                        <PlusIcon className="mr-2" /> Add Fund
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card><p className="text-sm text-slate-500">Current Value</p><p className="text-2xl font-bold">₹{totalCurrentValue.toLocaleString('en-IN')}</p></Card>
                <Card><p className="text-sm text-slate-500">Invested</p><p className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</p></Card>
                <Card><p className="text-sm text-slate-500">Total Gain</p><p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{totalGain.toLocaleString('en-IN')}</p></Card>
                <Card><p className="text-sm text-slate-500">Portfolio XIRR</p><p className={`text-2xl font-bold ${portfolioXIRR >= 0 ? 'text-green-500' : 'text-red-500'}`}>{portfolioXIRR.toFixed(2)}%</p></Card>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Holdings</h3>
                    <div className="flex space-x-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                        <button onClick={() => setFilter('All')} className={`px-3 py-1 rounded-md text-sm ${filter === 'All' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>All</button>
                        <button onClick={() => setFilter('Self')} className={`px-3 py-1 rounded-md text-sm ${filter === 'Self' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Self</button>
                        <button onClick={() => setFilter('Spouse')} className={`px-3 py-1 rounded-md text-sm ${filter === 'Spouse' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Spouse</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {filteredFunds.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="text-sm text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                                <tr>
                                    <th className="p-2">Fund Name</th>
                                    <th className="p-2 text-right">Current Value</th>
                                    <th className="p-2 text-right">Invested</th>
                                    <th className="p-2 text-right">XIRR %</th>
                                    <th className="p-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFunds.map(fund => {
                                    const invested = fund.transactions.reduce((sum, tx) => tx.type !== 'Redemption' ? sum + tx.amount : sum, 0);
                                    const xirr = getFundXIRR(fund);
                                    return (
                                        <tr key={fund.id} className="border-b dark:border-slate-700 last:border-b-0">
                                            <td className="p-2 font-medium">{fund.name}<span className="text-xs text-slate-400 ml-2">{fund.owner}</span></td>
                                            <td className="p-2 text-right font-semibold">₹{fund.currentValue.toLocaleString('en-IN')}</td>
                                            <td className="p-2 text-right text-slate-500">₹{invested.toLocaleString('en-IN')}</td>
                                            <td className={`p-2 text-right font-medium ${xirr >= 0 ? 'text-green-500' : 'text-red-500'}`}>{xirr.toFixed(2)}%</td>
                                            <td className="p-2">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => { setSelectedFund(fund); setModal('history'); }} className="p-1 text-slate-500 hover:text-teal-500" title="View Transactions"><EyeIcon /></button>
                                                    <button onClick={() => { setSelectedFund(fund); setModal('update'); }} className="p-1 text-slate-500 hover:text-sky-500" title="Update Value"><RupeeIcon /></button>
                                                    <button onClick={() => { setSelectedFund(fund); setModal('lumpsum'); }} className="p-1 text-slate-500 hover:text-yellow-500" title="Add Lumpsum"><CoinsIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                         <div className="text-center py-8 text-slate-500">No funds found. Try importing a statement.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Portfolio;