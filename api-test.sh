#!/bin/bash -e
#
# Tests for the HC-TCG API. Depends on `curl` and `jq`.
#

set -o pipefail

PORT=9000
kill -9 $(lsof -t -i:$PORT) || true

cleanup() {
  pkill -f "npm run server:dev"
}

test_api_cards() {
	WILD_ITEM=$(curl http://localhost:9000/api/cards 2> /dev/null | jq '.[] | select(.id == "item_any_common")')
	test -z "$(echo $WILD_ITEM | jq 'select(.tokens == 1)')"
}

test_card_images_exist() {
	TEST_HERMIT=$(curl http://localhost:9000/api/cards 2> /dev/null | jq '.[] | select(.id == "ethoslab_common")')
	IMAGE=$(echo $TEST_HERMIT | jq -r .image)
	BACKGROUND=$(echo $TEST_HERMIT | jq -r .background)

	curl -f $IMAGE &> /dev/null
	curl -f $BACKGROUND &> /dev/null
}

trap cleanup EXIT

npm run server:build
npm run server &

# Give the server some time to start
sleep 2

test_api_cards &
test_card_images_exist

