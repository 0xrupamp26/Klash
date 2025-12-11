# Klash MVP - Complete Startup Script
Write-Host "=== Starting Klash MVP ===" -ForegroundColor Cyan

# Set Backend Environment Variables
$env:PORT = "3001"
$env:NODE_ENV = "development"
$env:APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1"
$env:MARKET_MODULE_ADDRESS = "0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138"

# Set Frontend Environment Variables (for Vite)
$env:VITE_API_URL = "http://localhost:3001"
$env:VITE_APTOS_NETWORK = "testnet"
$env:VITE_APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1"
$env:VITE_MODULE_ADDRESS = "0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138"

Write-Host "Environment variables set" -ForegroundColor Green

# Start Backend
Write-Host "`nStarting Backend on Port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PWD'
`$env:PORT='3001'
`$env:NODE_ENV='development'
`$env:APTOS_NODE_URL='https://fullnode.testnet.aptoslabs.com/v1'
`$env:MARKET_MODULE_ADDRESS='0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138'
Write-Host 'Backend Environment Ready' -ForegroundColor Green
npm run start:dev
"@

Start-Sleep -Seconds 8

# Start Frontend
Write-Host "`nStarting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PWD\klash-frontend\_\apps\web'
`$env:VITE_API_URL='http://localhost:3001'
`$env:VITE_APTOS_NETWORK='testnet'
`$env:VITE_APTOS_NODE_URL='https://fullnode.testnet.aptoslabs.com/v1'
`$env:VITE_MODULE_ADDRESS='0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138'
Write-Host 'Frontend Environment Ready' -ForegroundColor Green
npm run dev
"@

Write-Host "`n=== Klash MVP Started ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "`nConnect Petra wallet to Aptos Testnet to start!" -ForegroundColor Yellow
