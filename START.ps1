# Quick Start Script - Run this to start everything

Write-Host "Starting Klash Platform..." -ForegroundColor Cyan

# Step 1: Check if MongoDB is running
Write-Host "`nStep 1: Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = netstat -ano | findstr :27017
if (-not $mongoRunning) {
    Write-Host "MongoDB is NOT running!" -ForegroundColor Red
    Write-Host "`nOptions to start MongoDB:" -ForegroundColor Yellow
    Write-Host "1. If you have Docker Desktop: docker-compose up -d mongo" -ForegroundColor White
    Write-Host "2. If you have MongoDB installed: net start MongoDB" -ForegroundColor White
    Write-Host "3. Use MongoDB Atlas (cloud): I can set this up for you" -ForegroundColor White
    Write-Host "`nPlease start MongoDB and run this script again." -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "MongoDB is running!" -ForegroundColor Green
}

# Step 2: Start Backend
Write-Host "`nStep 2: Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"
Write-Host "Backend starting in new window..." -ForegroundColor Green

# Wait for backend
Write-Host "`nWaiting 15 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 3: Check backend health
Write-Host "`nStep 3: Checking backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -ErrorAction Stop
    Write-Host "Backend is running!" -ForegroundColor Green
}
catch {
    Write-Host "Backend is not responding yet. Check the backend window for errors." -ForegroundColor Red
    Write-Host "Common issue: MongoDB connection failed" -ForegroundColor Yellow
}

# Step 4: Start Frontend
Write-Host "`nStep 4: Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\klash-frontend'; npm run dev"
Write-Host "Frontend starting in new window..." -ForegroundColor Green

Write-Host "`n=== Platform Started ===" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in each window to stop services" -ForegroundColor Yellow
