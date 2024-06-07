import Card from '../cards/base/card'
import {PlayerState, RowState, RowStateWithHermit} from './game-state'
import {PickInfo} from './server-requests'

export type CardRarityT = 'common' | 'rare' | 'ultra_rare'

export type RankT = {
	name: string
	cost: number
}

export type HermitTypeT =
	| 'balanced'
	| 'builder'
	| 'speedrunner'
	| 'redstone'
	| 'farm'
	| 'pvp'
	| 'terraform'
	| 'prankster'
	| 'miner'
	| 'explorer'

export type EnergyT = HermitTypeT | 'any'

export type CardTypeT = 'item' | 'single_use' | 'effect' | 'hermit' | 'health'
export type BoardSlotTypeT = 'item' | 'effect' | 'hermit' | 'health'
export type SlotTypeT = BoardSlotTypeT | 'single_use'

export type DamageT = {
	target?: number
	afkTarget?: number
	self?: number
}

export type HermitAttackInfo = {
	name: string
	cost: Array<EnergyT>
	damage: number
	power: string | null
	formattedPower?: Array<Node>
}

export type Slot = {
	type: SlotTypeT
	index: number
}

export type BoardSlot = {
	type: BoardSlotTypeT
	index: number
}

export type RowPos = {
	player: PlayerState
	rowIndex: number
	row: RowStateWithHermit
}

export type SlotPos = {
	player: PlayerState
	rowIndex: number
	row: RowState
	slot: BoardSlot
}

export type PlayCardLog = {
	/**The default log for single use cards.*/
	defaultLog: string
	/**The name of the player this card was attached to.*/
	player: string
	/**The name of the player this card was not attached to.*/
	opponent: string
	/**Result of the coinflip tied to this card.*/
	coinFlip: string
	/**Information about where this card was placed.*/
	pos: {
		/**Row index this card was placed on.*/
		rowIndex: string
		/**The name of this card.*/
		name: string
		/**The id of this card */
		id: string
		/**The name of the Hermit Card on the row the card was placed.*/
		hermitCard: string
		/**The slot type the card was placed on.*/
		slotType: string
	}
	/**Information about the pick for the card.*/
	pick: {
		/**The picked row index.*/
		rowIndex: string
		/**Name of the card in the slot that was picked.*/
		name: string
		/**The id of this card */
		id: string
		/**The name of the Hermit Card on the row that was picked.*/
		hermitCard: string
		/**The slot type that was picked.*/
		slotType: string
	}
	previousLog?: string
}
