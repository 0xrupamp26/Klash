# Klash Platform Startup Script
# This script starts the backend and frontend

Write-Host "Starting Klash Platform..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
MONGO_URI=mongodb+srv://klash:klash123@cluster0.mongodb.net/klash?retryWrites=true&w=majority
PORT=3001
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Created .env with MongoDB Atlas connection" -ForegroundColor Green
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if backend is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -ErrorAction Stop
    Write-Host "Backend is running!" -ForegroundColor Green
}
catch {
    Write-Host "Backend failed to start. Check the backend window for errors." -ForegroundColor Red
    Write-Host "Common issue: MongoDB connection failed" -ForegroundColor Yellow
    exit 1
}

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\klash-frontend'; npm run dev"

Write-Host "Platform started successfully!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Tip: Use Ctrl+C in each window to stop the services" -ForegroundColor Yellow
