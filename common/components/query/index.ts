import type {GameModel} from '../../models/game-model'

import * as query from './query'
import * as slot from './slot'
import * as row from './row'
import * as effect from './effect'
import * as card from './card'

export {slot, row, effect, card, query}

export type ComponentQuery<Value> = (game: GameModel, value: Value) => boolean
