import type {GameModel} from '../../models/game-model'
import type {Component} from '../../types/ecs'
import type {TurnAction} from '../../types/game-state'

import * as card from './card'
import * as effect from './effect'
import * as player from './player'
import * as row from './row'
import * as slot from './slot'

export type ComponentQuery<Value> = (game: GameModel, value: Value) => boolean

let query = {
	slot,
	row,
	effect,
	card,
	player,
	/** Always return true */
	anything: function anything<T>(_game: GameModel, _value: T) {
		return true
	},
	/** Always return false */
	nothing: function nothing<T>(_game: GameModel, _value: T) {
		return false
	},
	every: function every<T>(
		...options: Array<ComponentQuery<T>>
	): ComponentQuery<T> {
		return (game, value) => {
			return options.reduce(
				(place, combinator) => place && combinator(game, value),
				true,
			)
		}
	},
	some: function some<T>(
		...options: Array<ComponentQuery<T>>
	): ComponentQuery<T> {
		return (game, value) => {
			return options.reduce(
				(place, combinator) => place || combinator(game, value),
				false,
			)
		}
	},
	not: function not<T>(condition: ComponentQuery<T>): ComponentQuery<T> {
		return (game, pos) => {
			return !condition(game, pos)
		}
	},
	/* Check if a component exists */
	exists: function exists<T extends Component, U>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): ComponentQuery<U> {
		return (game, _value) => game.components.exists(type, ...predicates)
	},
	value: function value<T>(
		getQuery: (value: T) => ComponentQuery<T>,
	): ComponentQuery<T> {
		return (game, value) => getQuery(value)(game, value)
	},
	actionAvailable: function actionAvailable<T>(
		action: TurnAction,
	): ComponentQuery<T> {
		return (game, _value) => game.state.turn.availableActions.includes(action)
	},
}

export default query
