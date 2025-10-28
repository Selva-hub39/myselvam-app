import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import Gold from './components/Gold';
import Expenses from './components/Expenses';
import Assets from './components/Assets';
import Goals from './components/Goals';
import { mockMutualFunds, mockGoldHoldings, mockAssets, mockExpenses, mockBudgets, mockGoals } from './data/mockData';
import type { MutualFund, GoldHolding, Asset, Expense, Budget, Goal, Transaction } from './types';
import { DashboardIcon, PortfolioIcon, GoldIcon, ExpensesIcon, AssetsIcon, GoalsIcon, LogoIcon, CheckCircleIcon } from './components/common/Icons';

type View = 'Dashboard' | 'Portfolio' | 'Gold' | 'Expenses' | 'Assets' | 'Goals';

const App: React.FC = () => {
    const [user] = useState({ name: 'Selvam', avatar: 'S' });
    const [view, setView] = useState<View>('Dashboard');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const isInitialMount = useRef(true);
    
    // State management for all data slices
    const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
    const [goldHoldings, setGoldHoldings] = useState<GoldHolding[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    // On component mount, load data and run startup logic
    useEffect(() => {
        let loadedFunds: MutualFund[] = [];
        try {
            const backupData = localStorage.getItem('mySelvamBackup');
            
            if (backupData) {
                const savedData = JSON.parse(backupData);
                loadedFunds = savedData.mutualFunds || [];
                setGoldHoldings(savedData.goldHoldings || []);
                setAssets(savedData.assets || []);
                setExpenses(savedData.expenses || []);
                setBudgets(savedData.budgets || []);
                setGoals(savedData.goals || []);
            } else {
                loadedFunds = mockMutualFunds;
                setGoldHoldings(mockGoldHoldings);
                setAssets(mockAssets);
                setExpenses(mockExpenses);
                setBudgets(mockBudgets);
                setGoals(mockGoals);
            }
        } catch (error) {
            console.error("Could not load data from local storage:", error);
            loadedFunds = mockMutualFunds;
            setGoldHoldings(mockGoldHoldings);
            setAssets(mockAssets);
            setExpenses(mockExpenses);
            setBudgets(mockBudgets);
            setGoals(mockGoals);
        }

        // --- AUTOMATED SIP TRANSACTION LOGIC ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedFunds = loadedFunds.map(fund => {
            if (!fund.sipAmount || !fund.sipStartDate) {
                return fund;
            }

            const sipStartDate = new Date(fund.sipStartDate);
            sipStartDate.setHours(0, 0, 0, 0);
            // The day of the month the SIP runs
            const sipDay = sipStartDate.getDate();

            // Find the last recorded SIP, or use the date before the official start date
            const sipTransactions = fund.transactions.filter(t => t.type === 'SIP').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            let lastSipDate;

            if (sipTransactions.length > 0) {
                lastSipDate = new Date(sipTransactions[0].date);
            } else {
                // If no SIPs, start generating from the month before the start date to include the first one.
                lastSipDate = new Date(sipStartDate);
                lastSipDate.setMonth(lastSipDate.getMonth() - 1);
            }
            lastSipDate.setHours(0, 0, 0, 0);

            const newTransactions: Transaction[] = [];
            let nextSipDate = new Date(lastSipDate);

            // Start checking from the month following the last SIP
            nextSipDate.setMonth(nextSipDate.getMonth() + 1);
            nextSipDate.setDate(sipDay);

            // Loop until we are past today's date
            while (nextSipDate <= today) {
                const alreadyExists = fund.transactions.some(tx => 
                    new Date(tx.date).getTime() === nextSipDate.getTime() && tx.type === 'SIP'
                );

                if (!alreadyExists) {
                    newTransactions.push({
                        date: nextSipDate.toISOString().split('T')[0],
                        amount: fund.sipAmount,
                        type: 'SIP',
                        description: 'SIP Installment (Auto)',
                        units: 0, // Placeholder, to be updated by CAS import
                        price: 0, // Placeholder
                    });
                }
                
                // Move to the next month
                nextSipDate.setMonth(nextSipDate.getMonth() + 1);
                // Important: Reset the day in case the previous month had fewer days
                nextSipDate.setDate(sipDay);
            }

            if (newTransactions.length > 0) {
                 const combinedTransactions = [...fund.transactions, ...newTransactions]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return { ...fund, transactions: combinedTransactions };
            }
            return fund;
        });

        setMutualFunds(updatedFunds);
    }, []);

    // Auto-save data whenever it changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        setSaveStatus('saving');
        const appData = {
            mutualFunds,
            goldHoldings,
            assets,
            expenses,
            budgets,
            goals
        };
        try {
            localStorage.setItem('mySelvamBackup', JSON.stringify(appData));
            
            const timer = setTimeout(() => {
                setSaveStatus('saved');
                const resetTimer = setTimeout(() => setSaveStatus('idle'), 2000);
                 return () => clearTimeout(resetTimer);
            }, 500);

            return () => clearTimeout(timer);
        } catch (error) {
            console.error("Failed to auto-save data:", error);
        }
    }, [mutualFunds, goldHoldings, assets, expenses, budgets, goals]);

    const renderView = () => {
        switch (view) {
            case 'Dashboard':
                return <Dashboard mutualFunds={mutualFunds} goldHoldings={goldHoldings} assets={assets} />;
            case 'Portfolio':
                return <Portfolio funds={mutualFunds} setFunds={setMutualFunds} />;
            case 'Gold':
                return <Gold holdings={goldHoldings} setHoldings={setGoldHoldings} />;
            case 'Expenses':
                return <Expenses expenses={expenses} setExpenses={setExpenses} budgets={budgets} setBudgets={setBudgets} />;
            case 'Assets':
                return <Assets assets={assets} setAssets={setAssets} />;
            case 'Goals':
                return <Goals goals={goals} setGoals={setGoals} />;
            default:
                return <Dashboard mutualFunds={mutualFunds} goldHoldings={goldHoldings} assets={assets} />;
        }
    };
    
    const NavButton: React.FC<{ currentView: View, targetView: View, onClick: () => void, children: React.ReactNode, icon: React.ReactNode }> = 
    ({ currentView, targetView, onClick, children, icon }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                currentView === targetView
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            <span className="mr-3">{icon}</span>
            {children}
        </button>
    );

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <aside className="w-64 bg-white dark:bg-slate-800 p-4 border-r dark:border-slate-700 flex flex-col shadow-lg">
                <div className="flex items-center mb-8 px-2">
                    <LogoIcon className="w-12 h-12 mr-2" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-teal-700 dark:from-yellow-400 dark:to-teal-500 bg-clip-text text-transparent">MySelvam</h1>
                </div>
                <nav className="flex-grow space-y-2">
                    <NavButton currentView={view} targetView="Dashboard" onClick={() => setView('Dashboard')} icon={<DashboardIcon />}>Dashboard</NavButton>
                    <NavButton currentView={view} targetView="Portfolio" onClick={() => setView('Portfolio')} icon={<PortfolioIcon />}>Portfolio</NavButton>
                    <NavButton currentView={view} targetView="Gold" onClick={() => setView('Gold')} icon={<GoldIcon />}>Gold</NavButton>
                    <NavButton currentView={view} targetView="Expenses" onClick={() => setView('Expenses')} icon={<ExpensesIcon />}>Expenses</NavButton>
                    <NavButton currentView={view} targetView="Assets" onClick={() => setView('Assets')} icon={<AssetsIcon />}>Assets</NavButton>
                    <NavButton currentView={view} targetView="Goals" onClick={() => setView('Goals')} icon={<GoalsIcon />}>Goals</NavButton>
                </nav>
                 <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                     <div className="flex items-center px-2 mb-4">
                        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-teal-500">{user.avatar}</div>
                        <div className="ml-3">
                            <p className="font-semibold text-sm">{user.name}</p>
                        </div>
                     </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 px-2 h-5 transition-opacity duration-300">
                           {saveStatus === 'saving' && <span>Saving...</span>}
                           {saveStatus === 'saved' && (
                                <span className="flex items-center text-green-500">
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    All changes saved
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-8 px-2 text-center">
                        * "Selvam" (செல்வம்) is the Tamil word for wealth & prosperity.
                    </p>
                </div>
            </aside>
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default App;