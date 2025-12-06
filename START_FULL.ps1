# Klash Full Version Runner (MongoDB)
# Starts the MongoDB-backed backend and frontend

Write-Host "🚀 Starting Klash Full Version (MongoDB)..." -ForegroundColor Cyan

# Function to check if a process is running
function Is-ProcessRunning {
    param($Name)
    return (Get-Process -Name $Name -ErrorAction SilentlyContinue)
}

# Step 1: Check/Start MongoDB
Write-Host "`n🔍 Checking MongoDB..." -ForegroundColor Yellow

if (Is-ProcessRunning "mongod") {
    Write-Host "   ✅ MongoDB is already running." -ForegroundColor Green
}
else {
    Write-Host "   ⚠️ MongoDB is NOT running." -ForegroundColor Yellow
    Write-Host "   🔄 Attempting to start MongoDB..." -ForegroundColor Gray

    # Try to find mongod.exe
    $mongodPath = Get-Command "mongod" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
    
    if (-not $mongodPath) {
        $commonPaths = @(
            "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe"
        )
        
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $mongodPath = $path
                break
            }
        }
    }

    if ($mongodPath) {
        Write-Host "   ✅ Found MongoDB at: $mongodPath" -ForegroundColor Green
        
        # Create data directory if it doesn't exist
        if (-not (Test-Path "C:\data\db")) {
            New-Item -ItemType Directory -Force -Path "C:\data\db" | Out-Null
        }

        # Start MongoDB
        Start-Process -FilePath $mongodPath -ArgumentList "--dbpath C:\data\db" -WindowStyle Minimized
        Write-Host "   🚀 MongoDB started!" -ForegroundColor Green
        Start-Sleep -Seconds 5
    }
    else {
        Write-Host "   ❌ Could not find mongod.exe automatically." -ForegroundColor Red
        Write-Host "   👉 Please start MongoDB manually before continuing." -ForegroundColor White
        Read-Host "   Press Enter once MongoDB is running..."
    }
}

# Step 2: Start Backend
Write-Host "`n📦 Starting Backend (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"

# Wait for backend to initialize
Write-Host "⏳ Waiting 10 seconds for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 3: Start Frontend
Write-Host "`n🎨 Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\klash-frontend'; npm run dev"

Write-Host "`n✅ Full Version Started!" -ForegroundColor Green
Write-Host "------------------------------------------------" -ForegroundColor White
Write-Host "👉 Open Browser: http://localhost:5173" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor White
