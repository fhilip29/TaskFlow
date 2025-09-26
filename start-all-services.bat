@echo off
echo Starting TaskFlow Services...
echo.

echo Creating uploads directory if it doesn't exist...
if not exist "services\users-services\uploads" (
    mkdir "services\users-services\uploads"
    echo Created uploads directory
)

echo.
echo Starting services in separate windows...

echo Starting Auth Service (Port 4000)...
start cmd /k "cd services\auth-services && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Users Service (Port 4001)...
start cmd /k "cd services\users-services && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Project Service (Port 4002)...  
start cmd /k "cd services\project-services && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend (Port 3000)...
start cmd /k "cd frontend && npm run dev"

echo.
echo All services are starting...
echo.
echo Health Check URLs:
echo Auth Service: http://localhost:4000/health
echo Users Service: http://localhost:4001/health  
echo Project Service: http://localhost:4002/health
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul