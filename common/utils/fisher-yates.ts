/** In place implementation of the Fisher-Yates shuffle */
export function fisherYatesShuffle<T>(
	array: Array<T>,
	randomNumbers: Array<number>,
) {
	console.assert(
		array.length === randomNumbers.length,
		'Fisher yates sort needs the same amount of random numbers as array elements.',
	)

	for (let i = array.length - 1; i >= 1; i--) {
		console.assert(
			randomNumbers[i - 1] !== undefined,
			'Index should be in the array of numbers',
		)
		let j = Math.floor(randomNumbers[i] * (i + 1))
		let tmp = array[j]
		array[j] = array[i]
		array[i] = tmp
	}
	return array
}