# SaathiCare — Backend Inventory Report

## Technology Stack
| Component | Technology |
|---|---|
| Language | JavaScript (Node.js) |
| Runtime | Node.js 20.x |
| Framework | Express.js 4.x |
| Package Manager | npm (workspaces) |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT (jsonwebtoken) + httpOnly cookies |
| Password Hashing | bcryptjs (10 rounds) |
| Caching/Revocation | Redis (ioredis) with in-memory fallback |

## Architecture
- **Monolith** with MVC-like layered structure
- Routes → Controllers → Models → Database
- Middleware-based authentication and authorization

## API Structure
- **REST API** with JSON request/response
- Base path: `/api`
- Auth: `/api/auth` (register, login, logout, me, profile)
- Bookings: `/api/bookings` (CRUD, match, rate, report, SOS)
- Admin: `/api/admin` (users, bookings, analytics, approval, suspension)
- Health: `/api/health` (204 No Content)

## Authentication
- JWT with 2-hour expiry
- httpOnly cookie (`saathicare_token`)
- Bearer token fallback (Authorization header)
- Redis blocklist for token revocation

## Authorization
- RBAC: `elder_family`, `saathi`, `admin`
- `protect` middleware verifies JWT
- `authorize(...roles)` middleware checks role
- Ownership checks on booking mutations (IDOR prevention)

## Database Models
| Model | Purpose |
|---|---|
| User | Users (name, email, password, role, phone, address) |
| SaathiProfile | Saathi caregiver profiles (skills, rating, availability) |
| Booking | Care bookings (elder↔saathi, service, schedule) |
| Payment | Payment records (amount, status, method) |
| VisitReport | Post-visit reports (tasks, mood, concerns) |

## Security Features
- Helmet security headers
- CORS allowlist
- Rate limiting (20 req/15 min on auth)
- Body size limit (50kb)
- Input type guards (NoSQL injection prevention)
- Aadhaar masking in API responses
- Server-side price calculation
- Password strength validation
