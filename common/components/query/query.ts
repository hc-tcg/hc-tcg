import type {GameModel} from '../../models/game-model.js'
import type {ComponentQuery} from './index.js'

/** Always return true */
export function anything<T>(game: GameModel, value: T) {
	return true
}

/** Always return false */
export function nothing<T>(game: GameModel, value: T) {
	return false
}

export function every<T>(...options: Array<ComponentQuery<T>>): ComponentQuery<T> {
	return (game, value) => {
		return options.reduce((place, combinator) => place && combinator(game, value), true)
	}
}

export function some<T>(...options: Array<ComponentQuery<T>>): ComponentQuery<T> {
	return (game, value) => {
		return options.reduce((place, combinator) => place || combinator(game, value), false)
	}
}

export function not<T>(condition: ComponentQuery<T>): ComponentQuery<T> {
	return (game, pos) => {
		return !condition(game, pos)
	}
}
