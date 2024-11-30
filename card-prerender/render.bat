@echo off
:: Requires ImageMagick

:: Render cards
echo Running Playwright...
call npx playwright test -c playwright-render.config.ts -u

:: Move to client
echo Writing JSON files to `client/public/images/cards/`...
IF not exist .\client\public\images\cards\NUL mkdir .\client\public\images\cards
FOR /R .\card-prerender\render\ %%G IN (*.png) do (
    magick %%G .\client\public\images\cards\%%~nG.webp
    copy %%G .\client\public\images\cards\%%~nG.png
)

echo DONE!
