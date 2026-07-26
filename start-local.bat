@echo off
cd /d "%~dp0"
echo.
echo  乐理小达人 · 本地预览
echo  ----------------------
echo  启动后在浏览器打开: http://localhost:8080/?dev=1
echo  按 Ctrl+C 可停止服务
echo.
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 -m http.server 8080
  goto :eof
)
where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server 8080
  goto :eof
)
echo.
echo [错误] 未找到 py / python。请安装 Python 3，或双击后把下面整句贴进「命令提示符」：
echo   cd /d "%~dp0" ^&^& py -3 -m http.server 8080
echo.
pause
