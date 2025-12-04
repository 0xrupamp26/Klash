# Quick Start Guide

## Problem: Manual Market Creation Not Working

**Root Cause:** Backend server is not running OR MongoDB is not connected.

## Solution Steps

### 1. Start MongoDB
```bash
# Option A: Using Docker (Recommended)
docker-compose up -d mongo

# Option B: Local MongoDB
# Make sure MongoDB service is running on port 27017
```

### 2. Start Backend
```bash
npm run start:dev
```

Wait for the message: `Nest application successfully started`

### 3. Verify Backend is Running
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
```

Should return: `{"status":"ok"}`

### 4. Test Market Creation
```powershell
$body = @{
    question = "Will Bitcoin reach $100k in 2025?"
    outcomes = @("Yes", "No")
    status = "OPEN"
    closingTime = "2025-12-31T23:59:59Z"
    pools = @{
        total = 0
        outcomeA = 0
        outcomeB = 0
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/markets" -Method Post -Body $body -ContentType "application/json"
```

### 5. Verify Market Was Created
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/markets" -Method Get
```

## Common Issues

1. **"Unable to connect to remote server"** → Backend not running
2. **Backend crashes on startup** → MongoDB not running
3. **Empty markets list** → Check MongoDB connection

## Environment Variables
Create a `.env` file in the root directory:
```
MONGO_URI=mongodb://localhost:27017/klash
PORT=3001
```
