import {GameModel} from '../models/game-model'

export type CardRarityT = 'common' | 'rare' | 'ultra_rare'
export type TokenCostT = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 'wild'

export type RankT = 'stone' | 'iron' | 'gold' | 'emerald' | 'diamond'

export type TypeT =
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
	| 'any'

export type CardCategoryT = 'item' | 'single_use' | 'attach' | 'hermit'
export type BoardSlotTypeT = 'item' | 'attach' | 'hermit'
export type SlotTypeT =
	| BoardSlotTypeT
	| 'single_use'
	| 'hand'
	| 'deck'
	| 'discardPile'

export type DamageT = {
	target?: number
	afkTarget?: number
	self?: number
}

export type HermitAttackInfo = {
	name: string
	shortName?: string
	cost: Array<TypeT>
	damage: number
	power: string | null
	formattedPower?: Array<Node>
	passive?: boolean
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
		/**The name of the Hermit Card on the row this card was placed.*/
		hermitCard: string
		/**The slot type this card was placed on.*/
		slotType: string
	}
	/**Information about the pick for the card.*/
	pick: {
		/**The picked row index.*/
		rowIndex: string
		/**Name of the card in the slot that was picked.*/
		name: string
		/**The id of the picked card */
		id: string
		/**The name of the Hermit Card on the row that was picked.*/
		hermitCard: string
		/**The slot type that was picked.*/
		slotType: string
	}
	previousLog?: string
	/* The game this log is on*/
	game: GameModel
}
