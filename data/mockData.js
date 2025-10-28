(() => {
  window.MySelvam.data = {
    mockMutualFunds: [
      {
        id: 'mf1',
        name: 'Parag Parikh Flexi Cap Fund',
        owner: 'Self',
        currentValue: 120000,
        sipAmount: 5000,
        sipStartDate: '2022-01-05',
        transactions: [
          { date: '2022-01-05', description: 'SIP Installment', amount: 5000, units: 100, nav: 50, type: 'purchase' },
          { date: '2022-02-05', description: 'SIP Installment', amount: 5000, units: 95, nav: 52.63, type: 'purchase' },
        ]
      },
      {
        id: 'mf2',
        name: 'Axis Small Cap Fund',
        owner: 'Spouse',
        currentValue: 75000,
        transactions: [
          { date: '2021-11-20', description: 'Lumpsum', amount: 50000, units: 800, nav: 62.5, type: 'purchase' },
        ]
      }
    ],
    mockGoldHoldings: [
      { id: 'g1', name: 'Sovereign Gold Bond 2023-24', purchaseDate: '2023-09-20', weightGr: 10, purchaseValue: 59230, currentValue: 68500 },
      { id: 'g2', name: 'Digital Gold (Augmont)', purchaseDate: '2022-10-26', weightGr: 5, purchaseValue: 25500, currentValue: 34250 },
    ],
    mockAssets: [
      { id: 'a1', name: 'Primary Residence', type: 'Real Estate', purchaseDate: '2020-05-15', purchaseValue: 7500000, currentValue: 9000000 },
      { id: 'a2', name: 'EPF', type: 'Retirement Fund', purchaseDate: '2015-06-01', purchaseValue: 800000, currentValue: 1500000 },
    ],
    mockExpenses: [
      { id: 'e1', date: '2024-05-01', category: 'Household', amount: 15000, description: 'Monthly Groceries' },
      { id: 'e2', date: '2024-05-05', category: 'Utilities', amount: 3500, description: 'Electricity Bill' },
      { id: 'e3', date: '2024-05-10', category: 'Transport', amount: 2000, description: 'Fuel' },
    ],
    mockGoals: [
      { id: 'goal1', name: "Child's Education Fund", targetAmount: 2000000, targetDate: '2035-06-01', savedAmount: 350000 },
      { id: 'goal2', name: 'Retirement Corpus', targetAmount: 10000000, targetDate: '2045-12-31', savedAmount: 1500000 },
    ],
  };
})();
