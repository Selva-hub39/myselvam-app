(() => {
    const generateMissingSipTransactions = (fund) => {
        if (!fund.sipAmount || !fund.sipStartDate) {
            return fund;
        }

        const newTransactions = [...(fund.transactions || [])];
        let lastSipDate;

        const sipTransactions = newTransactions
            .filter(t => t.description && t.description.includes('SIP'))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sipTransactions.length > 0) {
            lastSipDate = new Date(sipTransactions[0].date);
        } else {
            // If no SIP transactions, start from the SIP start date
            lastSipDate = new Date(fund.sipStartDate);
             // We need to account for the very first SIP, so we step back one month
            lastSipDate.setMonth(lastSipDate.getMonth() - 1);
        }

        const today = new Date();
        const sipDay = new Date(fund.sipStartDate).getUTCDate();

        // Start checking from the month after the last SIP
        let currentDate = new Date(Date.UTC(lastSipDate.getUTCFullYear(), lastSipDate.getUTCMonth() + 1, sipDay));

        while (currentDate <= today) {
            const nav = newTransactions.length > 0 ? (newTransactions[newTransactions.length - 1].nav || 10) : 10; // Placeholder NAV
            const units = fund.sipAmount / nav;
            
            newTransactions.push({
                date: currentDate.toISOString().split('T')[0],
                description: 'SIP Installment',
                amount: fund.sipAmount,
                units: parseFloat(units.toFixed(4)),
                nav: parseFloat(nav.toFixed(4)),
                balance: 0, // Balance would need complex calculation, placeholder
                type: 'purchase'
            });
            // Move to the next month
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
        }

        return { ...fund, transactions: newTransactions };
    };
    
    window.MySelvam.utils.generateMissingSipTransactions = generateMissingSipTransactions;
})();
