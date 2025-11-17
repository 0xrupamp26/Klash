# Frontend-Backend Integration Guide

## Overview
This guide explains how the Klash frontend integrates with the NestJS backend API to provide a fully functional prediction market application.

## Architecture
- **Frontend**: React + Vite + TypeScript (port 8080)
- **Backend**: NestJS + MongoDB (port 3000)
- **API**: RESTful endpoints with `/api` prefix

## Setup Instructions

### 1. Environment Configuration

#### Backend Environment
```bash
# Copy the example environment file
cd klash-backend
cp .env.example .env

# Configure your environment variables
# Key settings:
PORT=3000
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/klash
```

#### Frontend Environment
```bash
# Copy the example environment file
cd frontend
cp .env.example .env

# Configure your environment variables
# Key settings:
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 2. Install Dependencies

#### Backend
```bash
cd klash-backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Start the Applications

#### Start MongoDB
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

#### Start Backend
```bash
cd klash-backend
npm run start:dev
```
The backend will start on `http://localhost:3000`

#### Start Frontend
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:8080`

## API Integration Details

### API Client Configuration
The frontend uses a centralized API client (`src/services/api-client.ts`) that:
- Handles HTTP requests with Axios
- Manages authentication tokens
- Provides typed interfaces for API responses
- Includes error handling and retry logic

### Key API Endpoints

#### Markets
- `GET /api/markets` - List all markets
- `GET /api/markets/:id` - Get single market
- `POST /api/markets` - Create new market

#### Bets
- `GET /api/bets/user/:userId` - Get user's bets
- `POST /api/bets` - Place a bet

#### Resolution
- `GET /api/resolution/pending` - Get pending markets
- `POST /api/resolution/:marketId/resolve` - Resolve market

### React Hooks Integration
The frontend provides custom hooks (`src/hooks/use-api.ts`) for:
- `useMarkets()` - Fetch market data
- `useMarket(id)` - Fetch single market
- `useUserBets(userId)` - Fetch user bets
- `useApiMutation()` - Handle API mutations

### Data Flow
1. Frontend makes API calls through the centralized client
2. Backend processes requests and returns JSON responses
3. Frontend updates UI based on response data
4. Error states are handled gracefully with user feedback

## CORS Configuration
The backend is configured to accept requests from the frontend:
- Origin: `http://localhost:8080` (configurable via `FRONTEND_URL`)
- Credentials: Enabled
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization

## Authentication Flow
1. User connects wallet (Web3 integration)
2. Frontend stores wallet address in localStorage
3. API client includes wallet address in requests
4. Backend validates wallet address and processes requests

## WebSocket Integration
Real-time updates are handled through WebSocket connections:
- Connection URL: `ws://localhost:3000`
- Events: Market updates, bet confirmations, resolution results

## Testing the Integration

### 1. Verify Backend API
```bash
curl http://localhost:3000/api/markets
```

### 2. Check Frontend Connection
Open browser dev tools and navigate to `http://localhost:8080`
- Check Network tab for API calls
- Verify data is loading in the UI

### 3. Test Bet Placement
1. Connect a wallet (mock for development)
2. Select a market
3. Place a bet
4. Verify bet appears in user bets

## Troubleshooting

### Common Issues

#### CORS Errors
- Verify `FRONTEND_URL` in backend `.env`
- Check backend CORS configuration
- Ensure both applications are running

#### API Connection Issues
- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running on correct port
- Verify MongoDB connection

#### Data Not Loading
- Check browser console for errors
- Verify API endpoints are accessible
- Check network requests in dev tools

### Debug Mode
Enable debug logging:
```bash
# Backend
DEBUG=app:* npm run start:dev

# Frontend
VITE_DEBUG=true npm run dev
```

## Production Deployment

### Environment Variables
- Use production URLs for API endpoints
- Configure proper MongoDB connection
- Set up SSL certificates
- Configure proper CORS origins

### Build Commands
```bash
# Backend
npm run build
npm run start:prod

# Frontend
npm run build
# Deploy dist/ folder to web server
```

## Next Steps

1. **Authentication**: Implement proper JWT-based authentication
2. **Real-time Updates**: Enhance WebSocket integration
3. **Error Handling**: Add comprehensive error boundaries
4. **Performance**: Implement caching and optimization
5. **Testing**: Add unit and integration tests

## Support

For integration issues:
1. Check this guide first
2. Review console logs for errors
3. Verify environment configurations
4. Test API endpoints independently
