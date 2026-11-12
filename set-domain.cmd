@echo off
rem Wrapper for set-domain.ps1 (bypasses the execution policy).
rem Usage: set-domain.cmd -BaseUrl "https://your-domain.com"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0set-domain.ps1" %*
