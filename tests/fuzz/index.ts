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
		return [seed, true]
	} else {
		console.error(`${seed}: FAILURE`)
		return [seed, false]
	}
}

async function manyTests(num: number) {
	let seeds = Array(num)
		.fill(0)
		.map((_) => Math.random())

	let results = await Promise.all(
		seeds.map((x) => runTest(x.toString().slice(2, 18))),
	)

	let failures = results.filter(([_seed, result]) => !result)
	if (failures.length === 0) {
		console.log('All tests passed!')
	} else {
		failures.forEach(([seed, _result]) => console.error(`${seed}: FAILURE`))
	}
}

await manyTests(1000)

// 2988809406925183
// 2693242631813806

// await performFuzzTest('8899226946887226')

console.log('tests complete!')
