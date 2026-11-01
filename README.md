# SGM Mart — Next-Gen E-Commerce & 16-Income MLM Platform

A hybrid enterprise platform merging an **E-Commerce Direct-to-Consumer (D2C) Storefront** with a **16-Stream Multi-Level Marketing (MLM) Network Distribution Engine**, fully compliant with India's **Consumer Protection (Direct Selling) Rules, 2021**.

---

## 🏛️ System Architecture

### 1. Three-Tier Isolated Authentication Hierarchy
- **Stealth Superadmin (`/superadminlogin`)**:
  - Resides exclusively in the `system_masters` database table.
  - Zero presence in `admins` or `users` tables. Sub-admins have no visibility or trace of the Superadmin's existence.
  - Distinct cryptographic JWT signature secret (`JWT_SUPERADMIN_SECRET`).
  - Terminal-grade security for system overrides, company turnover pools (CTO), and emergency controls.
- **Staff Administration (`/adminlogin`)**:
  - Resides in `admins` table with granular Role-Based Access Control (RBAC).
  - Handles daily operations: Product catalog, KYC approval, order dispatch, and customer support.
- **Member & Distributor Portal (`/login` & `/register`)**:
  - Direct Sellers and retail shoppers.
  - Direct referral link (`/register?ref=SPONSOR_ID&pos=L|R`).
  - Real-time genealogies, 4-wallet balances, and payout statements.

---

## 💎 Impeccable Design Standards
Adheres to [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) design principles:
- **No AI Clichés**: Replaces generic AI templates (cookie-cutter gradient cards, unstyled default Tailwind) with custom luxury styling.
- **Color Identity**:
  - Royal Forest Emerald: `#144732` / `#0B2B1E`
  - Warm Sandstone Gold: `#D4A359` / `#92580A`
  - Warm Ivory Parchment: `#F8F6F0`
- **Bilingual Typography**: Clean dual-script font pairing with `Outfit` (Latin/English) and `Noto Sans Devanagari` (Hindi).

---

## 📊 16-Stream MLM Business Logic
1. **Retail Profit**: 5% – 50% Margin on MRP
2. **Direct Referral Bonus**: 10% on Activation Package PV
3. **Binary Matching Income**: 10% (1:1 Ratio; first pair 1:2 or 2:1), Daily 12 AM Closing
4. **Direct Sponsor Royalty**: 10% on direct downline matching earnings
5. **Awards & Rewards**: 3% dedicated pool across 15 Ranks (1-Star to Crown Ambassador)
6. **Leadership Royalty**: 5% Company Turnover (CTO) on 3,000 PV direct volume
7. **Company CTO Partner**: 5% Company Turnover (CTO) on 5,000 PV direct volume (Lifetime)
8. **Universal AutoPool Matrix**: 7-Level 2x2 Global Spillover Matrix (₹13.19 Cr+ potential)
9. **Self Purchase Cashback**: 10% BV
10. **Team Repurchase Bonus**: 10% Team BV
11. **Mobile Fund**: 2% CTO Pool
12. **Bike Fund**: 2% CTO Pool
13. **Car Fund**: 2% CTO Pool
14. **House Fund**: 2% CTO Pool
15. **Mobile Recharge Cashback**: 2.50% Flat
16. **DTH Recharge Cashback**: 2.50% Flat

### Settlements & Compliance
- **Minimum Withdrawal**: ₹100
- **Deductions**: 5% Admin Charge + 5% TDS
- **Daily Closing**: Midnight 12:00 AM
- **Withdrawal Processing**: Weekly Bank Batch

---

## 🗄️ Neon PostgreSQL Database
Configured with Neon Serverless PostgreSQL:
- **Pooled Connection**: `DATABASE_URL` for high-throughput serverless API queries.
- **Direct Connection**: `DIRECT_URL` for Prisma schema push and migrations.

### Initial Seed Data:
- **Stealth Superadmin**: `username: superroot` (Password: `SuperSGM@2026!Secure`)
- **Staff Admin**: `username: opsadmin` (Password: `AdminSGM@2026`)
- **Master Root Distributor**: `userCode: SGM10001` (Password: `SgmRoot@2026`)
- **9 Product Categories**: Kitchen Care, Health Care, Personal Care, Home Care, Beauty Care, Clothing, Jewellery, Agriculture, Electronics.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Push database schema to Neon
npx prisma db push

# Seed database with initial categories and master accounts
npm run seed

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
