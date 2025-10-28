import React, { useState, useMemo } from 'react';
import Card from './common/Card.js';
import { PlusIcon, EditIcon, TrashIcon } from './common/Icons.js';
import { calculateFutureValueSIP, calculateFutureValueLumpSum } from '../utils/finance.js';

const GoalForm = ({ 
    onSave, 
    onClose, 
    existingGoal 
}) => {
    const [name, setName] = useState(existingGoal?.name || '');
    const [targetYear, setTargetYear] = useState(existingGoal?.targetYear || new Date().getFullYear() + 10);
    const [targetAmountToday, setTargetAmountToday] = useState(existingGoal?.targetAmountToday || '');
    const [inflationRate, setInflationRate] = useState(existingGoal?.inflationRate || '');
    const [linkedInvestments, setLinkedInvestments] = useState(existingGoal?.linkedInvestments || [{ schemeName: '', sipAmount: 0, lumpsumInvestment: 0 }]);

    const handleInvestmentChange = (index, field, value) => {
        const newInvestments = [...linkedInvestments];
        const numericValue = parseFloat(value);
        
        if (field === 'schemeName') {
            newInvestments[index][field] = value;
        } else if (!isNaN(numericValue)) {
            newInvestments[index][field] = numericValue;
        } else {
             newInvestments[index][field] = 0; // Default to 0 if input is invalid
        }
        setLinkedInvestments(newInvestments);
    };

    const addInvestmentRow = () => {
        setLinkedInvestments([...linkedInvestments, { schemeName: '', sipAmount: 0, lumpsumInvestment: 0 }]);
    };

    const removeInvestmentRow = (index) => {
        if (linkedInvestments.length > 1) {
            setLinkedInvestments(linkedInvestments.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const goalData = {
            id: existingGoal?.id || Date.now().toString(),
            name,
            targetYear: Number(targetYear),
            targetAmountToday: Number(targetAmountToday),
            inflationRate: Number(inflationRate),
            linkedInvestments: linkedInvestments.map(inv => ({
                ...inv,
                lumpsumInvestment: inv.lumpsumInvestment || 0 // Ensure it's a number
            }))
        };
        onSave(goalData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">{existingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Goal Name</label>
                            <input type="text" placeholder="e.g., Retirement" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Target Year</label>
                            <input type="number" value={targetYear} onChange={e => setTargetYear(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Target Amount (Today's Value)</label>
                            <input type="number" placeholder="e.g., 10000000" value={targetAmountToday} onChange={e => setTargetAmountToday(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Inflation Rate (%)</label>
                            <input type="number" placeholder="e.g., 6" value={inflationRate} onChange={e => setInflationRate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                        </div>
                    </div>

                    <div className="pt-4 border-t dark:border-slate-600">
                        <h4 className="font-semibold mb-2">Linked Investments</h4>
                        <div className="grid grid-cols-12 gap-2 mb-1 px-1 text-xs text-slate-500 font-medium">
                            <div className="col-span-5">Scheme Name</div>
                            <div className="col-span-3">SIP Amount (Monthly)</div>
                            <div className="col-span-3">Lumpsum</div>
                        </div>
                        {linkedInvestments.map((inv, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <input type="text" placeholder="Scheme Name" value={inv.schemeName} onChange={e => handleInvestmentChange(index, 'schemeName', e.target.value)} className="col-span-5 bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                                <input type="number" placeholder="0" value={inv.sipAmount} onChange={e => handleInvestmentChange(index, 'sipAmount', e.target.value)} className="col-span-3 bg-slate-100 dark:bg-slate-700 p-2 rounded" />
                                <input type="number" placeholder="0" value={inv.lumpsumInvestment || ''} onChange={e => handleInvestmentChange(index, 'lumpsumInvestment', e.target.value)} className="col-span-3 bg-slate-100 dark:bg-slate-700 p-2 rounded" />
                                <button type="button" onClick={() => removeInvestmentRow(index)} className="col-span-1 text-red-500 hover:text-red-700 disabled:opacity-50 flex justify-center" disabled={linkedInvestments.length <= 1}>
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addInvestmentRow} className="text-teal-500 font-medium text-sm mt-2 flex items-center">
                           <PlusIcon className="mr-1" /> Add Investment
                        </button>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-teal-500">{existingGoal ? 'Save Changes' : 'Save Goal'}</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Goals = ({ goals, setGoals }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const handleSaveGoal = (goal) => {
        const goalExists = goals.some(g => g.id === goal.id);
        if (goalExists) {
            setGoals(goals.map(g => g.id === goal.id ? goal : g));
        } else {
            setGoals([...goals, goal]);
        }
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleDelete = (goalId) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            setGoals(goals.filter(g => g.id !== goalId));
        }
    };

    const CAGR_RATES = [9, 10, 11, 12, 13, 14, 15];
    
    const grandTotalSip = useMemo(() =>
        goals.reduce((total, goal) =>
            total + goal.linkedInvestments.reduce((goalTotal, inv) =>
                goalTotal + inv.sipAmount, 0), 0),
        [goals]
    );

    return (
        <div className="space-y-6">
            {isModalOpen && <GoalForm onSave={handleSaveGoal} onClose={() => { setIsModalOpen(false); setEditingGoal(null); }} existingGoal={editingGoal} />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Financial Goal Planner</h2>
                </div>
                <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 rounded-lg text-white bg-teal-500 hover:bg-teal-600">
                    <PlusIcon className="mr-2" /> Add Goal
                </button>
            </div>
            
            <Card className="w-full md:w-1/3">
                 <p className="text-sm text-slate-500 dark:text-slate-400">Total Monthly SIP Commitment</p>
                <p className="text-2xl font-bold text-teal-500">₹{grandTotalSip.toLocaleString('en-IN')}</p>
            </Card>
            
            <Card className="overflow-x-auto">
                <table className="w-full min-w-[1400px] text-left text-sm">
                    <thead className="border-b dark:border-slate-700">
                        <tr>
                            <th className="p-2 w-1/5">Goal / Scheme</th>
                            <th className="p-2">Target Year</th>
                            <th className="p-2">Future Value</th>
                            <th className="p-2">Lumpsum</th>
                            {CAGR_RATES.map(rate => (
                                <th key={rate} className="p-2 text-right bg-slate-50 dark:bg-slate-700">{rate}% CAGR</th>
                            ))}
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goals.map(goal => {
                            const yearsToGoal = goal.targetYear - new Date().getFullYear();
                            const monthsToGoal = yearsToGoal * 12;
                            const futureTargetAmount = calculateFutureValueLumpSum(goal.targetAmountToday, goal.inflationRate, yearsToGoal);
                            const totalLumpsum = goal.linkedInvestments.reduce((sum, inv) => sum + (inv.lumpsumInvestment || 0), 0);

                            const totalProjections = CAGR_RATES.map(rate => {
                                const totalFutureValue = goal.linkedInvestments.reduce((sum, inv) => {
                                    const fvSip = calculateFutureValueSIP(inv.sipAmount, rate, monthsToGoal);
                                    const fvLumpsum = calculateFutureValueLumpSum(inv.lumpsumInvestment || 0, rate, yearsToGoal);
                                    return sum + fvSip + fvLumpsum;
                                }, 0);
                                return { rate, value: totalFutureValue };
                            });

                            return (
                                <React.Fragment key={goal.id}>
                                    <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-b-4 border-white dark:border-slate-900">
                                        <td className="p-3">{goal.name}</td>
                                        <td className="p-3">{goal.targetYear}</td>
                                        <td className="p-3 text-teal-500">₹{futureTargetAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                        <td className="p-3">₹{totalLumpsum.toLocaleString('en-IN')}</td>
                                        {totalProjections.map(({ rate, value }) => {
                                            const success = value >= futureTargetAmount;
                                            return <td key={rate} className={`p-3 text-right font-semibold ${success ? 'text-green-500' : 'text-yellow-500'}`}>₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                        })}
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(goal)} className="p-1 text-sky-500 hover:text-sky-700"><EditIcon /></button>
                                                <button onClick={() => handleDelete(goal.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    {goal.linkedInvestments.map((inv, index) => {
                                        const individualProjections = CAGR_RATES.map(rate => {
                                            const fvSip = calculateFutureValueSIP(inv.sipAmount, rate, monthsToGoal);
                                            const fvLumpsum = calculateFutureValueLumpSum(inv.lumpsumInvestment || 0, rate, yearsToGoal);
                                            return { rate, value: fvSip + fvLumpsum };
                                        });

                                        return (
                                            <tr key={index} className="border-b dark:border-slate-700 last:border-b-4 last:border-white dark:last:border-slate-900 text-slate-500 dark:text-slate-400">
                                                <td className="pl-8 p-2">{inv.schemeName} (SIP: ₹{inv.sipAmount.toLocaleString('en-IN')})</td>
                                                <td className="p-2"></td>
                                                <td className="p-2"></td>
                                                <td className="p-2">₹{(inv.lumpsumInvestment || 0).toLocaleString('en-IN')}</td>
                                                {individualProjections.map(({ rate, value }) => (
                                                    <td key={rate} className="p-2 text-right">₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                ))}
                                                <td className="p-2"></td>
                                            </tr>
                                        )
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                 {goals.length === 0 && (
                     <div className="text-center py-16 text-slate-500">
                        No goals set yet. Click 'Add Goal' to start planning your financial future.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Goals;
