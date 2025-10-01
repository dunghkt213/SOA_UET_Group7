const accounts = [
    { accountNumber: '1234567890', owner: 'Nguyễn Văn A', balance: 5000000, currency: 'VND', status: 'active' },
    { accountNumber: '0987654321', owner: 'Trần Thị B', balance: 3000000, currency: 'VND', status: 'active' },
    { accountNumber: '1122334455', owner: 'Lê Văn C', balance: 10000000, currency: 'VND', status: 'frozen' }
];

const transactions = [
    { id: 1, fromAccount: '1234567890', toAccount: '0987654321', amount: 500000, type: 'TRANSFER', timestamp: new Date('2024-01-15'), status: 'completed' }
];

class BankService {
    checkBalance(accountNumber) {
        console.log(` Checking balance for account: ${accountNumber}`);
        
        const account = accounts.find(acc => acc.accountNumber === accountNumber);
        if (!account) {
            throw new Error(`Account ${accountNumber} not found`);
        }
        
        if (account.status !== 'active') {
            throw new Error(`Account ${accountNumber} is ${account.status}`);
        }
        
        return {
            accountNumber: account.accountNumber,
            owner: account.owner,
            balance: account.balance,
            currency: account.currency,
            timestamp: new Date().toISOString()
        };
    }

    transferFunds(fromAccount, toAccount, amount, description) {
        console.log(`Transfer ${amount} from ${fromAccount} to ${toAccount}`);
        
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const sourceAccount = accounts.find(acc => acc.accountNumber === fromAccount);
        const targetAccount = accounts.find(acc => acc.accountNumber === toAccount);

        if (!sourceAccount) throw new Error(`Source account ${fromAccount} not found`);
        if (!targetAccount) throw new Error(`Target account ${toAccount} not found`);
        if (sourceAccount.status !== 'active') throw new Error(`Source account is ${sourceAccount.status}`);
        if (targetAccount.status !== 'active') throw new Error(`Target account is ${targetAccount.status}`);
        if (sourceAccount.balance < amount) throw new Error('Insufficient funds');

        sourceAccount.balance -= amount;
        targetAccount.balance += amount;

        const transaction = {
            id: transactions.length + 1,
            fromAccount,
            toAccount,
            amount,
            description: description || 'Chuyển khoản',
            type: 'TRANSFER',
            timestamp: new Date(),
            status: 'completed'
        };
        transactions.push(transaction);

        return {
            transactionId: transaction.id,
            fromAccount: sourceAccount.accountNumber,
            toAccount: targetAccount.accountNumber,
            amount: amount,
            newBalance: sourceAccount.balance,
            currency: sourceAccount.currency,
            timestamp: transaction.timestamp.toISOString(),
            status: 'completed'
        };
    }

    getTransactionHistory(accountNumber, days = 30) {
        console.log(`Getting transaction history for: ${accountNumber}`);
        
        const account = accounts.find(acc => acc.accountNumber === accountNumber);
        if (!account) {
            throw new Error(`Account ${accountNumber} not found`);
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const accountTransactions = transactions.filter(t => 
            t.fromAccount === accountNumber || t.toAccount === accountNumber
        ).filter(t => new Date(t.timestamp) >= cutoffDate);

        return {
            accountNumber: accountNumber,
            period: `${days} days`,
            transactions: accountTransactions.map(t => ({
                transactionId: t.id,
                type: t.type,
                amount: t.amount,
                counterparty: t.fromAccount === accountNumber ? t.toAccount : t.fromAccount,
                direction: t.fromAccount === accountNumber ? 'OUTGOING' : 'INCOMING',
                description: t.description,
                timestamp: t.timestamp.toISOString(),
                status: t.status
            })),
            summary: {
                totalTransactions: accountTransactions.length,
                totalOutgoing: accountTransactions
                    .filter(t => t.fromAccount === accountNumber)
                    .reduce((sum, t) => sum + t.amount, 0),
                totalIncoming: accountTransactions
                    .filter(t => t.toAccount === accountNumber)
                    .reduce((sum, t) => sum + t.amount, 0)
            }
        };
    }

    openAccount(customerName, initialDeposit, currency = 'VND') {
        console.log(`Opening account for: ${customerName}`);
        
        if (initialDeposit < 0) {
            throw new Error('Initial deposit cannot be negative');
        }

        const newAccountNumber = this.generateAccountNumber();
        const newAccount = {
            accountNumber: newAccountNumber,
            owner: customerName,
            balance: initialDeposit,
            currency: currency,
            status: 'active',
            openedAt: new Date()
        };

        accounts.push(newAccount);

        if (initialDeposit > 0) {
            const transaction = {
                id: transactions.length + 1,
                fromAccount: 'BANK',
                toAccount: newAccountNumber,
                amount: initialDeposit,
                description: 'Tiền gửi ban đầu',
                type: 'DEPOSIT',
                timestamp: new Date(),
                status: 'completed'
            };
            transactions.push(transaction);
        }

        return {
            accountNumber: newAccountNumber,
            owner: customerName,
            initialBalance: initialDeposit,
            currency: currency,
            status: 'active',
            message: 'Account opened successfully'
        };
    }

    generateAccountNumber() {
        return Math.random().toString().substr(2, 10);
    }
}

module.exports = BankService;