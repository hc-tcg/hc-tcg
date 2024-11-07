#!/bin/sh
#
# Script to render the hermit cards to pngs to use in production.
# Depends on imagemagick.
#

# First Render the cards
npx playwright test -c playwright-render.config.ts -u

# Make the json files!
find card-prerender/render/ -type f -print0 | xargs '-I{}' -n1 -0 sh -c 'magick {} client/public/images/cards/$(basename --suffix=.png {}).jpg'

