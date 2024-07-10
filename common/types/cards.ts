import {card} from '../filters'
import {GameModel} from '../models/game-model'
import {PlayerId, RowEntity, SlotEntity} from './game-state'

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
export type BoardSlotTypeT = 'item' | 'attach' | 'hermit'
export type SlotTypeT = BoardSlotTypeT | 'single_use' | 'hand' | 'pile' | 'discardPile'
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

export class RowComponent {
	readonly game: GameModel
	readonly entity: RowEntity
	playerId: PlayerId
	index: number
	health: number | null

	constructor(game: GameModel, entity: RowEntity, playerId: PlayerId, index: number) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.index = index
		this.health = null
	}

	public heal(amount: number) {
		let hermit = this.game.state.cards.find(card.hermit, card.row(this))
		if (this.health === null) return
		if (!hermit?.isHealth()) return
		this.health = Math.min(this.health + amount, hermit.props.health)
	}
}

export class SlotComponent {
	readonly game: GameModel
	readonly entity: SlotEntity
	readonly playerId: PlayerId | null
	readonly type: SlotTypeT

	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null, type: SlotTypeT) {
		this.entity = entity
		this.game = game
		this.playerId = playerId
		this.type = type
	}

	public onBoard(): this is BoardSlotInfo {
		return false
	}

	public inHand(): this is HandSlotInfo {
		return false
	}

	public inPile(): this is PileSlotInfo {
		return false
	}

	public inDiscardPile(): this is DiscardSlotInfo {
		return false
	}

	get player() {
		if (!this.playerId) return null
		return this.game.state.players[this.playerId]
	}

	get opponentPlayer() {
		if (!this.playerId) return null
		return this.game.state.players[this.game.otherPlayer(this.playerId)]
	}
}

export class BoardSlotInfo extends SlotComponent {
	readonly index: number | null
	readonly rowEntity: RowEntity | null

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerId: PlayerId | null,
		type: SlotTypeT,
		index: number | null,
		row: RowEntity | null
	) {
		super(game, entity, playerId, type)
		this.index = index
		this.rowEntity = row
	}

	override onBoard(): this is BoardSlotInfo {
		return true
	}

	get row() {
		if (!this.rowEntity) return null
		return this.game.state.rows.get(this.rowEntity)
	}
}

export class HandSlotInfo extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null) {
		super(game, entity, playerId, 'hand')
	}

	override inHand(): this is HandSlotInfo {
		return true
	}
}

export class PileSlotInfo extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null) {
		super(game, entity, playerId, 'pile')
	}

	override inPile(): this is PileSlotInfo {
		return true
	}
}

export class DiscardSlotInfo extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null) {
		super(game, entity, playerId, 'discardPile')
	}

	override inDiscardPile(): this is DiscardSlotInfo {
		return true
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
