import {GameModel} from '../models/game-model'
import {
	CardComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../types/components'
import {CardEntity, PlayerEntity, RowEntity, SlotEntity} from '../types/game-state'

import * as slot from './slot'
import * as row from './row'
import * as effect from './effect'
import * as card from './card'

export {slot, row, effect, card}

export type Predicate<Value> = (game: GameModel, value: Value) => boolean

export namespace filters {
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
}
