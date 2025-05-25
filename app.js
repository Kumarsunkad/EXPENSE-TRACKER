// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const transactionsList = document.getElementById('transactionsList');
const totalBalance = document.getElementById('totalBalance');
const totalCredit = document.getElementById('totalCredit');
const totalDebit = document.getElementById('totalDebit');
const noTransactions = document.getElementById('noTransactions');
const filterButtons = document.querySelectorAll('.filter-btn');
const typeButtons = document.querySelectorAll('.type-btn');

// API configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize UI
initializeUI();

// Event Listeners
transactionForm.addEventListener('submit', handleAddTransaction);
transactionsList.addEventListener('click', handleTransactionAction);
filterButtons.forEach(button => button.addEventListener('click', handleFilterChange));
typeButtons.forEach(button => button.addEventListener('click', handleTypeChange));

// Initialize UI
async function initializeUI() {
    try {
        await loadTransactions();
        updateBalanceDisplay();
    } catch (error) {
        console.error('Error initializing UI:', error);
        showErrorMessage('Failed to load transactions');
    }
}

// Handle Add Transaction
async function handleAddTransaction(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.querySelector('.type-btn.active').dataset.type;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();

    if (!amount || !type || !category) {
        showErrorMessage('Please fill in all required fields');
        return;
    }

    try {
        // Show loading state
        const submitBtn = e.target;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount,
                type,
                category,
                description
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add transaction');
        }

        const result = await response.json();
        
        // Add transaction to UI
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
            <div class="transaction-details">
                <span class="amount ${type === 'credit' ? 'credit' : 'debit'}">
                    ₹${amount}
                </span>
                <span class="category">${category}</span>
                ${description ? `<span class="description">${description}</span>` : ''}
            </div>
            <div class="transaction-actions">
                <button class="edit-btn" data-id="${result.transaction.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" data-id="${result.transaction.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        transactionsList.insertBefore(transactionElement, transactionsList.firstChild);
        
        // Update balance
        updateBalanceDisplay(result.stats);
        
        // Reset form
        transactionForm.reset();
        document.querySelector('.type-btn.credit').click();
        
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        showSuccessMessage('Transaction added successfully');
    } catch (error) {
        console.error('Error adding transaction:', error);
        showErrorMessage(error.message);
    }
}

// Handle Transaction Actions (Edit/Delete)
async function handleTransactionAction(e) {
    if (e.target.classList.contains('delete-btn')) {
        await handleDeleteTransaction(e.target.dataset.id);
    } else if (e.target.classList.contains('edit-btn')) {
        await handleEditTransaction(e.target.dataset.id);
    }
}

// Handle Delete Transaction
async function handleDeleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete transaction');

        await loadTransactions();
        showSuccessMessage('Transaction deleted successfully');
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showErrorMessage('Failed to delete transaction');
    }
}

// Handle Edit Transaction
async function handleEditTransaction(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch transaction');

        const transaction = await response.json();
        
        // Create and show edit modal
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Transaction</h3>
                <form id="editForm">
                    <div class="form-group">
                        <label for="editAmount">Amount:</label>
                        <div class="input-group">
                            <span class="input-prefix">₹</span>
                            <input type="number" id="editAmount" value="${transaction.amount}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editType">Transaction Type:</label>
                        <div class="type-selector">
                            <button type="button" class="type-btn credit ${transaction.type === 'credit' ? 'active' : ''}" data-type="credit">
                                <i class="fas fa-arrow-up"></i> Credit
                            </button>
                            <button type="button" class="type-btn debit ${transaction.type === 'debit' ? 'active' : ''}" data-type="debit">
                                <i class="fas fa-arrow-down"></i> Debit
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editCategory">Category:</label>
                        <select id="editCategory" required>
                            <option value="food" ${transaction.category === 'food' ? 'selected' : ''}>🍔 Food</option>
                            <option value="transport" ${transaction.category === 'transport' ? 'selected' : ''}>🚗 Transport</option>
                            <option value="shopping" ${transaction.category === 'shopping' ? 'selected' : ''}>🛍️ Shopping</option>
                            <option value="salary" ${transaction.category === 'salary' ? 'selected' : ''}>💰 Salary</option>
                            <option value="other" ${transaction.category === 'other' ? 'selected' : ''}>📝 Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editDescription">Description:</label>
                        <input type="text" id="editDescription" value="${transaction.description || ''}">
                    </div>
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button type="button" class="cancel-btn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        const editForm = modal.querySelector('#editForm');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const typeBtns = modal.querySelectorAll('.type-btn');

        // Handle type selection in modal
        typeBtns.forEach(btn => btn.addEventListener('click', (e) => {
            typeBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        }));

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const updatedTransaction = {
                    amount: parseFloat(document.getElementById('editAmount').value),
                    type: modal.querySelector('.type-btn.active').dataset.type,
                    category: document.getElementById('editCategory').value,
                    description: document.getElementById('editDescription').value.trim(),
                };

                const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTransaction),
                });

                if (!response.ok) throw new Error('Failed to update transaction');

                await loadTransactions();
                modal.remove();
                showSuccessMessage('Transaction updated successfully');
            } catch (error) {
                console.error('Error updating transaction:', error);
                showErrorMessage('Failed to update transaction');
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
    } catch (error) {
        console.error('Error loading transaction:', error);
        showErrorMessage('Failed to load transaction for editing');
    }
}

// Handle Filter Change
function handleFilterChange(e) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    loadTransactions(e.currentTarget.dataset.filter);
}

// Handle Type Change
function handleTypeChange(e) {
    typeButtons.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
}

// Load Transactions
async function loadTransactions(filter = 'all') {
    try {
        // Load transactions with optional filter
        let url = `${API_BASE_URL}/transactions`;
        if (filter !== 'all') {
            url += `?type=${filter}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load transactions');

        const transactions = await response.json();
        renderTransactions(transactions);

        // Load transaction stats
        const statsResponse = await fetch(`${API_BASE_URL}/transactions/stats`);
        if (!statsResponse.ok) throw new Error('Failed to load transaction stats');

        const stats = await statsResponse.json();
        updateBalanceDisplay(stats);
    } catch (error) {
        console.error('Error loading data:', error);
        showErrorMessage('Failed to load data');
    }
}

// Render Transactions
function renderTransactions(transactions) {
    transactionsList.innerHTML = transactions.length > 0 ? '' : noTransactions.outerHTML;
    
    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
            <div class="transaction-details">
                <span class="amount ${transaction.type === 'credit' ? 'credit' : 'debit'}">
                    ₹${transaction.amount}
                </span>
                <span class="category">${transaction.category}</span>
                ${transaction.description ? `<span class="description">${transaction.description}</span>` : ''}
            </div>
            <div class="transaction-actions">
                <button class="edit-btn" data-id="${transaction.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" data-id="${transaction.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        transactionsList.appendChild(transactionElement);
    });
}

// Update Balance Display
function updateBalanceDisplay(stats) {
    if (!stats) {
        // If no stats provided, calculate from current transactions
        const creditTotal = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const debitTotal = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        const balance = creditTotal - debitTotal;
        stats = { creditTotal, debitTotal, balance };
    }

    totalCredit.textContent = `₹${stats.creditTotal.toFixed(2)}`;
    totalDebit.textContent = `₹${stats.debitTotal.toFixed(2)}`;
    totalBalance.textContent = `₹${stats.balance.toFixed(2)}`;
}

// Show Success Message
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Show Error Message
function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
