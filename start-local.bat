@echo off
cd /d "%~dp0"
echo.
echo  乐理小达人 · 本地预览
echo  ----------------------
echo  启动后在浏览器打开: http://localhost:8080
echo  按 Ctrl+C 可停止服务
echo.
python -m http.server 8080
if errorlevel 1 (
  echo.
  echo [错误] 未找到 python。请安装 Python 3 或将 python 加入 PATH。
  echo 也可尝试: py -m http.server 8080
  pause
)
