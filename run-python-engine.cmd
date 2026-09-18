@echo off
title GetHotel In-House Python AI Engine
cd /d "%~dp0ghs-python-engine"
echo ====================================================
echo Starting GetHotel In-House Python AI Engine (:8000)...
echo Zero External AI API Dependency - 100%% Local Microservice
echo ====================================================
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
