@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
cd /d "%~dp0android"
call gradlew.bat assembleRelease
