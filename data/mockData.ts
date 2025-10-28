import type { MutualFund, GoldHolding, Asset, Expense, Budget, Goal } from '../types';

export const mockMutualFunds: MutualFund[] = [
  { 
    id: 'mf1',
    name: 'Parag Parikh Flexi Cap Fund', 
    owner: 'Self',
    currentValue: 750000,
    sipAmount: 10000,
    sipStartDate: '2023-01-05',
    transactions: [
        { date: '2023-01-05', description: 'SIP Installment', amount: 10000, units: 150.15, price: 66.6, type: 'SIP' },
        { date: '2023-02-05', description: 'SIP Installment', amount: 10000, units: 145.5, price: 68.7, type: 'SIP' },
        { date: '2023-03-05', description: 'Lumpsum Purchase', amount: 50000, units: 720.5, price: 69.4, type: 'Purchase' },
    ]
  },
  { 
    id: 'mf2',
    name: 'Quant Small Cap Fund', 
    owner: 'Self',
    currentValue: 480000,
    transactions: [
       { date: '2022-11-10', description: 'Initial Purchase', amount: 200000, units: 1000, price: 200, type: 'Purchase' }
    ]
  },
  { 
    id: 'mf3',
    name: 'Mirae Asset Large Cap Fund', 
    owner: 'Spouse',
    currentValue: 520000,
     transactions: [
       { date: '2021-06-15', description: 'Initial Purchase', amount: 300000, units: 2500, price: 120, type: 'Purchase' }
    ]
  },
];

export const mockGoldHoldings: GoldHolding[] = [
  { id: 'g1', purchaseDate: '2022-10-15', grams: 10, totalCost: 50000 },
  { id: 'g2', purchaseDate: '2023-04-20', grams: 20, totalCost: 110000 },
];

export const mockAssets: Asset[] = [
  { name: 'Primary Residence', type: 'House', purchaseValue: 7500000, currentValue: 9000000, purchaseDate: '2020-05-10' },
  { name: 'Investment Plot', type: 'Plot', purchaseValue: 2000000, currentValue: 2500000, purchaseDate: '2021-02-15' },
  { name: 'Honda City', type: 'Vehicle', purchaseValue: 1200000, currentValue: 800000, purchaseDate: '2019-07-22' },
];

export const mockExpenses: Expense[] = [
    { id: '1', date: new Date().toISOString().split('T')[0], amount: 1200, category: 'Food', notes: 'Team lunch', paymentMethod: 'UPI'},
    { id: '2', date: new Date().toISOString().split('T')[0], amount: 3500, category: 'Shopping', notes: 'New shoes', paymentMethod: 'Card'},
];

// FIX: Corrected BudgetType to Budget to align with the imported type.
export const mockBudgets: Budget[] = [
  { category: 'Food', amount: 20000 },
  { category: 'Shopping', amount: 15000 },
  { category: 'Utilities', amount: 8000 },
  { category: 'Transport', amount: 5000 },
  { category: 'Entertainment', amount: 7000 },
  { category: 'Other', amount: 10000 },
];

export const mockGoals: Goal[] = [
    {
        id: '1',
        name: 'Children College',
        targetYear: 2042,
        targetAmountToday: 8000000,
        inflationRate: 6,
        linkedInvestments: [
            { schemeName: 'Jio Blackrock Flexi Cap', sipAmount: 135000, lumpsumInvestment: 0 },
            { schemeName: 'Zerodha Nifty LargeMidcap 250', sipAmount: 180000, lumpsumInvestment: 50000 },
            { schemeName: 'HDFC Balanced Advantage', sipAmount: 135000, lumpsumInvestment: 0 },
        ],
    },
    {
        id: '2',
        name: 'Retirement Home',
        targetYear: 2034,
        targetAmountToday: 12500000,
        inflationRate: 8,
        linkedInvestments: [
            { schemeName: 'Nippon India Large Cap', sipAmount: 30000, lumpsumInvestment: 200000 },
        ]
    }
];