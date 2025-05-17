@echo off
echo === Déploiement de l'application React vers Django ===

echo 1. Construction de l'application React...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Erreur lors de la construction de React
    exit /b %ERRORLEVEL%
)

echo 2. Nettoyage des anciens fichiers statiques React...
if exist ..\backend\static\react (
    rd /s /q ..\backend\static\react
)
mkdir ..\backend\static\react

echo 3. Copie des fichiers statiques vers Django...
xcopy /s /y build\static\js ..\backend\static\react\
xcopy /s /y build\static\css ..\backend\static\react\
xcopy /s /y build\static\media ..\backend\static\react\ 2>nul

echo 4. Copie du favicon et autres fichiers statiques...
if exist build\favicon.ico (
    copy build\favicon.ico ..\backend\static\
)
if exist build\manifest.json (
    copy build\manifest.json ..\backend\static\
)

echo === Déploiement terminé ===
echo Pour lancer l'application en mode production :
echo 1. cd backend
echo 2. python manage.py runserver

cd ..
