@echo off
:: Render cards
echo Running Playwright...
call npx playwright test -c playwright-render.config.ts -u

:: Move to client
echo Writing JSON files to `client/public/images/cards/`...
mkdir client/public/images/cards
FOR /R ./card-prerender/render/ %%G IN (*.png) do cwebp -short %%G -o client/public/images/cards/%%~nG.webp

echo DONE!
