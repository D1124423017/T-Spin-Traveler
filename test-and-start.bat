@echo off
cd /d "%~dp0"

echo Running npm run check...
npm.cmd run check
if errorlevel 1 goto fail

echo Running npm run test...
npm.cmd run test
if errorlevel 1 goto fail

echo Running git diff --check...
git diff --check
if errorlevel 1 goto fail

echo All checks passed. Starting game...
npx.cmd vite --host 127.0.0.1
goto end

:fail
echo.
echo A check failed. Game server was not started.
pause

:end
