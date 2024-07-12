import type {GameModel} from '../../models/game-model.js'
import type {Predicate} from './index.js'

/** Always return true */
export function anything<T>(game: GameModel, value: T) {
	return true
}

/** Always return false */
export function nothing<T>(game: GameModel, value: T) {
	return false
}

export function every<T>(...options: Array<Predicate<T>>): Predicate<T> {
	return (game, value) => {
		return options.reduce((place, combinator) => place && combinator(game, value), true)
	}
}

export function some<T>(...options: Array<Predicate<T>>): Predicate<T> {
	return (game, value) => {
		return options.reduce((place, combinator) => place || combinator(game, value), false)
	}
}

export function not<T>(condition: Predicate<T>): Predicate<T> {
	return (game, pos) => {
		return !condition(game, pos)
	}
}
