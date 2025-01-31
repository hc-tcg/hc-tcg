/** The entrypoint for fuzz testing */

import { createDeck } from "./create-deck"

function performFuzzTest() {
	console.log(createDeck())


}



performFuzzTest()

