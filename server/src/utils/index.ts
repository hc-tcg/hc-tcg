/** Call a function and log errors if they are found. This function is used to prevent errors from reaching
 * the root of the tree.
 */
export function* safeCall(fun: any, ...args: any[]): any {
	try {
		return yield* fun(...args)
	} catch (e) {
		console.error(e)
	}
}
