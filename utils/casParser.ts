import type { MutualFund, Transaction } from '../types';

/**
 * Parses a CAMS/KFintech Consolidated Account Statement (CAS) PDF.
 * NOTE: This is a MOCK implementation. A real-world implementation would
 * require a sophisticated PDF parsing library (like pdf.js) and complex logic
 * to extract text and identify transaction patterns from the statement.
 * This function simulates that process for demonstration purposes.
 * 
 * @param file The PDF file object.
 * @param password The password for the PDF (usually the user's PAN).
 * @returns A promise that resolves to an array of parsed MutualFund objects.
 */
export const parseCamsStatement = (file: File, password: string): Promise<MutualFund[]> => {
    return new Promise((resolve, reject) => {
        console.log(`Simulating parsing for file: ${file.name} with password: ${password}`);

        // Simulate a delay for processing
        setTimeout(() => {
            if (password.toLowerCase() !== 'demopan') {
                return reject(new Error('Invalid password. For this demo, please use "demopan".'));
            }

            // Simulate extracting data from the PDF
            const parsedFunds: MutualFund[] = [
                {
                    id: `cas-${Date.now()}-1`,
                    name: 'ICICI Prudential Technology Fund',
                    owner: 'Self',
                    currentValue: 150000, // This would not be in the CAS, user updates this
                    transactions: [
                        { date: '2023-05-10', description: 'SIP Installment', amount: 5000, units: 45.87, price: 109.0, type: 'SIP' },
                        { date: '2023-06-10', description: 'SIP Installment', amount: 5000, units: 44.25, price: 113.0, type: 'SIP' },
                    ]
                },
                {
                    id: `cas-${Date.now()}-2`,
                    name: 'Parag Parikh Flexi Cap Fund',
                    owner: 'Self',
                    currentValue: 780000,
                    transactions: [
                         { date: '2023-04-05', description: 'SIP Installment', amount: 10000, units: 140.5, price: 71.1, type: 'SIP' },
                         { date: '2023-05-05', description: 'SIP Installment', amount: 10000, units: 138.5, price: 72.2, type: 'SIP' },
                         { date: '2023-06-05', description: 'SIP Installment', amount: 10000, units: 135.1, price: 74.0, type: 'SIP' },
                    ]
                }
            ];
            
            resolve(parsedFunds);

        }, 2000); // 2-second delay to simulate parsing
    });
};
