import React, { useState, useMemo } from 'react';
import Card from './common/Card.js';
import { PlusIcon, UploadIcon, EditIcon, TrashIcon } from './common/Icons.js';
import { calculateXIRR } from '../utils/finance.js';

const GoldForm = ({ 
    onSave, 
    onClose,
    existingHolding 
}) => {
    const [grams, setGrams] = useState(existingHolding?.grams.toString() || '');
    const [totalCost, setTotalCost] = useState(existingHolding?.totalCost.toString() || '');
    const [purchaseDate, setPurchaseDate] = useState(existingHolding?.purchaseDate || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const gramsNum = parseFloat(grams);
        const costNum = parseFloat(totalCost);
        if (!isNaN(gramsNum) && !isNaN(costNum) && gramsNum > 0 && purchaseDate) {
            onSave({ 
                id: existingHolding?.id,
                grams: gramsNum, 
                totalCost: costNum, 
                purchaseDate 
            });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{existingHolding ? 'Edit Gold Holding' : 'Add Gold Holding'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Purchase Date</label>
                        <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Grams</label>
                        <input type="number" placeholder="e.g., 10.5" value={grams} onChange={e => setGrams(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Total Cost (incl. GST)</label>
                        <input type="number" placeholder="e.g., 55000" value={totalCost} onChange={e => setTotalCost(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded" required />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-teal-500">{existingHolding ? 'Save Changes' : 'Add'}</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Gold = ({ holdings, setHoldings }) => {
  const [liveGoldPrice, setLiveGoldPrice] = useState(7250);
  const [showForm, setShowForm] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [goldTarget, setGoldTarget] = useState(800);
  const [targetMonths, setTargetMonths] = useState(24);

  const sortedHoldings = useMemo(() => 
    [...holdings].sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()), 
    [holdings]
  );

  const totalGrams = sortedHoldings.reduce((sum, holding) => sum + holding.grams, 0);
  const totalCost = sortedHoldings.reduce((sum, holding) => sum + holding.totalCost, 0);
  const averagePurchasePrice = totalGrams > 0 ? totalCost / totalGrams : 0;
  const totalCurrentValue = totalGrams * liveGoldPrice;
  const totalProfit = totalCurrentValue - totalCost;

  const xirr = useMemo(() => {
    if (sortedHoldings.length < 1) return 0;
    const cashflows = sortedHoldings.map(h => ({
      amount: -h.totalCost,
      date: new Date(h.purchaseDate),
    }));
    cashflows.push({ amount: totalCurrentValue, date: new Date() });
    
    try {
        const result = calculateXIRR(cashflows);
        return isNaN(result) || !isFinite(result) ? 0 : result * 100;
    } catch(e) {
        return 0;
    }
  }, [sortedHoldings, totalCurrentValue]);

  const remainingGrams = Math.max(0, goldTarget - totalGrams);
  const monthlyPurchaseRequired = targetMonths > 0 ? remainingGrams / targetMonths : 0;
  const estimatedCost = remainingGrams * liveGoldPrice;

  const handleSaveHolding = (holdingData) => {
    if (holdingData.id) { // Update existing holding
        setHoldings(prev => prev.map(h => h.id === holdingData.id ? { ...h, ...holdingData } : h));
    } else { // Add new holding
        const newHolding = { ...holdingData, id: Date.now().toString(), grams: holdingData.grams, totalCost: holdingData.totalCost, purchaseDate: holdingData.purchaseDate };
        setHoldings(prev => [newHolding, ...prev]);
    }
    setShowForm(false);
    setEditingHolding(null);
  };

  const handleEdit = (holding) => {
    setEditingHolding(holding);
    setShowForm(true);
  };

  const handleDelete = (holdingId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
        setHoldings(prev => prev.filter(h => h.id !== holdingId));
    }
  };


  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            const rows = text.split('\n').slice(1); // Skip header
            const newHoldings = rows
                .map((row, index) => {
                    const [dateStr, gramsStr, costStr] = row.split(',');
                    if (!dateStr || !gramsStr || !costStr) return null;
                    
                    const purchaseDate = new Date(dateStr.trim()).toISOString().split('T')[0];
                    const grams = parseFloat(gramsStr);
                    const totalCost = parseFloat(costStr);
                    const id = `${Date.now()}-${index}`;

                    if (isNaN(grams) || isNaN(totalCost) || purchaseDate === 'Invalid Date') return null;

                    return { id, purchaseDate, grams, totalCost };
                })
                .filter((h) => h !== null);
            
            setHoldings(prev => [...prev, ...newHoldings]);
        } catch (error) {
            console.error("Error parsing CSV file:", error);
            alert("Failed to parse CSV file. Please check the format.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };


  return (
    <div className="space-y-6">
      {showForm && <GoldForm onSave={handleSaveHolding} onClose={() => { setShowForm(false); setEditingHolding(null); }} existingHolding={editingHolding} />}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Gold Investments</h2>
        <div className="flex items-center gap-2">
            <input type="file" id="csv-upload-gold" className="hidden" accept=".csv" onChange={handleFileChange} />
            <label htmlFor="csv-upload-gold" className="flex items-center px-3 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 cursor-pointer text-sm">
                <UploadIcon className="mr-2" /> Import CSV
            </label>
            <button onClick={() => { setEditingHolding(null); setShowForm(true); }} className="flex items-center px-3 py-2 rounded-lg text-white bg-teal-500 hover:bg-teal-600 text-sm">
                <PlusIcon className="mr-2" /> Add Holding
            </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 -mt-4">CSV format: header row, then `Purchase Date,Number of Grams,Cost including GST` (e.g., `25-Mar-21,0.2110,1000`)</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">Portfolio XIRR</p>
              <p className={`text-2xl font-bold ${xirr >= 0 ? 'text-green-500' : 'text-red-500'}`}>{xirr.toFixed(2)}%</p>
          </Card>
          <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Gold Held</p>
              <p className="text-2xl font-bold">{totalGrams.toFixed(4)} gm</p>
          </Card>
          <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
              <p className="text-2xl font-bold text-yellow-500">₹{totalCurrentValue.toLocaleString('en-IN')}</p>
          </Card>
          <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Profit</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{totalProfit.toLocaleString('en-IN')}</p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <h3 className="text-lg font-semibold mb-4">Target Planning</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="font-medium">Live Gold Price (gm)</label>
                    <input type="number" value={liveGoldPrice} onChange={e => setLiveGoldPrice(parseFloat(e.target.value) || 0)} className="w-32 bg-slate-100 dark:bg-slate-700 p-2 rounded text-right font-semibold"/>
                </div>
                 <div className="flex justify-between items-center">
                    <label className="font-medium">Target (Gms)</label>
                    <input type="number" value={goldTarget} onChange={e => setGoldTarget(parseFloat(e.target.value) || 0)} className="w-32 bg-slate-100 dark:bg-slate-700 p-2 rounded text-right font-semibold"/>
                </div>
                <div className="flex justify-between items-center">
                    <label className="font-medium">Target Months</label>
                    <input type="number" value={targetMonths} onChange={e => setTargetMonths(parseInt(e.target.value) || 0)} className="w-32 bg-slate-100 dark:bg-slate-700 p-2 rounded text-right font-semibold"/>
                </div>
                <hr className="dark:border-slate-600"/>
                <div className="flex justify-between items-center">
                    <p className="text-slate-500 dark:text-slate-400">Remaining Gms</p>
                    <p className="font-bold text-lg">{remainingGrams.toFixed(4)}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-slate-500 dark:text-slate-400">Monthly Purchase (Gms)</p>
                    <p className="font-bold text-lg">{monthlyPurchaseRequired.toFixed(4)}</p>
                </div>
                 <div className="flex justify-between items-center">
                    <p className="text-slate-500 dark:text-slate-400">Estimated Cost</p>
                    <p className="font-bold text-lg text-teal-500">₹{estimatedCost.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </Card>
        <Card>
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-3">
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Total Cost</span> <span className="font-semibold">₹{totalCost.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Average Price</span> <span className="font-semibold">₹{averagePurchasePrice.toLocaleString('en-IN', {maximumFractionDigits: 2})}/gm</span></div>
            </div>
        </Card>
      </div>
      
      <Card>
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          <div className="overflow-x-auto">
            {sortedHoldings.length > 0 ? (
              <table className="w-full text-left">
                  <thead className="text-sm text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                      <tr>
                          <th className="p-2">Purchase Date</th>
                          <th className="p-2 text-right">Grams</th>
                          <th className="p-2 text-right">Cost</th>
                          <th className="p-2 text-right">Rate/gm</th>
                          <th className="p-2 text-right">Value Today</th>
                          <th className="p-2 text-right">CAGR %</th>
                          <th className="p-2 text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      {sortedHoldings.map((holding) => {
                          const perGramRate = holding.grams > 0 ? holding.totalCost / holding.grams : 0;
                          const currentValue = holding.grams * liveGoldPrice;
                          const years = (new Date().getTime() - new Date(holding.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                          let cagr = 0;
                          if (years > 0 && holding.totalCost > 0) {
                              cagr = (Math.pow(currentValue / holding.totalCost, 1 / years) - 1) * 100;
                          }
                          
                          return (
                              <tr key={holding.id} className="border-b dark:border-slate-700 last:border-b-0">
                                  <td className="p-2">{new Date(holding.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                  <td className="p-2 text-right">{holding.grams.toFixed(4)}</td>
                                  <td className="p-2 text-right">₹{holding.totalCost.toLocaleString('en-IN')}</td>
                                  <td className="p-2 text-right">₹{perGramRate.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                                  <td className="p-2 text-right font-semibold">₹{currentValue.toLocaleString('en-IN')}</td>
                                  <td className={`p-2 text-right font-medium ${cagr >= 0 ? 'text-green-500' : 'text-red-500'}`}>{cagr.toFixed(2)}%</td>
                                  <td className="p-2 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(holding)} className="p-1 text-sky-500 hover:text-sky-700"><EditIcon /></button>
                                        <button onClick={() => handleDelete(holding.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon /></button>
                                      </div>
                                  </td>
                              </tr>
                          )
                      })}
                  </tbody>
              </table>
            ) : <div className="text-center py-8 text-slate-500">No gold holdings added yet.</div>}
          </div>
      </Card>
    </div>
  );
};

export default Gold;
