@echo off
echo Checking Firebase setup...

echo.
echo Checking if Firebase CLI is installed...
firebase --version >nul 2>&1
if %errorlevel% == 0 (
    echo Firebase CLI: Installed
) else (
    echo Firebase CLI: Not found
    echo Please install it with: npm install -g firebase-tools
    exit /b
)

echo.
echo Checking Firebase login status...
firebase projects:list >nul 2>&1
if %errorlevel% == 0 (
    echo Firebase login: OK
) else (
    echo Firebase login: Not logged in
    echo Please run: firebase login
    exit /b
)

echo.
echo Checking firestore.rules file...
if exist firestore.rules (
    echo Firestore rules file: Found
    echo.
    echo Current rules content:
    type firestore.rules
) else (
    echo Firestore rules file: Not found
)

echo.
echo To deploy rules, run:
echo firebase deploy --only firestore:rules