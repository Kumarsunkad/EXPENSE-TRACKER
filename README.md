# Expense Tracker System

A modern web application for tracking personal expenses and income with a clean, intuitive interface.

## Features

- Add transactions with amount, type (credit/debit), category, and description
- View transaction history with filtering by type (All/Credit/Debit)
- Edit existing transactions
- Delete transactions
- Real-time balance calculation (Credit, Debit, and Total)
- Responsive design for all screen sizes
- Modern UI with animations and user feedback
- Persistent data storage using JSON file
- Error handling and validation

## Setup and Run Instructions

1. Clone the repository:
```bash
git clone [repository-url]
cd Expense-Tracker-System
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Technology Stack

- Frontend:
  - HTML5
  - CSS3 (with CSS Grid and Flexbox)
  - JavaScript (ES6+)
  - Font Awesome for icons

- Backend:
  - Node.js
  - Express.js
  - CORS middleware
  - JSON file storage

## Assumptions and Known Limitations

1. The application assumes that:
   - All amounts are in Indian Rupees (₹)
   - Transactions are stored locally in a JSON file
   - The server runs on localhost:3000

2. Known Limitations:
   - Data is stored locally and may be lost if the application is moved to a different machine
   - No user authentication system
   - No data backup mechanism
   - No export functionality for transaction data

## Implementation Details

### Core Features Implemented:

1. **Add Transactions**
   - Users can add new transactions with amount, type, category, and description
   - Input validation for required fields
   - Real-time balance update
   - Success/error feedback messages

2. **View Transactions**
   - Display all transactions in a clean list
   - Filter transactions by type (Credit/Debit)
   - Empty state message when no transactions exist
   - Responsive card-based layout

3. **Edit Transactions**
   - Edit existing transactions through a modal form
   - Maintain transaction history integrity
   - Update balances in real-time

4. **Delete Transactions**
   - Delete individual transactions with confirmation
   - Update balances immediately
   - Remove from UI instantly

5. **Balance Calculation**
   - Real-time calculation of Credit total
   - Real-time calculation of Debit total
   - Automatic calculation of net balance
   - Updates automatically with every transaction

## API Endpoints

- `GET /api/transactions` - Get all transactions with optional type filter
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update existing transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats` - Get transaction statistics (credit, debit, balance)

## Error Handling

- Input validation for all form submissions
- Error messages for failed operations
- Loading states during API calls
- Graceful handling of network errors

## Future Improvements

1. Add user authentication
2. Implement data export functionality
3. Add data backup mechanism
4. Add charts and visualizations
5. Implement dark mode
6. Add search functionality for transactions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
