# TrackCash API

Industry-grade Express backend for TrackCash — a cash flow tracker for informal sector workers.

## Stack
- **Express** — HTTP server
- **MySQL + Knex** — database + query builder + migrations
- **Joi** — request validation
- **JWT** — access + refresh token auth
- **bcryptjs** — password hashing
- **helmet / cors / rate-limit** — security
- **winston + daily-rotate-file** — structured logging
- **dotenv** — environment config

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your DB credentials and JWT secrets
```

### 3. Create the database
```sql
CREATE DATABASE trackcash;
```

### 4. Run migrations
```bash
npm run migrate
```

### 5. (Optional) Seed demo data
```bash
npm run seed
```

### 6. Start
```bash
npm run dev      # development (nodemon)
npm start        # production
```

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

All protected routes require:
```
Authorization: Bearer <access_token>
```

---

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login |
| POST | /auth/refresh | No | Refresh access token |
| GET | /auth/me | Yes | Get current user |
| PATCH | /auth/change-password | Yes | Change password |

**POST /auth/register**
```json
{
  "name": "Mwila Banda",
  "email": "mwila@example.com",
  "password": "securepass",
  "currency": "ZMW",
  "monthly_income_goal": 4000
}
```

---

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /dashboard | Yes | Home screen aggregate data |

Returns: income, expenses, available cash, top category, recent expenses, savings total.

---

### Expenses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /expenses | Yes | List expenses (paginated) |
| POST | /expenses | Yes | Record an expense |
| GET | /expenses/summary | Yes | Category breakdown for a month |
| GET | /expenses/:id | Yes | Get single expense |
| PATCH | /expenses/:id | Yes | Update expense |
| DELETE | /expenses/:id | Yes | Delete expense |

**POST /expenses**
```json
{
  "amount": 15.00,
  "category": "food",
  "note": "Ice cream at Manda Hill",
  "recorded_at": "2026-06-03T14:30:00Z"
}
```

Categories: `food` | `home` | `phone` | `transport` | `savings` | `miscellaneous`

**GET /expenses?page=1&limit=20&category=food&from=2026-06-01&to=2026-06-30**

---

### Income

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /income | Yes | List income entries (paginated) |
| POST | /income | Yes | Log income |
| GET | /income/summary | Yes | Breakdown + variance for a month |
| GET | /income/:id | Yes | Get single entry |
| PATCH | /income/:id | Yes | Update entry |
| DELETE | /income/:id | Yes | Delete entry |

**POST /income**
```json
{
  "amount": 320.00,
  "type": "daily_wage",
  "expected_amount": 350.00,
  "note": "Construction job, Kabulonga",
  "recorded_at": "2026-06-03T08:00:00Z"
}
```

Types: `daily_wage` | `contract` | `side_hustle` | `gift` | `other`

---

### Savings Goals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /savings | Yes | List all goals |
| POST | /savings | Yes | Create a goal |
| GET | /savings/:id | Yes | Get goal + deposit history |
| PATCH | /savings/:id | Yes | Update goal |
| DELETE | /savings/:id | Yes | Delete goal |
| POST | /savings/:id/deposit | Yes | Add money to a goal |

**POST /savings**
```json
{
  "title": "New TV",
  "target_amount": 3500.00,
  "icon": "tv",
  "deadline": "2026-12-31"
}
```

**POST /savings/:id/deposit** ← this is what tapping a goal card calls
```json
{
  "amount": 100.00,
  "note": "Saved from this week's wages"
}
```

---

## Project Structure

```
src/
├── config/
│   ├── env.js          # Joi-validated env vars
│   ├── db.js           # Knex singleton
│   └── knexfile.js     # DB config per environment
├── controllers/        # Route handlers
├── db/
│   ├── migrations/     # Table definitions
│   └── seeds/          # Demo data
├── middleware/
│   ├── auth.js         # JWT protect
│   ├── validate.js     # Joi middleware
│   └── errorHandler.js # Global error handler
├── routes/             # Express routers
├── utils/
│   ├── jwt.js          # Token helpers
│   ├── logger.js       # Winston logger
│   └── response.js     # Standardised responses
└── index.js            # App entry point
```

---

## Customisation points

- Add more expense categories in `validations/expense.validation.js` and the `002` migration
- Add more income types in `validations/income.validation.js` and the `003` migration
- Add `ALLOWED_ORIGIN` to `.env` for production CORS
- Add push notification triggers in the deposit controller for goal milestones
