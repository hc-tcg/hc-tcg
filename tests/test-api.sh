#!/bin/bash -e
#
# Tests for the HC-TCG API. Depends on `curl` and `jq`.
#

set -o pipefail

cleanup() {
  echo "Closing server on port 9000."
  kill -9 $(lsof -t -i:9000)
}

trap cleanup EXIT

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

test_card_token_costs() {
  ids='["helsknight_rare", "welsknight_rare"]'
	hermits=$(curl http://localhost:9000/api/cards)

	helsknight_rare_cost=$(echo $hermits | jq '.[] | select(.id == "helsknight_rare").tokens')
	welsknight_rare_cost=$(echo $hermits | jq '.[] | select(.id == "welsknight_rare").tokens')

	api_cost=$(curl http://localhost:9000/api/deck/cost -d "$ids" -H Content-Type:application/json | jq '.cost')

	test $api_cost -eq "$(($helsknight_rare_cost + $welsknight_rare_cost))"
}

output_file=$(mktemp)
npm run server:dev &> $output_file &
while [[ -z $(cat $output_file | grep "Server listening on port") ]]; do
	# Wait for the server to start
	sleep .1
done

echo "Running `test_card_images_exist`"
test_card_images_exist
echo "Running `test_card_token_costs`"
test_card_token_costs
