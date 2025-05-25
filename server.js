import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for transactions
let transactions = [];
let transactionIdCounter = 1;

// Routes
app.get('/api/transactions', (req, res) => {
    try {
        const { type } = req.query;
        let filteredTransactions = transactions;

        if (type && type !== 'all') {
            filteredTransactions = transactions.filter(t => t.type === type);
        }

        res.json(filteredTransactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

app.get('/api/transactions/stats', (req, res) => {
    try {
        const creditTotal = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const debitTotal = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = creditTotal - debitTotal;

        res.json({
            creditTotal,
            debitTotal,
            balance
        });
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).json({ error: 'Failed to fetch transaction stats' });
    }
});

app.post('/api/transactions', (req, res) => {
    try {
        const { amount, type, category, description } = req.body;
        
        if (!amount || !type || !category) {
            return res.status(400).json({ 
                error: 'Validation Error', 
                message: 'Amount, type, and category are required' 
            });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ 
                error: 'Validation Error', 
                message: 'Amount must be a positive number' 
            });
        }

        const transaction = {
            id: transactionIdCounter++,
            amount: parseFloat(amount),
            type,
            category,
            description: description || '',
            date: new Date().toISOString()
        };

        transactions.push(transaction);
        saveData();

        // Calculate and return updated stats
        const creditTotal = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const debitTotal = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = creditTotal - debitTotal;

        res.status(201).json({
            success: true,
            data: {
                transaction,
                stats: {
                    creditTotal,
                    debitTotal,
                    balance
                }
            }
        });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to add transaction' 
        });
    }
});

app.put('/api/transactions/:id', (req, res) => {
    try {
        const { amount, type, category, description } = req.body;
        const id = parseInt(req.params.id);
        const index = transactions.findIndex(t => t.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (!amount || !type || !category) {
            return res.status(400).json({ error: 'Amount, type, and category are required' });
        }

        transactions[index] = {
            ...transactions[index],
            amount: parseFloat(amount),
            type,
            category,
            description: description || '',
            date: new Date().toISOString()
        };
        saveData();

        // Calculate and return updated stats
        const creditTotal = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const debitTotal = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = creditTotal - debitTotal;

        res.json({
            transaction: transactions[index],
            stats: {
                creditTotal,
                debitTotal,
                balance
            }
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

app.delete('/api/transactions/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = transactions.findIndex(t => t.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transactions = transactions.filter(t => t.id !== id);
        saveData();

        // Calculate and return updated stats
        const creditTotal = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const debitTotal = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = creditTotal - debitTotal;

        res.json({
            stats: {
                creditTotal,
                debitTotal,
                balance
            }
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

// Serve static files from the current directory
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
