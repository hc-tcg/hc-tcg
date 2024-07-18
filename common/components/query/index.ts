import type {GameModel} from '../../models/game-model'
import type {Component} from '../../types/ecs'
import type {TurnAction} from '../../types/game-state'

import * as slot from './slot'
import * as row from './row'
import * as effect from './effect'
import * as card from './card'
import * as player from './player'

export {slot, row, effect, card, player}

export type ComponentQuery<Value> = (game: GameModel, value: Value) => boolean

/** Always return true */
export function anything<T>(_game: GameModel, _value: T) {
	return true
}

/** Always return false */
export function nothing<T>(_game: GameModel, _value: T) {
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
	return (game, _value) => game.components.exists(type, ...predicates)
}

export function value<T>(getQuery: (value: T) => ComponentQuery<T>): ComponentQuery<T> {
	return (game, value) => getQuery(value)(game, value)
}

export function actionAvailable<T>(action: TurnAction): ComponentQuery<T> {
	return (game, _value) => game.state.turn.availableActions.includes(action)
}
