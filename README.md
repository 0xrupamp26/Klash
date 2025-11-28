# Klash MVP - Full Stack Prediction Market

## Overview
Klash is a prediction market platform where users can bet on the outcome of real-world events, powered by AI sentiment analysis and blockchain settlement. This MVP features a fully integrated frontend and backend.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: NestJS, TypeScript, MongoDB
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose

## Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Docker)
- Docker (optional, for containerized deployment)

## Quick Start (Local Development)

### 1. Start MongoDB
Ensure MongoDB is running locally on port 27017.
```bash
mongod --dbpath /path/to/data/db
```

### 2. Start Backend
```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev
```
The backend will start at `http://localhost:3001`.
- API Health Check: `http://localhost:3001/api/health`
- API Documentation: `http://localhost:3001/api` (if Swagger enabled)

### 3. Start Frontend
```bash
cd klash-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will start at `http://localhost:8080` (or 5173).

## Docker Deployment (Production-Ready)

To run the entire stack (Backend + MongoDB) using Docker:

```bash
docker-compose up --build
```
This will start:
- **Backend API**: `http://localhost:3001`
- **MongoDB**: `localhost:27017`

## Environment Variables

### Backend (`.env`)
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb://localhost:27017/klash
PORT=3001
```

### Frontend (`klash-frontend/.env.local`)
Create a `.env.local` file in `klash-frontend`:
```env
VITE_API_URL=http://localhost:3001/api
```

## API Endpoints

### Markets
- `GET /api/markets`: List all markets
- `GET /api/markets/:id`: Get market details
- `POST /api/markets`: Create a new market
- `POST /api/markets/:id/bets`: Place a bet on a market

### Users & Auth
- `POST /api/auth/login`: Login with wallet address
- `POST /api/auth/register`: Register new user
- `GET /api/users/:walletAddress`: Get user profile
- `GET /api/users/:walletAddress/bets`: Get user's betting history

## Testing
1. Open Frontend: `http://localhost:8080`
2. Browse Markets: You should see a list of markets fetched from the backend.
3. Place a Bet: Click on a market, select a side, enter amount, and click "Place Bet".
4. View Portfolio: Go to Portfolio page to see your active and resolved bets.

## Troubleshooting
- **Backend not connecting?** Check if MongoDB is running and `MONGO_URI` is correct.
- **CORS errors?** Ensure backend `main.ts` allows the frontend origin.
- **Frontend data missing?** Check browser console for API errors.
