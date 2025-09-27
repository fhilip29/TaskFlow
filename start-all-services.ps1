# TaskFlow Services Startup Script
Write-Host "Starting TaskFlow Services..." -ForegroundColor Green
Write-Host ""

# Create uploads directory if it doesn't exist
$uploadsPath = "services\users-services\uploads"
if (!(Test-Path -Path $uploadsPath)) {
    New-Item -ItemType Directory -Path $uploadsPath -Force | Out-Null
    Write-Host "Created uploads directory" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green

# Function to start service in new terminal
function Start-ServiceInNewTerminal($serviceName, $path, $port) {
    Write-Host "Starting $serviceName (Port $port)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$path'; npm run dev"
    Start-Sleep 2
}

# Start all services
Start-ServiceInNewTerminal "Auth Service" "services\auth-services" "4000"
Start-ServiceInNewTerminal "Users Service" "services\users-services" "4001"
Start-ServiceInNewTerminal "Project Service" "services\project-services" "4002"
Start-ServiceInNewTerminal "Task Service" "services\task-services" "3003"
Start-ServiceInNewTerminal "Frontend" "frontend" "3000"

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Health Check URLs:" -ForegroundColor Yellow
Write-Host "Auth Service: http://localhost:4000/health"
Write-Host "Users Service: http://localhost:4001/health"
Write-Host "Project Service: http://localhost:4002/health"
Write-Host "Task Service: http://localhost:3003/health"
Write-Host "Frontend: http://localhost:3000"
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")