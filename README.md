# 💳 Digital Wallet API

A secure, role-based backend API for a digital wallet system (inspired by Bkash/Nagad), developed with **Express.js** and **Mongoose**.

## 🚀 Project Features

### 🔐 Authentication

* JWT-based login system
* Role support: `user`, `agent`, `admin`
* Secure password hashing using `bcryptjs`

### 📆 Role-Based Authorization

* Route protection via middleware (`checkAuth`)
* Granular access for `user`, `agent`, and `admin`

### 🌐 Wallet Management

* Auto wallet creation during registration
* Initial wallet balance: ৳50
* Wallet block/unblock functionality

### 💰 Transaction Management

* Add money (top-up)
* Withdraw money
* Send money to other users
* Agent: Cash-in / Cash-out to/from user wallets
* Transaction history tracking for all roles

### 📄 Admin Features

* View all users, agents, wallets, transactions
* Approve/suspend agent accounts
* Block/unblock user wallets

## 📁 Folder Structure

```
src/
├── modules/
│   ├── auth/            # Login, Registration
│   ├── user/            # User/Agent/Admin schemas and routes
│   ├── wallet/          # Wallet model and logic
│   ├── transaction/     # Transaction model and logic
│   └── agent/           # Agent logic and routes (cash-in/out, approval)
├── middlewares/         # checkAuth, error handling
├── config/              # Environment config
├── utils/               # Utility functions (e.g., JWT, hash)
├── app.ts               # Express app setup
```

## 🚮 Role Permissions Overview

| Action                 | User | Agent | Admin |
| ---------------------- | ---- | ----- | ----- |
| Register/Login         | ✅    | ✅     | ✅     |
| Wallet Created on Reg. | ✅    | ✅     | ❌     |
| Add Money (Self)       | ✅    | ❌     | ❌     |
| Withdraw (Self)        | ✅    | ❌     | ❌     |
| Send Money             | ✅    | ❌     | ❌     |
| Cash-In (to User)      | ❌    | ✅     | ❌     |
| Cash-Out (from User)   | ❌    | ✅     | ❌     |
| View Transactions      | ✅    | ✅     | ✅     |
| View All Users/Wallets | ❌    | ❌     | ✅     |
| Block/Unblock Wallet   | ❌    | ❌     | ✅     |
| Approve/Suspend Agent  | ❌    | ❌     | ✅     |

## 💡 API Endpoints Summary

### Auth

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ----------------------- |
| POST   | /api/v1/auth/register       | Register new user/agent |
| POST   | /api/v1/auth/login          | Login and receive token |
| POST   | /api/v1/auth/logout         | Logout user             |
| POST   | /api/v1/auth/reset-password | Reset user password     |
| POST   | /api/v1/auth/google         | Google login            |

### Wallet

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | /api/v1/wallet/all-wallet | Admin: View all wallets |

### Transactions

| Method | Endpoint                                   | Description                  |
| ------ | ------------------------------------------ | ---------------------------- |
| POST   | /api/v1/transaction/deposit                | Add money (user only)        |
| POST   | /api/v1/transaction/withdraw               | Withdraw money (user only)   |
| POST   | /api/v1/transaction/send-money             | Send money to user           |
| GET    | /api/v1/transaction/my-transaction-history | View personal transactions   |
| GET    | /api/v1/transaction/all-transaction        | Admin: View all transactions |

### Agent

| Method | Endpoint                                   | Description                          |
| ------ | ------------------------------------------ | ------------------------------------ |
| POST   | /api/v1/agent/agent-request                | User requests to become an agent     |
| PATCH  | /api/v1/agent/agent-approval-reject-status | Admin approves/rejects agent request |
| POST   | /api/v1/agent/cash-in                      | Agent cash-in to user wallet         |
| POST   | /api/v1/agent/cash-out                     | Agent cash-out from user wallet      |

### Admin

| Method | Endpoint                  | Description    |
| ------ | ------------------------- | -------------- |
| GET    | /api/v1/user/all-users    | View all users |
| PATCH  | /api/v1/user/block/:id   | Block user     |
| PATCH  | /api/v1/user/unblock/:id | Unblock user   |

## 📆 Setup Instructions

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/digital-wallet-api.git
   cd digital-wallet-api
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create `.env` file:

   ```env
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/digital-wallet
   JWT_ACCESS_SECRET=your_jwt_secret
   BCRYPT_SALT_ROUND=10
   ```
4. Run the server:

   ```bash
   npm run dev
   ```

## 🔢 Tech Stack

* **Backend**: Express.js
* **Database**: MongoDB + Mongoose
* **Authentication**: JWT, bcrypt
* **Testing Tool**: Postman

## 🔹 Notes

* All transactions are atomic: balance update + transaction record sync.
* Blocked wallets cannot send/receive/withdraw money.
* Role-based authorization is strictly enforced.

## 🌟 Author

# GitHub
GitHub: https://github.com/tanjimN4/Digital-Wallet-BackEnd

