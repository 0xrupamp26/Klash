# Frontend-Backend Integration Guide

## Overview
This guide explains how to run the Klash frontend and backend together for local development.

## Prerequisites
- Node.js 18+ installed
- MongoDB running (via Docker or locally on port 27017)
- Redis running (via Docker or locally on port 6379)

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Start MongoDB and Redis**:
   ```bash
   docker-compose up -d
   ```

2. **Start Backend** (in root directory):
   ```bash
   npm install
   npm run start:dev
   ```
   Backend will run on `http://localhost:3001`

3. **Start Frontend** (in klash-frontend directory):
   ```bash
   cd klash-frontend
   npm install
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Option 2: Manual Setup

If Docker is not available:

1. **Install and start MongoDB** (port 27017)
2. **Install and start Redis** (port 6379)
3. **Configure environment variables** (see below)
4. **Start backend and frontend** as described above

## Environment Variables

### Backend (.env in root)
```
MONGO_URI=mongodb://root:example@localhost:27017/klash?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
```

### Frontend (.env.local in klash-frontend/)
```
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

## API Endpoints

The backend exposes the following endpoints at `http://localhost:3001/api`:

### Markets
- `GET /markets` - Get all markets
- `GET /markets/:id` - Get market by ID
- `POST /markets` - Create new market

### Bets
- `POST /bets` - Place a bet
  ```json
  {
    "marketId": "string",
    "outcome": 0 | 1,
    "amount": number,
    "walletAddress": "string"
  }
  ```
- `GET /bets/user/:userId` - Get user's bets

### Users
- `POST /users` - Create/get user
  ```json
  {
    "walletAddress": "string",
    "username": "string (optional)",
    "email": "string (optional)"
  }
  ```
- `GET /users/:walletAddress` - Get user by wallet

## Testing the Integration

1. **Check Backend Health**:
   ```bash
   curl http://localhost:3001/api/markets
   ```
   Should return an array of markets (sample data is seeded automatically)

2. **Open Frontend**:
   Navigate to `http://localhost:5173` in your browser

3. **Verify Connection**:
   - Markets should load on the homepage
   - Check browser console for any CORS or network errors

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 3001
- Check that CORS is enabled in `src/main.ts`

### Markets Not Loading
- Verify backend is running: `curl http://localhost:3001/api/markets`
- Check MongoDB connection in backend logs
- Ensure frontend .env.local has correct VITE_API_URL

### Database Connection Failed
- Ensure MongoDB is running on port 27017
- Check MONGO_URI in backend .env file
- Verify credentials (default: root/example)

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Vite will auto-increment port (5173 → 5174)

## Sample Data

The backend automatically seeds 3 sample markets on first startup:
1. Bitcoin price prediction
2. AI replacing developers
3. Elon Musk stepping down

You can view these at `http://localhost:3001/api/markets`

## Next Steps

- Connect wallet (Petra/Aptos) on frontend
- Place a test bet
- Implement real-time updates (WebSockets)
- Integrate AI service for market creation
- Deploy smart contracts to Aptos testnet
