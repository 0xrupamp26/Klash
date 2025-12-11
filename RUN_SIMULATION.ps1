# Klash Simulation Runner (No MongoDB)
# Starts the In-Memory Backend and Frontend

Write-Host "Starting Klash Simulation (No Database Mode)..." -ForegroundColor Cyan

# Step 1: Start Backend
Write-Host "Starting Backend (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"

# Wait for backend to initialize
Write-Host "Waiting 10 seconds for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 2: Start Frontend
Write-Host "Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\klash-frontend\_\apps\web'; npm run dev"

Write-Host "Simulation Started!" -ForegroundColor Green
Write-Host "------------------------------------------------" -ForegroundColor White
Write-Host "Open Browser: http://localhost:5173" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor White
