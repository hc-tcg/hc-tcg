import {GameModel} from '../models/game-model'
import {
	CardComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../types/components'
import {CardEntity, PlayerEntity, RowEntity, SlotEntity} from '../types/game-state'

import * as query from './query'
import * as slot from './slot'
import * as row from './row'
import * as effect from './effect'
import * as card from './card'

export {slot, row, effect, card, query}

export type Predicate<Value> = (game: GameModel, value: Value) => boolean
