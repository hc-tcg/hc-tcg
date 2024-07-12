import type {GameModel} from '../../models/game-model'
import {Component} from '../../types/ecs'
import type {ComponentQuery} from './index'

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

/* Check if a component exists */
export function exists<T extends Component, U>(
	type: new (...args: Array<any>) => T,
	...predicates: Array<ComponentQuery<T>>
): ComponentQuery<U> {
	return (game, pos) => game.components.exists(type, ...predicates)
}

export function value<T>(getQuery: (value: T) => ComponentQuery<T>): ComponentQuery<T> {
	return (game, value) => getQuery(value)(game, value)
}
