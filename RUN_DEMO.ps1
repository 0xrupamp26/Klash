# Klash Demo Runner
# Starts the in-memory backend and frontend for the demo

Write-Host "🚀 Starting Klash Demo (In-Memory Mode)..." -ForegroundColor Cyan

# Step 1: Start Backend
Write-Host "`n📦 Starting Backend (Port 3001)..." -ForegroundColor Yellow
Write-Host "   - No Database required" -ForegroundColor Gray
Write-Host "   - Data is stored in memory (resets on restart)" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"

# Wait for backend to initialize
Write-Host "⏳ Waiting 10 seconds for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 2: Start Frontend
Write-Host "`n🎨 Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\klash-frontend'; npm run dev"

Write-Host "`n✅ Demo Started Successfully!" -ForegroundColor Green
Write-Host "------------------------------------------------" -ForegroundColor White
Write-Host "👉 Open Browser: http://localhost:5173" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor White
Write-Host "`nFeatures to Test:" -ForegroundColor Yellow
Write-Host "1. View the 'Controversial Tweet' market" -ForegroundColor White
Write-Host "2. Connect Wallet (Auto-funds with 1 APT)" -ForegroundColor White
Write-Host "3. Place a Bet (Select '2 Players')" -ForegroundColor White
Write-Host "4. Open a second browser window (Incognito)" -ForegroundColor White
Write-Host "5. Connect a second wallet and place an opposite bet" -ForegroundColor White
Write-Host "6. Watch the market activate and resolve automatically!" -ForegroundColor White
