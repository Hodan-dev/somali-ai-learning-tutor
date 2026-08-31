@echo off
setlocal
cd /d "%~dp0.."
if not exist "server\content\pdfs" mkdir "server\content\pdfs"

echo Copying Manhajka PDFs into server\content\pdfs ...

copy /Y "E:\Buugaagta manhajka\F2\f2_physics.compressed.pdf" "server\content\pdfs\" 2>nul
copy /Y "E:\Buugaagta manhajka\F3\math3.compressed.pdf" "server\content\pdfs\" 2>nul
copy /Y "E:\Buugaagta manhajka\F3\pysics_f3.compressed.pdf" "server\content\pdfs\" 2>nul
copy /Y "E:\Buugaagta manhajka\F4\English_form_four_book.pdf" "server\content\pdfs\" 2>nul
copy /Y "E:\Buugaagta manhajka\F4\f4-Chemistry.compressed.pdf" "server\content\pdfs\" 2>nul

echo.
echo Running curriculum import...
call npm run import:curriculum
pause
