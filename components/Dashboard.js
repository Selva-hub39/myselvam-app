(() => {
  const { useMemo } = React;
  
  const Dashboard = ({ funds, goldHoldings, assets, expenses, goals }) => {
    const { Card } = window.MySelvam.components;
    const { formatCurrency } = window.MySelvam.utils;
    const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = window.Recharts;

    const portfolioSummary = useMemo(() => {
      const totalCurrentValue = funds.reduce((acc, fund) => acc + fund.currentValue, 0);
      const totalInvested = funds.reduce((acc, fund) => acc + fund.transactions.reduce((sum, tx) => sum + tx.amount, 0), 0);
      const totalGain = totalCurrentValue - totalInvested;
      const growthPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
      return { totalCurrentValue, totalGain, growthPercentage };
    }, [funds]);

    const totalNetWorth = useMemo(() => {
      const mutualFundsTotal = funds.reduce((sum, fund) => sum + fund.currentValue, 0);
      const goldTotal = goldHoldings.reduce((sum, item) => sum + item.currentValue, 0);
      const otherAssetsTotal = assets.reduce((sum, item) => sum + item.currentValue, 0);
      return mutualFundsTotal + goldTotal + otherAssetsTotal;
    }, [funds, goldHoldings, assets]);
    
    const assetDistributionData = useMemo(() => {
      const mutualFundsTotal = funds.reduce((sum, fund) => sum + fund.currentValue, 0);
      const goldTotal = goldHoldings.reduce((sum, item) => sum + item.currentValue, 0);
      const otherAssetsTotal = assets.reduce((sum, item) => sum + item.currentValue, 0);
      const total = mutualFundsTotal + goldTotal + otherAssetsTotal;

      if (total === 0) return [];
      
      return [
        { name: 'Mutual Funds', value: mutualFundsTotal },
        { name: 'Gold', value: goldTotal },
        { name: 'Other Assets', value: otherAssetsTotal },
      ].filter(item => item.value > 0);
    }, [funds, goldHoldings, assets]);

    const COLORS = ['#14b8a6', '#f59e0b', '#3b82f6'];
    
    return (
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' },
        React.createElement('div', { className: 'col-span-1 md:col-span-2 xl:col-span-3' },
            React.createElement('h1', { className: 'text-3xl font-bold text-slate-800' }, 'Dashboard')
        ),
        
        React.createElement(Card, { className: 'col-span-1' },
            React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-1' }, 'Total Net Worth'),
            React.createElement('p', { className: 'text-4xl font-bold text-slate-900' }, formatCurrency(totalNetWorth))
        ),
        
        React.createElement(Card, { className: 'col-span-1' },
            React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-1' }, 'Portfolio Value'),
            React.createElement('p', { className: 'text-4xl font-bold text-slate-900' }, formatCurrency(portfolioSummary.totalCurrentValue)),
            React.createElement('p', { className: `text-md font-semibold mt-2 ${portfolioSummary.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}` },
                `${formatCurrency(portfolioSummary.totalGain)} (${portfolioSummary.growthPercentage.toFixed(2)}%)`
            )
        ),
        
        React.createElement(Card, { className: 'col-span-1' },
          React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-1' }, 'Upcoming Goals'),
          goals.length > 0 ? 
            React.createElement('ul', {className: 'space-y-2 mt-2'},
                goals.slice(0, 2).map(goal => React.createElement('li', {key: goal.id}, 
                    React.createElement('p', {className: 'font-semibold'}, goal.name),
                    React.createElement('p', {className: 'text-sm text-slate-600'}, `${formatCurrency(goal.savedAmount)} / ${formatCurrency(goal.targetAmount)}`)
                ))
            ) : React.createElement('p', null, 'No goals set.')
        ),

        React.createElement(Card, { className: 'col-span-1 md:col-span-2' },
          React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-2' }, 'Asset Distribution'),
           assetDistributionData.length > 0 ?
            React.createElement('div', { className: 'flex flex-col md:flex-row items-center h-64' },
              React.createElement('div', { className: 'w-full md:w-1/2 h-full' },
                React.createElement(ResponsiveContainer, null,
                  React.createElement(PieChart, null,
                    React.createElement(Pie, {
                      data: assetDistributionData,
                      cx: "50%",
                      cy: "50%",
                      innerRadius: 60,
                      outerRadius: 80,
                      fill: "#8884d8",
                      paddingAngle: 5,
                      dataKey: "value"
                    },
                      assetDistributionData.map((entry, index) => React.createElement(Cell, { key: `cell-${index}`, fill: COLORS[index % COLORS.length] }))
                    ),
                    React.createElement(Tooltip, { formatter: (value) => formatCurrency(value) })
                  )
                )
              ),
              React.createElement('div', { className: 'w-full md:w-1/2 mt-4 md:mt-0 md:pl-6' },
                React.createElement('ul', null,
                  assetDistributionData.map((entry, index) => (
                    React.createElement('li', { key: `legend-${index}`, className: 'flex items-center mb-2' },
                      React.createElement('span', { className: 'w-3 h-3 rounded-full mr-2', style: { backgroundColor: COLORS[index % COLORS.length] } }),
                      React.createElement('span', { className: 'text-slate-700 mr-2' }, `${entry.name}:`),
                      React.createElement('span', { className: 'font-semibold' }, `${formatCurrency(entry.value)} (${((entry.value / totalNetWorth) * 100).toFixed(1)}%)`)
                    )
                  ))
                )
              )
            )
            : React.createElement('p', {className: 'flex items-center justify-center h-full text-slate-500'}, 'No asset data to display.')
        ),
        
        React.createElement(Card, { className: 'col-span-1' },
          React.createElement('h2', { className: 'text-lg font-semibold text-slate-700 mb-2' }, 'Recent Expenses'),
            expenses.length > 0 ?
            React.createElement('ul', {className: 'space-y-2'},
                expenses.slice(0, 4).map(expense => React.createElement('li', {key: expense.id, className: 'flex justify-between'}, 
                    React.createElement('span', null, expense.description),
                    React.createElement('span', {className: 'font-semibold'}, formatCurrency(expense.amount))
                ))
            ) : React.createElement('p', null, 'No expenses recorded.')
        )
      )
    );
  };
  
  window.MySelvam.components.Dashboard = Dashboard;
})();
