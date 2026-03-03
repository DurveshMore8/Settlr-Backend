/**
 * Debt Simplification Algorithm (Greedy Approach)
 * 
 * Takes an object of balances { userId: netAmount }
 * Returns an array of transactions { from, to, amount } to settle up with minimum moves.
 * 
 * Positive balance = Owed money
 * Negative balance = Owes money
 */
export const simplifyDebts = (balances) => {
    const debtors = [];
    const creditors = [];

    // Separate debtors and creditors
    for (const [userId, amount] of Object.entries(balances)) {
        if (amount < -0.01) {
            debtors.push({ userId, amount: Math.abs(amount) });
        } else if (amount > 0.01) {
            creditors.push({ userId, amount });
        }
    }

    // Sort by amount descending to greedily settle largest debts first
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];

    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
        const debtor = debtors[d];
        const creditor = creditors[c];

        const amount = Math.min(debtor.amount, creditor.amount);

        if (amount > 0.01) {
            transactions.push({
                from: debtor.userId,
                to: creditor.userId,
                amount: Math.round(amount * 100) / 100
            });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount <= 0.01) d++;
        if (creditor.amount <= 0.01) c++;
    }

    return transactions;
};
