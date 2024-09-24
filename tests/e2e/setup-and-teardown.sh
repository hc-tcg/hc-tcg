#!/bin/bash
#
# Run the playwright tests with the server running in the background.
#

npm run server &
sleep 1
npm run playwright
kill -9 $(lsof -t -i:9000)

