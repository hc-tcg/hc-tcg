export function assert(value: any, msg?: string): asserts value {
	if (!value) {
		throw new Error('Assertion failed:' + msg)
	}
}
