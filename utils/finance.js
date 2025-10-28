(() => {
  const utils = window.MySelvam.utils;

  utils.formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₹ 0.00';
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  // XIRR calculation using Newton-Raphson method
  utils.calculateXIRR = (transactions, currentValue) => {
    if (!transactions || transactions.length === 0) return 0;

    const values = transactions.map(tx => tx.amount);
    const dates = transactions.map(tx => new Date(tx.date));

    // Add current value as a positive cashflow at the present date
    values.push(currentValue);
    dates.push(new Date());

    const epoch = dates[0];
    const dateDiffs = dates.map(date => (date - epoch) / (1000 * 60 * 60 * 24));

    const npv = (rate) => {
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        sum += values[i] / Math.pow(1 + rate, dateDiffs[i] / 365.25);
      }
      return sum;
    };
    
    const derivative = (rate) => {
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        if (dateDiffs[i] > 0 && rate > -1) {
            sum -= (values[i] * dateDiffs[i]) / (365.25 * Math.pow(1 + rate, (dateDiffs[i] / 365.25) + 1));
        }
      }
      return sum;
    };

    let guess = 0.1; // Initial guess
    const tolerance = 0.000001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      const npvValue = npv(guess);
      const derivativeValue = derivative(guess);

      if (Math.abs(derivativeValue) < 1e-9) { // Prevent division by zero
        break;
      }
      
      const newGuess = guess - npvValue / derivativeValue;

      if (Math.abs(newGuess - guess) < tolerance) {
        return newGuess * 100; // Return as percentage
      }
      guess = newGuess;
    }
    
    return 0; // Return 0 if no solution found
  };
})();
