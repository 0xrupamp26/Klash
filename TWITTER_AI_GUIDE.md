# Twitter AI Integration Guide

## Overview

The Twitter AI integration automatically fetches tweets from @LafdaSinghAI, analyzes them for controversy, and creates prediction markets for controversial content.

## Architecture

### Components

1. **NestJS Backend (Port 3001)** - Main API server
   - `TwitterAiModule` - Bridges to Python AI service
   - `TwitterAiScheduler` - Runs every 30 minutes
   - `TwitterAiController` - Manual trigger endpoints

2. **Python AI Service (Port 8000)** - Located in `klash-backend/`
   - Twitter API integration
   - Controversy detection
   - Market creation logic
   - Aptos blockchain integration

### Data Flow

```
@LafdaSinghAI Tweets
    ↓
Python Service (Twitter API)
    ↓
Controversy Detection (AI)
    ↓
Market Creation (Auto)
    ↓
MongoDB + Aptos Blockchain
    ↓
Frontend Display
```

## Setup

### 1. Start Python AI Service

```bash
cd klash-backend
pip install -r requirements.txt
python src/main.py
```

The service will run on `http://localhost:8000`

### 2. Configure Environment Variables

Add to root `.env`:
```
PYTHON_SERVICE_URL=http://localhost:8000
```

### 3. Start NestJS Backend

```bash
npm install
npm run start:dev
```

## API Endpoints

### Manual Triggers

**POST** `/api/twitter-ai/run-pipeline`
- Manually trigger the full pipeline
- Fetches tweets, analyzes, creates markets
- Returns: `{ success, data: { tweetsFetched, controversiesFound, marketsCreated } }`

**GET** `/api/twitter-ai/fetch-tweets`
- Fetch latest 20 tweets from @LafdaSinghAI
- Returns: `{ success, data: Tweet[], count }`

**POST** `/api/twitter-ai/test-controversy`
- Test controversy detection on latest tweets
- Returns: `{ success, data: { totalTweets, controversiesFound, controversies } }`

**GET** `/api/twitter-ai/status`
- Get integration status
- Returns: `{ success, data: { service, status, schedule, pythonServiceUrl } }`

## Automated Scheduling

The `TwitterAiScheduler` runs automatically every 30 minutes:

1. Fetches 50 latest tweets from @LafdaSinghAI
2. Analyzes each tweet for controversy (confidence score)
3. Creates markets for tweets with confidence > 0.5
4. Logs results to console

To disable automatic scheduling, comment out the `@Cron` decorator in `twitter-ai.scheduler.ts`.

## Controversy Detection

The AI analyzes tweets based on:

- **Question indicators**: Contains "?"
- **Comparison patterns**: "vs", "versus", "better than"
- **Polarizing words**: "always", "never", "worst", "best"
- **Engagement threshold**: > 1000 total interactions

**Confidence Score Calculation**:
- Has question: +0.3
- Has comparison: +0.4
- Has polarizing words: +0.2
- Has controversy keywords: +0.3
- High engagement: +0.2

Minimum confidence for market creation: **0.5**

## Market Creation

When a controversial tweet is detected:

1. **Extract market details**:
   - Question/title from tweet text
   - Two opposing sides (or Yes/No)
   - Category (default: "culture")

2. **Create market**:
   - Unique market ID
   - Closing time: 7 days from creation
   - Initial pools: 0 APT
   - Status: OPEN

3. **Deploy to blockchain** (optional):
   - Creates Aptos smart contract
   - Logs transaction hash

## Testing

### Test the Full Pipeline

```bash
curl -X POST http://localhost:3001/api/twitter-ai/run-pipeline
```

Expected response:
```json
{
  "success": true,
  "data": {
    "tweetsFetched": 50,
    "controversiesFound": 5,
    "marketsCreated": 3,
    "errors": []
  },
  "message": "Created 3 markets from 50 tweets"
}
```

### Test Controversy Detection

```bash
curl -X POST http://localhost:3001/api/twitter-ai/test-controversy
```

### View Created Markets

```bash
curl http://localhost:3001/api/markets
```

## Troubleshooting

### Python Service Not Running

**Error**: `ECONNREFUSED localhost:8000`

**Solution**: 
```bash
cd klash-backend
python src/main.py
```

### No Tweets Fetched

**Error**: `No tweets fetched`

**Possible causes**:
- Twitter API credentials missing in `klash-backend/.env`
- Rate limit exceeded
- @LafdaSinghAI has no recent tweets

**Solution**: Check `klash-backend/.env` for `TWITTER_API_KEY`

### No Controversies Found

**Error**: `No controversial tweets found`

**Possible causes**:
- Tweets don't meet confidence threshold (< 0.5)
- Low engagement on tweets

**Solution**: Lower the confidence threshold in `klash-backend/src/controversy/controversy.service.ts`

### Markets Not Created

**Error**: `Market already exists`

**Cause**: Duplicate prevention - each tweet can only create one market

**Solution**: This is expected behavior. Check existing markets in MongoDB.

## Monitoring

View scheduler logs in the console:

```
[TwitterAiScheduler] Starting scheduled market creation pipeline
[TwitterAiService] Fetching 50 tweets from @LafdaSinghAI
[TwitterAiService] Fetched 50 tweets
[TwitterAiService] Analyzing 50 tweets for controversy
[TwitterAiService] Found 5 controversial tweets
[TwitterAiService] Creating markets from 5 tweets
[TwitterAiService] Successfully created 3 markets
[TwitterAiScheduler] Pipeline completed: 50 tweets, 5 controversies, 3 markets created
```

## Next Steps

1. **Test the integration**: Run the manual pipeline trigger
2. **Monitor the scheduler**: Check logs every 30 minutes
3. **Verify markets**: Check MongoDB and frontend for new markets
4. **Adjust parameters**: Tune controversy detection thresholds
5. **Add more sources**: Extend to fetch from multiple Twitter accounts
