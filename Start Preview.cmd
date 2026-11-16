@echo off
cd /d "%~dp0"
node scripts/build.mjs
if errorlevel 1 goto failed
echo.
echo Open http://127.0.0.1:4173/ in your browser.
echo Keep this window open while reviewing. Press Ctrl+C to stop.
node scripts/serve.mjs
if errorlevel 1 goto failed
exit /b 0
:failed
echo.
echo If port 4173 is already in use, the preview may already be running.
pause
