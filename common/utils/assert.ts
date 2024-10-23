export function assert(value: any, reason?: string): asserts value {
	if (!value) {
		if (reason) {
			throw new Error('Assertion Failed: ' + reason)
		} else {
			throw new Error('Assertion Failed')
		}
	}
}
