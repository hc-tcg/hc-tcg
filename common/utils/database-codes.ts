/**Generates a code consisting of 7 hexidecimal digits.*/
export function generateDatabaseCode(): string {
	const number = Math.floor(Math.random() * 0x10000000)
	return number.toString(16).padStart(7, '0')
}

export function NumberOrNull(a: any | null) {
	if (a !== null && a !== undefined) return Number(a)
	return null
}
