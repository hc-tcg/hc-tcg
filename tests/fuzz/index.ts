/** The entrypoint for fuzz testing */

import {newRandomNumberGenerator} from 'common/utils/random'
import {createDeck} from './create-deck'
import {testGame} from './run-game'
import {FuzzAI} from './fuzz-ai'

async function performFuzzTest(seed: string, debug: boolean) {
	let randomNumberGenerator = newRandomNumberGenerator(seed)

	let playerOne = {deck: createDeck(randomNumberGenerator), AI: FuzzAI}
	let playerTwo = {deck: createDeck(randomNumberGenerator), AI: FuzzAI}

	let gameSeed = randomNumberGenerator().toString().slice(16)

	await testGame({
		playerOne,
		playerTwo,
		seed: gameSeed,
		debug: debug,
	})
}

async function runTest(seed: string, debug: boolean, progress: any) {
	let success = true
	try {
		await performFuzzTest(seed, debug)
	} catch (_e) {
		success = false
	}

	progress.progress += 1
	if (success) {
		console.log(`${progress.progress} - ${seed}: SUCCESS`)
		return [seed, true]
	} else {
		console.error(`${progress.progress} - ${seed}: FAILURE`)
		return [seed, false]
	}
}

async function manyTests(num: number, debug: boolean) {
	let progress = {progress: 0}

	let seeds = Array(num)
		.fill(0)
		.map((_) => Math.random())

	let results = await Promise.all(
		seeds.map((x) => runTest(x.toString().slice(2, 18), debug, progress)),
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
	argv = argv.slice(2)
	const debug = argv.includes('--debug')
	console.log(argv)

	if (argv[0] === 'fuzz') {
		console.log(`Fuzzing ${argv[1]} times`)
		await manyTests(parseInt(argv[1]), debug)
		return
	}

	if (argv[0] === 'check') {
		await performFuzzTest(argv[1], debug)
		console.log('Completed!')
		return
	}

	console.log("Inpropper command, please refer to docs in  'tests/README.md'")
}

await main()
