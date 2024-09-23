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

test_card_images_exist() {
	test_hermit=$(curl http://localhost:9000/api/cards | jq '.[] | select(.id == "ethoslab_common")')
	image=$(echo $test_hermit | jq -r .image)
	background=$(echo $test_hermit | jq -r .background)
	hermit_image_output=$(mktemp)
	hermit_background_output=$(mktemp)
	curl -f $image -o $hermit_image_output
	curl -f $background -o $hermit_background_output
	test -s $hermit_image_output
	test -s $hermit_background_output

	test_item=$(curl http://localhost:9000/api/cards | jq '.[] | select(.id == "item_builder_common")')
	image=$(echo $test_item | jq -r .image)
	item_image_output=$(mktemp)
	curl -f $image -o $item_image_output
	test -s "$item_image_output"

	test_effect=$(curl http://localhost:9000/api/cards | jq '.[] | select(.id == "bed")')
	image=$(echo $test_effect | jq -r .image)
	effect_image_output=$(mktemp)
	curl -f $image -o $effect_image_output
	test -s "$effect_image_output"
}

trap cleanup EXIT

npm run server:dev &

# Give the server some time to start
sleep 2

echo "Running `test_card_images_exist`"
test_card_images_exist

cleanup

