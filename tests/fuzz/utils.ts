export function choose<T>(a: Array<T>, random: () => number) {
	return a[Math.floor(random() * a.length)]
}
