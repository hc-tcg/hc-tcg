/** The entrypoint for fuzz testing */

import {newRandomNumberGenerator} from 'common/utils/random'
import {createDeck} from './create-deck'
import {testGame} from './run-game'

async function performFuzzTest(seed: string) {
	let randomNumberGenerator = newRandomNumberGenerator(seed)

	let playerOneDeck = createDeck(randomNumberGenerator)
	let playerTwoDeck = createDeck(randomNumberGenerator)

	let gameSeed = randomNumberGenerator().toString().slice(16)

	let gameResult = await testGame({
		playerOneDeck,
		playerTwoDeck,
		seed: gameSeed,
	})
	console.log(gameResult)
}

performFuzzTest(Math.random().toString()).catch((e) => {
	console.log("There was an error")
	console.error(e)
})
