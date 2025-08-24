@echo off
echo 🚀 Store Rating Web App - Quick Start
echo ======================================
echo.

echo 📦 Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 📦 Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 🗄️  Setting up database...
call node setup.js
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed! Starting the application...
echo.
echo 📱 Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo 🌐 Starting frontend development server...
start "Frontend Server" cmd /k "npm run client"

echo.
echo ✅ Application started successfully!
echo.
echo 🌐 Access your application at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 🔑 Default admin login:
echo    Email: admin@storeapp.com
echo    Password: admin123!
echo.
pause
