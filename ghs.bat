@echo off
chcp 65001 >nul
mode con: cols=125 lines=38
title GetHotelStays (GHS) - Terminal AI Agent & Control Center
cd /d "%~dp0"
python agent\ghs_agent.py %*
pause
