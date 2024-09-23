#!/bin/bash -e
#
# Tests for the HC-TCG API. Depends on `curl` and `jq`.
#

set -o pipefail

PORT=55576
HOST="http://localhost:$PORT"

cleanup() {
  echo "Closing server on port $PORT."
  kill -9 $(lsof -t -i:$PORT)
}

trap cleanup EXIT

test_card_images_exist() {
	test_hermit=$(curl $HOST/api/cards | jq '.[] | select(.id == "ethoslab_common")')
	image=$(echo $test_hermit | jq -r .image)
	background=$(echo $test_hermit | jq -r .background)
	hermit_image_output=$(mktemp)
	hermit_background_output=$(mktemp)
	echo $image
	curl -f $image -o $hermit_image_output
	echo $background
	curl -f $background -o $hermit_background_output
	test -s $hermit_image_output
	test -s $hermit_background_output

	test_item=$(curl $HOST/api/cards | jq '.[] | select(.id == "item_builder_common")')
	image=$(echo $test_item | jq -r .image)
	item_image_output=$(mktemp)
	curl -f $image -o $item_image_output
	test -s "$item_image_output"

	test_effect=$(curl $HOST/api/cards | jq '.[] | select(.id == "bed")')
	image=$(echo $test_effect | jq -r .image)
	effect_image_output=$(mktemp)
	curl -f $image -o $effect_image_output
	test -s "$effect_image_output"
}

test_card_token_costs() {
  ids='["helsknight_rare", "welsknight_rare"]'
	hermits=$(curl $HOST/api/cards)

	helsknight_rare_cost=$(echo $hermits | jq '.[] | select(.id == "helsknight_rare").tokens')
	welsknight_rare_cost=$(echo $hermits | jq '.[] | select(.id == "welsknight_rare").tokens')

	api_cost=$(curl $HOST/api/deck/cost -d "$ids" -H Content-Type:application/json | jq '.cost')

	test $api_cost -eq "$(($helsknight_rare_cost + $welsknight_rare_cost))"
}

npm run build
output_file=$(mktemp)
PORT=$PORT npm run server &> $output_file &
while [[ -z $(cat $output_file | grep "Server listening on port") ]]; do
	# Wait for the server to start
	sleep .1
done

echo 'Server started! Running tests.'

echo 'Running `test_card_images_exist`'
test_card_images_exist
echo 'Running `test_card_token_costs`'
test_card_token_costs
