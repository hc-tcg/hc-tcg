export class Hook<T extends (...args: any) => any> {
	listeners: Record<string, T> = {}

	/**
	 * Adds a new listener to this hook
	 */
	add(identifier: string, listener: T) {
		this.listeners[identifier] = listener
	}

	/**
	 * Removes the specified listener
	 */
	remove(identifier: string) {
		delete this.listeners[identifier]
	}

	/**
	 * Calls all the added listeners. Returns an array of the results
	 */
	call(...params: Parameters<T>) {
		const results: Array<ReturnType<T>> = []
		const hooks = Object.values(this.listeners)
		for (let i = 0; i < hooks.length; i++) {
			const result = hooks[i](...(params as Array<Parameters<T>>))
			if (result !== undefined) {
				results.push(result)
			}
		}

		return results
	}
}

export class GameHook<T extends (...args: any) => any> extends Hook<(...args: any) => any> {
	listeners: Record<string, T> = {}

	/**
	 * Adds a new listener to this hook
	 */
	add(instance: string, listener: T) {
		this.listeners[instance] = listener
	}

	/**
	 * Removes the specified listener
	 */
	remove(instance: string) {
		delete this.listeners[instance]
	}

	callSome(params: Parameters<T>, ignoreInstance: (instance: string) => boolean) {
		const results: Array<ReturnType<T>> = []
		const instances = Object.keys(this.listeners)
		const hooks = Object.values(this.listeners)
		for (let i = 0; i < instances.length; i++) {
			if (!ignoreInstance(instances[i])) {
				const result = hooks[i](...(params as Array<Parameters<T>>))
				if (result !== undefined) {
					results.push(result)
				}
			}
		}

		return results
	}
}

export class WaterfallHook<T extends (...args: any) => Parameters<T>[0]> {
	listeners: Record<string, T> = {}

	add(instance: string, listener: T) {
		this.listeners[instance] = listener
	}

	remove(instance: string) {
		delete this.listeners[instance]
	}

	call(...params: Parameters<T>): Parameters<T>[0] {
		let newParams = params
		const hooks = Object.values(this.listeners)
		for (let i = 0; i < hooks.length; i++) {
			newParams[0] = hooks[i](newParams)
		}

		return newParams[0]
	}
}
