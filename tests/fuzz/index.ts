/** The entrypoint for fuzz testing */

import {newRandomNumberGenerator} from 'common/utils/random'
import {createDeck} from './create-deck'
import {testGame} from './run-game'

async function performFuzzTest(seed: string) {
	let randomNumberGenerator = newRandomNumberGenerator(seed)

	let playerOneDeck = createDeck(randomNumberGenerator)
	let playerTwoDeck = createDeck(randomNumberGenerator)

	let gameSeed = randomNumberGenerator().toString().slice(16)

	await testGame({
		playerOneDeck,
		playerTwoDeck,
		seed: gameSeed,
	})
}

async function runTest(seed: string) {
	let success = true
	try {
		await performFuzzTest(seed)
	} catch (_e) {
		success = false
	}

	if (success) {
		console.log(`${seed}: SUCCESS`)
	} else {
		console.log(`${seed}: FAILURE`)
	}
}

async function manyTests(num: number) {
	let seeds = Array(num)
		.fill(0)
		.map((_) => Math.random())

	await Promise.all(seeds.map((x) => runTest(x.toString().slice(2, 18))))
}

await manyTests(100)
// await performFuzzTest('1901657291281036')

console.log('tests complete!')
