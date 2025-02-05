/** The entrypoint for fuzz testing */

import {newRandomNumberGenerator} from 'common/utils/random'
import {createDeck} from './create-deck'
import {FuzzAI} from './fuzz-ai'
import {testGame} from './run-game'

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

async function runTest(
	seed: string,
	debug: boolean,
	progress: any,
	json_output: boolean,
): Promise<[string, Error | null]> {
	let success = true
	let error: Error | null = null

	try {
		await performFuzzTest(seed, debug)
	} catch (e) {
		error = e as Error
	}

	progress.progress += 1
	if (success) {
		if (!json_output) {
			console.log(`${progress.progress} - ${seed}: SUCCESS`)
		}
		return [seed, error]
	} else {
		if (!json_output) {
			console.error(`${progress.progress} - ${seed}: FAILURE`)
		}
		return [seed, error]
	}
}

/** Run tests and return the failures */
async function manyTests(
	num: number,
	debug: boolean,
	fail_fast: boolean,
	json_output: boolean,
) {
	let progress = {progress: 0}

	let seeds = Array(num)
		.fill(0)
		.map((_) => Math.random())

	const tests = seeds.map((x) => x.toString().slice(2, 18))

	let results
	if (!fail_fast) {
		results = await Promise.all(
			tests.map((x) => runTest(x, debug, progress, json_output)),
		)
	} else {
		results = []
		for (const test of tests) {
			let test_result = await runTest(test, debug, progress, json_output)
			results.push(test_result)
			if (test_result[1] !== null) {
				break
			}
		}
	}

	if (json_output) {
		jsonPrintOutput(results)
		return
	}

	let failures = results.filter(([_seed, error]) => error !== null)
	if (failures.length === 0) {
		console.log('All tests passed!')
	} else {
		console.log('Found some failed tests...')
		failures.forEach(([seed, _error]) => {
			console.log(`${seed}: FAILURE`)
		})
	}
}

function jsonPrintOutput(tests: Array<[string, Error | null]>) {
	let output = []

	for (const [seed, error] of tests) {
		if (error !== null) {
			output.push({type: 'failure', seed, traceback: error.stack})
		} else {
			output.push({type: 'success', seed})
		}
	}

	console.debug(JSON.stringify(output))
}

async function main() {
	let argv = process.argv

	argv = argv.slice(2)
	const fail_fast = argv.includes('--fail-fast')
	const json_output = argv.includes('--json')

	if (argv[0] === 'fuzz') {
		if (!json_output) console.log(`Fuzzing ${argv[1]} times`)
		await manyTests(parseInt(argv[1]), false, fail_fast, json_output)
		return
	}

	if (argv[0] === 'debug') {
		await performFuzzTest(argv[1], true)
		if (!json_output) console.log('Completed!')
		return
	}

	console.log("Inpropper command, please refer to docs in  'tests/README.md'")
}

await main()
