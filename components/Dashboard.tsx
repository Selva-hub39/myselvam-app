import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Card from './common/Card';
// FIX: Changed import path to be relative.
import { NetWorthIcon, AssetsIcon, GrowthIcon } from './common/Icons';
// FIX: Changed import path to be relative.
import type { MutualFund, GoldHolding, Asset } from '../types';

interface DashboardProps {
    mutualFunds: MutualFund[];
    goldHoldings: GoldHolding[];
    assets: Asset[];
}

const Dashboard: React.FC<DashboardProps> = ({ mutualFunds, goldHoldings, assets }) => {
    const totalMutualFunds = mutualFunds.reduce((sum, fund) => sum + fund.currentValue, 0);
    // Assuming a static live price for now, as it's managed in the Gold component
    const totalGoldValue = goldHoldings.reduce((sum, gold) => sum + (gold.grams * 7250), 0); 
    const totalRealEstate = assets.filter(a => a.type === 'House' || a.type === 'Plot').reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalOtherAssets = assets.filter(a => a.type !== 'House' && a.type !== 'Plot').reduce((sum, asset) => sum + asset.currentValue, 0);

    const totalAssets = totalMutualFunds + totalGoldValue + totalRealEstate + totalOtherAssets;
    const netWorth = totalAssets; // Assuming no liabilities for simplicity

    const assetDistributionData = [
        { name: 'Equity/MF', value: totalMutualFunds },
        { name: 'Gold', value: totalGoldValue },
        { name: 'Real Estate', value: totalRealEstate },
        { name: 'Others', value: totalOtherAssets },
    ].filter(item => item.value > 0);

    const COLORS = ['#0d9488', '#facc15', '#0ea5e9', '#64748b'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full mr-4">
                            <NetWorthIcon className="text-teal-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Net Worth</p>
                            <p className="text-2xl font-bold">₹{netWorth.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 bg-sky-100 dark:bg-sky-900 rounded-full mr-4">
                            <AssetsIcon className="text-sky-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Assets</p>
                            <p className="text-2xl font-bold">₹{totalAssets.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                         <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mr-4">
                            <GrowthIcon className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Overall Growth</p>
                            <p className="text-2xl font-bold text-green-500">+12.5%</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div style={{ width: '100%', height: 250 }}>
                        {assetDistributionData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={assetDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {assetDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">No assets added yet.</div>
                        )}
                    </div>
                     <div className="space-y-4">
                        {assetDistributionData.map((entry, index) => {
                            const percentage = totalAssets > 0 ? (entry.value / totalAssets) * 100 : 0;
                            return (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="font-medium">{entry.name}</span>
                                    </div>
                                    <div className="text-right">
                                       <p className="font-semibold">₹{entry.value.toLocaleString('en-IN')}</p>
                                       <p className="text-sm text-slate-500 dark:text-slate-400">{percentage.toFixed(2)}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;