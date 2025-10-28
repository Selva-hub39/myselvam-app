import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import type { Asset } from '../types';
import { PlusIcon } from './common/Icons';

interface AssetsProps {
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

const AssetForm: React.FC<{ onAdd: (asset: Asset) => void; onClose: () => void; }> = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<Asset['type']>('House');
    const [purchaseValue, setPurchaseValue] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const purchaseNum = parseFloat(purchaseValue);
        const currentNum = parseFloat(currentValue);
        if (name && !isNaN(purchaseNum) && !isNaN(currentNum) && purchaseDate) {
            onAdd({
                name,
                type,
                purchaseValue: purchaseNum,
                currentValue: currentNum,
                purchaseDate: purchaseDate
            });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add New Asset</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Asset Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    <select value={type} onChange={e => setType(e.target.value as Asset['type'])} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded">
                        <option>House</option>
                        <option>Plot</option>
                        <option>Vehicle</option>
                        <option>Other</option>
                    </select>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Purchase Date</label>
                        <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    </div>
                    <input type="number" placeholder="Purchase Value" value={purchaseValue} onChange={e => setPurchaseValue(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    <input type="number" placeholder="Current Value" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-teal-500">Add</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const Assets: React.FC<AssetsProps> = ({ assets, setAssets }) => {
    const [showForm, setShowForm] = useState(false);
    const totalPurchaseValue = assets.reduce((sum, asset) => sum + asset.purchaseValue, 0);
    const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const appreciation = totalCurrentValue - totalPurchaseValue;

    const overallCagr = useMemo(() => {
        if (assets.length === 0 || totalPurchaseValue <= 0) return 0;

        const earliestDate = assets.reduce((earliest, asset) => {
            const assetDate = new Date(asset.purchaseDate);
            return assetDate < earliest ? assetDate : earliest;
        }, new Date(assets[0].purchaseDate));
        
        const years = (new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        if (years <= 0) return 0;
        
        const cagr = (Math.pow(totalCurrentValue / totalPurchaseValue, 1 / years) - 1) * 100;
        return isNaN(cagr) || !isFinite(cagr) ? 0 : cagr;
    }, [assets, totalCurrentValue, totalPurchaseValue]);

    const handleAddAsset = (asset: Asset) => {
        setAssets(prev => [asset, ...prev]);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {showForm && <AssetForm onAdd={handleAddAsset} onClose={() => setShowForm(false)} />}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Asset Management</h2>
                 <button onClick={() => setShowForm(true)} className="flex items-center px-4 py-2 rounded-lg text-white bg-teal-500 hover:bg-teal-600">
                    <PlusIcon className="mr-2" /> Add Asset
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Current Value</p>
                    <p className="text-2xl font-bold">₹{totalCurrentValue.toLocaleString('en-IN')}</p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Appreciation</p>
                    <p className={`text-2xl font-bold ${appreciation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ₹{appreciation.toLocaleString('en-IN')}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Overall CAGR</p>
                     <p className={`text-2xl font-bold ${overallCagr >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {overallCagr.toFixed(2)}%
                    </p>
                </Card>
            </div>

            <Card>
                <h3 className="text-lg font-semibold mb-4">Your Assets</h3>
                <div className="space-y-4">
                    {assets.length > 0 ? assets.map((asset, index) => {
                        const purchaseDate = new Date(asset.purchaseDate);
                        const years = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                        let cagr = 0;
                        if (years > 0 && asset.purchaseValue > 0) {
                            cagr = (Math.pow(asset.currentValue / asset.purchaseValue, 1 / years) - 1) * 100;
                        }
                        if (isNaN(cagr) || !isFinite(cagr)) cagr = 0;
                        
                        return (
                         <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg items-center">
                            <div className="md:col-span-2">
                                <p className="font-bold">{asset.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{asset.type} &middot; {purchaseDate.toLocaleDateString('en-GB')}</p>
                            </div>
                            <div className="text-right md:text-left">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Purchase Value</p>
                                <p>₹{asset.purchaseValue.toLocaleString('en-IN')}</p>
                            </div>
                             <div className="text-left">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Current Value</p>
                                <p className="font-semibold">₹{asset.currentValue.toLocaleString('en-IN')}</p>
                            </div>
                             <div className="text-right">
                                <p className="text-sm text-slate-500 dark:text-slate-400">CAGR</p>
                                <p className={`font-semibold ${cagr >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {cagr.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    )) : <div className="text-center py-8 text-slate-500">No assets added yet.</div>}
                </div>
            </Card>
        </div>
    );
};

export default Assets;