/** The entrypoint for fuzz testing */

import { createDeck } from "./create-deck"

function performFuzzTest() {
	let playerOneDeck = createDeck()
	let playerTwoDeck = createDeck()

	testGame()


}



performFuzzTest()

