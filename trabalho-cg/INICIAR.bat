@echo off
cd /d "%~dp0"
echo.
echo  Simulador Aspirador 3D
echo  Servidor: http://localhost:8080
echo  Feche esta janela para parar o servidor.
echo.
start http://localhost:8080
python -m http.server 8080
pause
