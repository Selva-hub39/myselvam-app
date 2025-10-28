import React from 'react';

// A single transaction for a mutual fund
export interface Transaction {
    date: string; // ISO date string
    description: string;
    amount: number;
    units: number;
    price: number;
    type: 'Purchase' | 'SIP' | 'Redemption' | 'Switch Out' | 'Dividend Reinvestment';
}

// The main MutualFund object, now transaction-based
export interface MutualFund {
    id: string;
    name: string;
    owner: 'Self' | 'Spouse';
    currentValue: number; // Manually updated by the user
    transactions: Transaction[];
    sipAmount?: number;
    sipStartDate?: string; // ISO date string
}


// From Gold.tsx
export interface GoldHolding {
    id: string;
    purchaseDate: string; // ISO date string
    grams: number;
    totalCost: number;
}

// From Assets.tsx
export interface Asset {
    name: string;
    type: 'House' | 'Plot' | 'Vehicle' | 'Other';
    purchaseValue: number;
    currentValue: number;
    purchaseDate: string; // ISO date string
}

// From Expenses.tsx
export interface Expense {
    id: string;
    date: string; // ISO date string
    amount: number;
    category: string;
    notes: string;
    paymentMethod: 'UPI' | 'Card' | 'Cash';
}

// From Expenses.tsx
export interface Budget {
    category: string;
    amount: number;
}

// For Goals.tsx - Advanced Version
export interface LinkedInvestment {
  schemeName: string;
  sipAmount: number;
  lumpsumInvestment?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetYear: number;
  targetAmountToday: number;
  inflationRate: number; // As a percentage, e.g., 6 for 6%
  linkedInvestments: LinkedInvestment[];
}


// From Dashboard.tsx
export interface HistoricalDataPoint {
    date: string;
    value: number;
}

// From utils/finance.ts and Gold.tsx
export interface CashFlow {
    amount: number;
    date: Date;
}