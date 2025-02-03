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

async function runTest(seed: string, progress: any) {
	let success = true
	try {
		await performFuzzTest(seed)
	} catch (_e) {
		success = false
	}

	progress.progress += 1
	if (success) {
		console.log(`${progress.progress} - ${seed}: SUCCESS`)
		return [seed, true]
	} else {
		console.error(`${seed}: FAILURE`)
		return [seed, false]
	}
}

async function manyTests(num: number) {
	let progress = {progress: 0}

	let seeds = Array(num)
		.fill(0)
		.map((_) => Math.random())

	let results = await Promise.all(
		seeds.map((x) => runTest(x.toString().slice(2, 18), progress)),
	)

	let failures = results.filter(([_seed, result]) => !result)
	if (failures.length === 0) {
		console.log('All tests passed!')
	} else {
		console.log('Found some failed tests...')
		failures.forEach(([seed, _result]) => console.error(`${seed}: FAILURE`))
	}
}

async function main() {
	let argv = process.argv
	argv = argv.slice(argv.indexOf('--') - 1)

	if (argv[0] === 'fuzz') {
		console.log(`Fuzzing ${argv[1]} times`)
		await manyTests(parseInt(argv[1]))
		return
	}

	if (argv[0] === 'check') {
		await performFuzzTest(argv[1])
		console.log('Completed!')
		return
	}

	console.log("Inpropper command, please refer to docs in  'tests/README.md'")
}

await main()
