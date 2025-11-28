$ErrorActionPreference = "Stop"

Write-Host "Testing Klash AI Agent..." -ForegroundColor Cyan

# Check if Backend is running
$backendUrl = "http://localhost:3001/api/health"
try {
    $response = Invoke-RestMethod -Uri $backendUrl -Method Get -ErrorAction SilentlyContinue
    Write-Host "✅ Backend is running." -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running on port 3001." -ForegroundColor Red
    Write-Host "Please start the backend first: npm run start:dev" -ForegroundColor Yellow
    exit 1
}

# Trigger AI Pipeline
Write-Host "Triggering AI Market Creation Pipeline..." -ForegroundColor Cyan
$triggerUrl = "http://localhost:3001/api/twitter-ai/run-pipeline"

try {
    $result = Invoke-RestMethod -Uri $triggerUrl -Method Post
    
    if ($result.success) {
        Write-Host "✅ Pipeline executed successfully!" -ForegroundColor Green
        Write-Host "Tweets Fetched: $($result.data.tweetsFetched)"
        Write-Host "Controversies Found: $($result.data.controversiesFound)"
        Write-Host "Markets Created: $($result.data.marketsCreated)"
    } else {
        Write-Host "⚠️ Pipeline executed but returned failure." -ForegroundColor Yellow
        Write-Host $result
    }
} catch {
    Write-Host "❌ Failed to trigger pipeline." -ForegroundColor Red
    Write-Host $_.Exception.Message
}
