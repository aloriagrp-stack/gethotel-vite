@echo off
cd /d "%~dp0blogs.gethotelstays.com"
echo Starting GetHotel Stays Blog local server on http://localhost:8081 ...
npx -y http-server -p 8081
