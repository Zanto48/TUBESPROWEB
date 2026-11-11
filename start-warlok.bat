@echo off
title WarLok Launcher (XAMPP + Laravel 11 + MySQL)
echo ==========================================================
echo   Menjalankan WarLok (XAMPP Apache + MySQL 3307 + Laravel)
echo ==========================================================

echo [1/3] Menyalakan MySQL XAMPP di Port 3307...
start "WarLok MySQL 3307" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --port=3307 --standalone

echo [2/3] Menyalakan Server Backend Laravel 11 (Port 8000)...
start "WarLok Laravel 11" /min "C:\xampp\php\php.exe" "%~dp0backend\artisan" serve --host=127.0.0.1 --port=8000

echo [3/3] Memastikan Apache XAMPP aktif...
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="1" (
    start "WarLok Apache" /min "C:\xampp\apache\bin\httpd.exe"
)

timeout /t 2 /nobreak >nul
echo.
echo WarLok siap diakses di browser:
echo   - Via XAMPP Apache : http://localhost/warlok/
echo   - Via API Laravel  : http://localhost/warlok/api/health
echo.
start http://localhost/warlok/
pause
