# Quick Testing Guide (Without Docker)

## Prerequisites Check

Before testing, ensure you have:
- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Twitter API credentials in `klash-backend/.env`

## Step 1: Start Python AI Service

```bash
cd klash-backend
pip install -r requirements.txt
python src/main.py
```

Expected output: `Server running on http://localhost:8000`

## Step 2: Start NestJS Backend (Separate Terminal)

```bash
# In root directory
npm install
npm run start:dev
```

Expected output: `Server running on port 3001`

**Note**: Backend will show MongoDB connection errors - this is OK for testing the Twitter AI integration.

## Step 3: Test Twitter AI Pipeline

```bash
# In a third terminal
curl -X POST http://localhost:3001/api/twitter-ai/run-pipeline
```

Expected response:
```json
{
  "success": true,
  "data": {
    "tweetsFetched": 50,
    "controversiesFound": 5,
    "marketsCreated": 3
  }
}
```

## Step 4: Test Individual Components

### Fetch Tweets Only:
```bash
curl http://localhost:3001/api/twitter-ai/fetch-tweets
```

### Test Controversy Detection:
```bash
curl -X POST http://localhost:3001/api/twitter-ai/test-controversy
```

### Check Status:
```bash
curl http://localhost:3001/api/twitter-ai/status
```

## Troubleshooting

### Python Service Won't Start
- Check if port 8000 is already in use
- Verify Twitter API credentials in `klash-backend/.env`

### NestJS Backend Won't Start
- Check if port 3001 is already in use
- Ignore MongoDB connection errors for now

### No Tweets Fetched
- Verify `TWITTER_API_KEY` in `klash-backend/.env`
- Check if @LafdaSinghAI has recent tweets

## Next Steps

Once Docker is running:
1. Start MongoDB and Redis: `docker-compose up -d`
2. Restart NestJS backend
3. Markets will be saved to database
4. Test full flow with frontend
