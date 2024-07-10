import {GameModel} from '../models/game-model'
import {
	CardId,
	CardInstance,
	PlayerId,
	RowId,
	SlotId,
} from './game-state'

export type CardRarityT = 'common' | 'rare' | 'ultra_rare'

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

export type EnergyT = TypeT | 'any'

export type CardCategoryT = 'item' | 'single_use' | 'attach' | 'hermit' | 'health'
export type BoardSlotTypeT = 'item' | 'attach' | 'hermit' | 'health'
export type SlotTypeT = BoardSlotTypeT | 'single_use' | 'hand'
export type ExpansionT = 'default' | 'alter_egos' | 'alter_egos_ii' | 'advent_of_tcg' | 'dream'

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

/* Object storing a row's information */
export class RowInfo {
	readonly game: GameModel

	index: number | null
	health: number

	hermitSlot: SlotId
	attachSlot: SlotId
	itemSlots: [SlotId, SlotId, SlotId]

	constructor(
		game: GameModel,
		rowIndex: number,
		hermitSlot: SlotId,
		attachSlot: SlotId,
		itemSlots: [SlotId, SlotId, SlotId]
	) {
		this.index = rowIndex
		this.game = game

		this.health = 0
		this.hermitSlot = hermitSlot
		this.attachSlot = attachSlot
		this.itemSlots = itemSlots
	}

	get hermit() {
		return this.game.state.slots.get(this.hermitSlot)
	}

	get attach() {
		return this.game.state.slots.get(this.attachSlot)
	}

	get items() {
		return this.itemSlots.map((id) => this.game.state.slots.get(id))
	}
}

export class SlotInfo {
	readonly game: GameModel

	readonly playerId: PlayerId
	readonly type: SlotTypeT
	readonly index: number | null
	readonly rowId: RowId
	cardId: CardId | null

	constructor(
		game: GameModel,
		playerId: PlayerId,
		type: SlotTypeT,
		index: number | null,
		rowId: RowId,
		cardId: CardId | null
	) {
		this.game = game
		this.playerId = playerId
		this.type = type
		this.index = index
		this.rowId = rowId
		this.cardId = cardId
	}

	get player() {
		return this.game.state.players[this.playerId]
	}

	get opponentPlayer() {
		return this.game.state.players[this.game.otherPlayer(this.playerId)]
	}

	get row() {
		return this.game.state.rows.get(this.rowId)
	}

	get card(): CardInstance | null {
		return this.game.state.cards.get(this.cardId)
	}

	set card(card: CardInstance | null) {
		this.cardId = card?.instance || null
	}
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
