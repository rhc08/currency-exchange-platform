# LBP Exchange Frontend — Sprint 2

**Student:** Rayane Chams Bacha  
**Sprint:** 2 — Frontend integrated with Sprint 1 backend

---

## Overview

React frontend application that integrates with the Sprint 1 Flask backend to provide:

- JWT authentication (register/login/logout)
- Exchange rate dashboard (USD↔LBP)
- Transaction management (create + list)
- Exchange rate graph (time-series chart)
- Placeholder pages for: Marketplace, Alerts, Watchlist, Export CSV, Notifications, Preferences, Admin

All routes include the student slug: `/rayane-chams-bacha/<page>`

A **Proof Panel** (top-right corner) shows student name, live time, and current route on every page.

---

## Prerequisites

- Node.js 18+
- npm 9+
- Sprint 1 backend running on `http://127.0.0.1:5000`

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional — defaults to http://127.0.0.1:5000)
cp .env .env.local
# Edit VITE_API_BASE_URL if your backend runs elsewhere

# 3. Start development server
npm run dev
```

Open: **http://127.0.0.1:3000/rayane-chams-bacha/dashboard**

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:5000` | Backend API base URL |

---

## Routes

| Route | Page | Auth Required |
|---|---|---|
| `/rayane-chams-bacha/login` | Login | No |
| `/rayane-chams-bacha/register` | Register | No |
| `/rayane-chams-bacha/dashboard` | Dashboard | Yes |
| `/rayane-chams-bacha/transactions` | Transaction List | Yes |
| `/rayane-chams-bacha/transactions/new` | New Transaction | Yes |
| `/rayane-chams-bacha/graphs` | Exchange Rate Graph | Yes |
| `/rayane-chams-bacha/marketplace` | P2P Marketplace | Yes |
| `/rayane-chams-bacha/alerts` | Rate Alerts | Yes |
| `/rayane-chams-bacha/watchlist` | Watchlist | Yes |
| `/rayane-chams-bacha/export` | Export CSV | Yes |
| `/rayane-chams-bacha/notifications` | Notifications | Yes |
| `/rayane-chams-bacha/preferences` | Preferences | Yes |
| `/rayane-chams-bacha/admin` | Admin Panel | Yes |

---

## Project Structure

```
src/
  components/
    Layout.jsx          — Sidebar + main content wrapper
    Sidebar.jsx         — Navigation sidebar
    ProofPanel.jsx      — Required proof panel (top-right)
    ProtectedRoute.jsx  — Auth guard wrapper
    UnavailablePage.jsx — Reusable "endpoint not available" page

  pages/
    Login.jsx
    Register.jsx
    Dashboard.jsx
    Transactions.jsx
    NewTransaction.jsx
    Graph.jsx
    Marketplace.jsx
    Alerts.jsx
    Watchlist.jsx
    ExportCSV.jsx
    Notifications.jsx
    Preferences.jsx
    Admin.jsx
    NotFound.jsx

  services/
    apiClient.js         — Axios instance + interceptors (auth header, 401/429 handling)
    authService.js       — register(), authenticate()
    transactionService.js — createTransaction(), getTransactions()
    exchangeService.js   — getExchangeRate()

  context/
    AuthContext.jsx      — JWT token state, login/logout

  App.jsx               — Router + route definitions
  index.css             — Global styles
  main.jsx              — Entry point
```

---

## Authentication

- JWT token stored in `localStorage` under key `jwt_token`
- Automatically attached to all requests via Axios request interceptor
- 401 responses automatically clear the token and redirect to `/rayane-chams-bacha/login?expired=1`
- 429 responses show a cooldown timer (30 seconds) on submit buttons

---

## Error Handling

| HTTP Status | Behavior |
|---|---|
| 400 | Shows backend error message |
| 401 | Shows error + redirects to login |
| 403 | Shows "Access forbidden" message |
| 404 | Shows "Not found" message |
| 429 | Shows "Too many requests. Wait and try again." + disables button for 30s |

---

## Build for Production

```bash
npm run build
npm run preview
```

---

## Notes on Optional Modules

The following pages exist in the UI but display "Backend endpoint not available for this feature." because the corresponding endpoints were not implemented in Sprint 1:

- Marketplace (`/marketplace`) — requires P2P offer endpoints
- Alerts (`/alerts`) — requires alert CRUD endpoints
- Watchlist (`/watchlist`) — requires watchlist endpoints
- Export CSV (`/export`) — requires `/transaction/export` endpoint
- Notifications (`/notifications`) — requires notifications service endpoints
- Preferences (`/preferences`) — requires user preferences endpoints
- Admin (`/admin`) — requires RBAC + admin endpoints
