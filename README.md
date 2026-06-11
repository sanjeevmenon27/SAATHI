# SaathiCare

SaathiCare is a full-stack elder companionship booking platform built with React, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, and JWT authentication.

## Features

- Warm, elder-friendly landing page with service overview, testimonials, and clear calls to action
- Role-based authentication for `elder_family`, `saathi`, and `admin`
- Elder/family dashboard with multi-step booking flow, live status, payment history, visit reports, rating, and SOS button
- Saathi dashboard with availability toggle, incoming requests, active visit tools, post-visit report, and earnings summary
- Admin dashboard with user management, Saathi approvals, booking oversight, and analytics
- Mongo seed script with sample elders, Saathis, bookings, visit reports, and mock payments

## Project Structure

```text
saathicare/
  client/   React + Vite + Tailwind frontend
  server/   Express + Mongoose API
```

## Setup

### 1. Prerequisites

- Node.js 20+ or newer
- MongoDB running locally on `mongodb://127.0.0.1:27017/saathicare`

### 2. Environment Files

Copy these examples if you want custom values:

- `server/.env.example` -> `server/.env`
- `client/.env.example` -> `client/.env`

Default values already target:

- API: `http://localhost:5000`
- Client: `http://localhost:5173`
- MongoDB: `mongodb://127.0.0.1:27017/saathicare`

### 3. Install Dependencies

From the repo root:

```powershell
npm.cmd install
```

If your shell allows workspaces normally, `npm install` also works outside restricted PowerShell execution policies.

### 4. Seed the Database

```powershell
npm.cmd run seed
```

### 5. Start the App

```powershell
npm.cmd run dev
```

Frontend:

- `http://localhost:5173`

Backend:

- `http://localhost:5000/api/health`

## Demo Accounts

### Elder / Family

- `meenakshi@example.com` / `Password123!`
- `arvind@example.com` / `Password123!`
- `priya@example.com` / `Password123!`

### Saathi

- `kalaivani@example.com` / `Password123!`
- `suresh@example.com` / `Password123!`
- `farzana@example.com` / `Password123!`
- `muthu@example.com` / `Password123!`
- `nivetha@example.com` / `Password123!`

### Admin

- `admin@saathicare.com` / `Admin123!`

## Seeded Data

- 3 elder/family users
- 5 Saathi profiles
- 8 bookings across `pending`, `confirmed`, `completed`, `cancelled`, `declined`, and `in_progress`
- 3 visit reports
- mock payments for each booking

## Deployment

This project is configured to be deployed as a single, unified website where the Express backend serves the compiled React frontend static files in production.

### Unified Deployment (e.g. Render, Railway, Heroku)

1. **Deploying to Render:**
   - Sign up/log in to [Render](https://render.com/).
   - Click **New** -> **Web Service**.
   - Connect your GitHub repository.
   - Configure the following settings:
     - **Runtime:** `Node`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm run start`
   - Under **Advanced**, add the following environment variables:
     - `NODE_ENV`: `production`
     - `MONGO_URI`: Your MongoDB connection string (e.g. MongoDB Atlas). *If left empty, the server will fallback to the in-memory mock store.*
     - `JWT_SECRET`: A secure random string.
     - `PORT`: `10000` (or let Render assign one automatically).

2. **Database Setup (Optional but Recommended):**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
   - In the database network access settings, allow access from all IPs (`0.0.0.0/0`) because Render's container IPs are dynamic.
   - Copy your connection string and paste it as the `MONGO_URI` environment variable.

3. **Seeding the Remote Database:**
   - To seed your production/remote database with the initial demo accounts and bookings, you can run the seed command locally, pointing to your Atlas database:
     ```bash
     MONGO_URI="your-mongodb-atlas-connection-string" npm run seed
     ```
     *(Or on Windows PowerShell: `$env:MONGO_URI="your-mongodb-atlas-connection-string"; npm run seed`)*

## Notes

- Payments are mock-only and stored in MongoDB.
- SOS uses a dummy API endpoint and server-side console log.
- Location is text-based by design.
- Saathi matching is based on approved profiles and skill overlap.
