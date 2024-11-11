#!/bin/sh
#
# Script to render the hermit cards to pngs to use in production.
# Depends on imagemagick.
#

# First Render the cards
echo "Running Playwright..."
npx playwright test -c playwright-render.config.ts -u

echo 'Writing JSON files to `client/public/images/cards/`...'
mkdir client/public/images/cards || true
find card-prerender/render/ -type f -print0 | xargs '-I{}' -n1 -0 sh -c 'convert {} client/public/images/cards/$(basename --suffix=.png {}).webp'

echo "DONE!"

