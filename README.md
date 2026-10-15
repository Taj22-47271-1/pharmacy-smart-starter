# Pharmly — Pharmacy Inventory & Smart Reorder Assistant

> **NT Tech Innovation Full-Stack Developer Assessment Submission**  
> Complete full-stack application with real-world inventory management, transaction safety, explainable AI/heuristics reorder logic, authentication, and responsive modern UI.

---

## 1. Project Objective & Real Problem Solved

Hospital and retail pharmacies face severe challenges:
1. **Critical stockouts** of life-saving medicines due to manual, delayed reordering.
2. **Expired medicine losses** and high holding costs from over-purchasing.
3. **Data inconsistency and negative inventory drift** during sales peaks when systems lack atomic transaction safety.

**Pharmly** solves this by providing:
- Real-time catalog and stock monitoring with automatic status classification (`in stock`, `low stock`, `out of stock`).
- **Transaction-Safe Stock Movements** (`$transaction` in PostgreSQL) that strictly reject sales exceeding available stock.
- **Smart Reorder Heuristic Assistant** calculating optimal batch procurement based on safety buffers and replenishment costs.
- Complete vendor directory and auditable sales movement history.

---

## 2. Technology Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Responsive CSS matching the Pharmly design system.
- **Backend:** NestJS 10 REST API, TypeScript, Class-Validator, Bcrypt, JWT.
- **Database & ORM:** PostgreSQL 16+ via Prisma ORM v6 with relational modeling and atomic transaction guarantees.
- **Testing:** Jest unit tests verifying negative stock rejection and critical business rules.

---

## 3. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin Pharmacist** | `admin@pharmly.com` | `admin123` |

---

## 4. AI / Heuristic Feature Explanation (Assessment Requirement)

### Objective
Automates intelligent reorder decisions for pharmacy managers by calculating optimal replenishment quantities before medicines run out.

### Mathematical Heuristic Model
- **Inputs:**
  - $S$: Current stock quantity (Units)
  - $T$: Reorder safety threshold (Units)
  - $P$: Unit purchase cost ($)
- **Heuristic Rule:**
  - An item is flagged when $S \le T$.
  - **Priority Classification:**
    $$\text{Priority} = \begin{cases} \text{CRITICAL}, & \text{if } S = 0 \\ \text{HIGH}, & \text{if } S \le \lceil T / 2 \rceil \\ \text{MODERATE}, & \text{if } S \le T \end{cases}$$
  - **Suggested Replenishment Quantity:**
    $$Q_{\text{reorder}} = \max(2 \times T - S, 10)$$
  - **Estimated Replenishment Cost:**
    $$\text{Cost} = Q_{\text{reorder}} \times P$$

### Evaluation & Value
- Eliminates human calculation errors during peak hours.
- Evaluated against test cases: items at zero stock trigger immediate `CRITICAL` badges with 1-click restock actions.
- **Known Limitations:** As a threshold-based heuristic, it does not anticipate seasonal epidemic surges (e.g. dengue or flu) without historical multi-month time-series sales velocity data.

---

## 5. Security & Business Logic Guarantees

1. **Password Hashing:** Passwords are never stored in plaintext; salted and hashed using `bcryptjs` (cost factor 10).
2. **Stateless JWT Authentication:** Access tokens signed with `JWT_SECRET` and verified on protected operations.
3. **Strict Negative Stock Rejection:** When dispensing, if requested quantity exceeds current stock, the database transaction rolls back and returns HTTP `400 Bad Request`.
4. **Input Sanitization:** DTO validation using `class-validator` and `ValidationPipe` with whitelist enforcement.

---

## 6. Setup & Running Locally

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL server (Port 5432)
- Database named `pharmacy_smart`

### Step 1: Backend Setup
```bash
cd backend
npm install
# Configure backend/.env with your PostgreSQL credentials
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run start:dev
```
- API Base: `http://localhost:3001/api`
- Health: `http://localhost:3001/api/health`

### Step 2: Frontend Setup
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` in your browser.

---

## 7. Running Tests

```bash
cd backend
npm test
```
- Runs Jest test suites covering `health.controller.spec.ts` and `stock-movements.service.spec.ts` (100% passing).

---

## 8. Live Demonstration Guide (For Interview Review)

1. **Executive Overview (▦):** Show key metrics (Inventory value, active SKUs, monthly trends).
2. **Products Catalog (📦):** Filter by categories (Antibiotics, Pain Relievers, etc.), search by name/SKU, and test CSV export.
3. **Transaction Safety:** Click `- Dispense` on an item and enter an excessive quantity to demonstrate the strict transaction rejection of negative stock.
4. **Smart Reorder Assistant (⚡):** Show the explainable heuristic cards, priority classification, and execute a 1-click restock.
5. **Suppliers Directory (👥):** Display partner manufacturers and create a new supplier.
6. **Authentication:** Click `Logout` in the sidebar and log back in with `admin@pharmly.com` / `admin123`.
