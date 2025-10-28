// Helper to get days between two dates
function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

// Net Present Value function
function npv(rate, cashflows) {
    const firstDate = cashflows[0].date;
    return cashflows.reduce((acc, cashflow) => {
        const days = daysBetween(cashflow.date, firstDate);
        return acc + cashflow.amount / Math.pow(1 + rate, days / 365.0);
    }, 0);
}

// Derivative of NPV function
function npvDerivative(rate, cashflows) {
    const firstDate = cashflows[0].date;
    return cashflows.reduce((acc, cashflow) => {
        const days = daysBetween(cashflow.date, firstDate);
        if (days === 0) return acc;
        return acc - (cashflow.amount * days) / (365.0 * Math.pow(1 + rate, (days / 365.0) + 1));
    }, 0);
}

// XIRR calculation using Newton-Raphson method
export function calculateXIRR(cashflows, guess = 0.1) {
    const maxIterations = 100;
    const tolerance = 1.0e-7;

    if (cashflows.length < 2 || cashflows.every(cf => cf.amount >= 0) || cashflows.every(cf => cf.amount <= 0)) {
        return 0;
    }

    // Sort cashflows by date to ensure the first date is the earliest
    cashflows.sort((a, b) => a.date.getTime() - b.date.getTime());

    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
        const npvValue = npv(rate, cashflows);
        const derivativeValue = npvDerivative(rate, cashflows);
        
        // FIX: Added guard against division by zero, a likely cause of a crash.
        if (Math.abs(derivativeValue) < tolerance) {
            break;
        }

        const newRate = rate - npvValue / derivativeValue;
        
        if (Math.abs(newRate - rate) < tolerance) {
            return newRate;
        }
        
        rate = newRate;
    }

    // Check if the result is reasonable
    if(Math.abs(npv(rate, cashflows)) > 1e-5) {
        return 0; // Did not converge to a solution
    }

    return rate;
}

export function calculateFutureValueLumpSum(presentValue, annualRate, years) {
  if (years <= 0) return presentValue;
  return presentValue * Math.pow(1 + annualRate / 100, years);
}

export function calculateFutureValueSIP(monthlyInvestment, annualRate, months) {
    if (months <= 0 || monthlyInvestment <= 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) {
        return monthlyInvestment * months;
    }
    // Formula for FV of an annuity due (assuming investments are at the beginning of the month)
    return monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}
