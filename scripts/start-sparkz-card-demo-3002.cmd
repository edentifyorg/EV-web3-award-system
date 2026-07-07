@echo off
cd /d "%~dp0..\packages\sparkz-charging-card"
npm.cmd run dev -- --host 127.0.0.1 --port 3002
