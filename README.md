# IT24101689 Customer Management Module

A full-stack modern web application for an ERP system focusing on Customer Management and dynamic Segment tuning.

## Technology Stack
- **Frontend**: React (Vite) + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Role-based access)

## Folder Structure
- `/server`: Node.js backend API and services.
- `/client`: React frontend application.

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on default port 27017

## Setup Instructions

### 1. Database & Backend
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Environment variables are pre-configured in `.env` for local testing. (See `.env.example` for reference).
4. Run the database seed script to load initial mock data:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend
1. Open a new terminal and navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at the URL provided by Vite (usually `http://localhost:5173`).

## Test Accounts
The seed script generates two default accounts:
- **Admin**: `admin` / `password123` (Full access, config tuning)
- **Sales Staff**: `sales` / `password123` (Read-only plus adding purchases)

## Integration Points
The module is designed to be fully modular and isolated inside the `IT24101689` folder. Other modules (e.g., Sales) can integrate seamlessly by hitting the following critical endpoint:

### Add Purchase (Sales Integration)
```http
PATCH /api/customers/:id/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 150000
}
```
*Note: Discount calculations apply atomically when purchases are updated and dynamically when fetching customers. Final discount rates are not statically stored to avoid data inconsistency over time.*
