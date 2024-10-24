/** In place implementation of the Fisher-Yates shuffle */
export function fisherYatesShuffle<T>(array: Array<T>) {
	for (let i = array.length - 1; i >= 1; i--) {
		let j = Math.floor(Math.random() * (i + 1))
		let tmp = array[j]
		array[j] = array[i]
		array[i] = tmp
	}
	return array
}
