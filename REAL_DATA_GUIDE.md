# Klash - Real Data Integration Complete

## What Changed

### Backend
✅ **Disabled Sample Data Seeding**
- Modified `src/database/seed.service.ts` to skip automatic seeding
- Database will only contain markets created by the Twitter AI pipeline

### Frontend  
✅ **Switched to Real API Data**
- Updated `klash-frontend/src/pages/Index.tsx` to fetch from `/api/markets`
- Removed dependency on `mockMarkets`
- Added `useEffect` hook to fetch data on component mount
- Added loading state management

## How to Test

### 1. Start All Services

**Terminal 1 - klash-backend (NestJS AI Service)**:
```bash
cd klash-backend
npm run start:dev
```
Runs on `http://localhost:8000`

**Terminal 2 - Main Backend**:
```bash
# In root directory
npm run start:dev
```
Runs on `http://localhost:3001`

**Terminal 3 - Frontend**:
```bash
cd klash-frontend
npm run dev
```
Runs on `http://localhost:5173`

### 2. Create Markets from Twitter

**Trigger the AI Pipeline**:
```bash
curl -X POST http://localhost:3001/api/twitter-ai/run-pipeline
```

This will:
1. Fetch 50 latest tweets from @LafdaSinghAI
2. Analyze them for controversy using AI
3. Create markets for controversial tweets (confidence > 0.5)
4. Save to MongoDB

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "tweetsFetched": 50,
    "controversiesFound": 5,
    "marketsCreated": 3
  },
  "message": "Created 3 markets from 50 tweets"
}
```

### 3. View Markets

**Via API**:
```bash
curl http://localhost:3001/api/markets
```

**Via Frontend**:
Open `http://localhost:5173` - markets will load automatically!

## Data Flow

```
@LafdaSinghAI Tweets
    ↓
klash-backend (port 8000)
    ↓
Twitter API Fetch
    ↓
AI Controversy Detection
    ↓
Main Backend (port 3001)
    ↓
MongoDB Storage
    ↓
Frontend (port 5173)
    ↓
User Display
```

## Automated Scheduling

The Twitter AI pipeline runs **automatically every 30 minutes** via the scheduler in `src/twitter-ai/twitter-ai.scheduler.ts`.

To disable auto-scheduling, comment out the `@Cron` decorator in that file.

## Troubleshooting

### No Markets Showing on Frontend

1. **Check if markets exist in database**:
   ```bash
   curl http://localhost:3001/api/markets
   ```

2. **If empty, trigger the pipeline**:
   ```bash
   curl -X POST http://localhost:3001/api/twitter-ai/run-pipeline
   ```

3. **Check browser console** for API errors

### klash-backend Not Running

Make sure you're running the NestJS service, not Python:
```bash
cd klash-backend
npm run start:dev  # NOT python src/main.py
```

### MongoDB Connection Error

Ensure MongoDB is running on port 27017. Check your `.env`:
```
MONGO_URI=mongodb://localhost:27017/klash
```

## Environment Variables

### Root `.env`
```
MONGO_URI=mongodb://localhost:27017/klash
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
PYTHON_SERVICE_URL=http://localhost:8000
```

### `klash-frontend/.env.local`
```
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

## What's Next

- ✅ Backend API endpoints
- ✅ Twitter AI integration
- ✅ Automated market creation
- ✅ Frontend data fetching
- ⏳ Wallet integration (Petra/Aptos)
- ⏳ Real-time updates (WebSockets)
- ⏳ Blockchain deployment
- ⏳ Bet placement functionality
