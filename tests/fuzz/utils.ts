import assert from 'assert'

export function choose<T>(a: Array<T>, random: () => number) {
	assert(a.length > 0, 'Can not pick from empty array')
	return a[Math.floor(random() * a.length)]
}

export function chooseN<T>(
	canPick: Array<T>,
	amount: number,
	random: () => number,
): Array<T> {
	let picked = []
	for (let i = 0; i < amount; i++) {
		let index = Math.floor(random() * canPick.length)
		picked.push(canPick[index])
		canPick = [...canPick.slice(0, index), ...canPick.slice(index)]
	}
	return picked
}
