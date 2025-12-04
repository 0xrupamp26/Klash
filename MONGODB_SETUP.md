# MongoDB Setup Guide

## Problem
Backend can't connect to MongoDB (Error: ECONNREFUSED ::1:27017)

## Quick Fix Options

### Option 1: Docker (Recommended)
```powershell
# Make sure Docker Desktop is running, then:
docker-compose up -d mongo

# Verify it's running:
docker ps
```

### Option 2: Install MongoDB Locally
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service:
```powershell
net start MongoDB
```

### Option 3: Use MongoDB Atlas (Cloud - No Install)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Update `.env` file:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/klash
```

## After MongoDB is Running

Run the startup script:
```powershell
./START.ps1
```

Or manually:
```powershell
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend  
cd klash-frontend
npm run dev
```

## Verify Everything Works
1. Backend: http://localhost:3001/api/health
2. Frontend: http://localhost:5173
3. Check backend logs for "Nest application successfully started"
