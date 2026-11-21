@echo off
chcp 65001 >nul
reg add "HKCU\Console" /v QuickEdit /t REG_DWORD /d 0 /f >nul 2>&1
mode con: cols=125 lines=38
title GetHotelStays (GHS) - Google Maps Hotel Contact Enricher
cd /d "%~dp0"
python agent\google_maps_enricher.py --all
pause
