import type {GameModel} from '../models/game-model'
import type {SlotTypeT} from '../types/cards'
import type {PlayerEntity, RowEntity, SlotEntity} from '../types/game-state'
import {CardComponent} from './card-component'
import {card, slot} from './query'

type BoardSlotDefs =
	| {
			type: 'single_use'
	  }
	| {
			type: SlotTypeT
			player: PlayerEntity
	  }

export class SlotComponent {
	readonly game: GameModel
	readonly entity: SlotEntity
	private readonly defs: BoardSlotDefs

	constructor(game: GameModel, entity: SlotEntity, defs: BoardSlotDefs) {
		this.entity = entity
		this.game = game
		this.defs = defs
	}

	public onBoard(): this is BoardSlotComponent {
		return false
	}

	public inHand(): this is HandSlotComponent {
		return false
	}

	public inDeck(): this is DeckSlotComponent {
		return false
	}

	public inDiscardPile(): this is DiscardSlotComponent {
		return false
	}

	get type() {
		return this.defs.type
	}

	/* Return the player who owns the slot. For single use slots this is the current player. */
	get player() {
		if (this.defs.type === 'single_use')
			return this.game.components.getOrError(this.game.currentPlayerEntity)
		return this.game.components.getOrError(this.defs.player)
	}

	get opponentPlayer() {
		if (this.defs.type === 'single_use')
			return this.game.components.getOrError(this.game.opponentPlayerEntity)
		return this.game.components.get(this.game.otherPlayerEntity(this.defs.player))
	}
}

export class BoardSlotComponent extends SlotComponent {
	readonly index: number | null
	readonly rowEntity: RowEntity | null

	constructor(
		game: GameModel,
		entity: SlotEntity,
		defs: BoardSlotDefs,
		index: number | null,
		row: RowEntity | null
	) {
		super(game, entity, defs)
		this.index = index
		this.rowEntity = row
	}

	override onBoard(): this is BoardSlotComponent {
		return true
	}

	get row() {
		if (!this.rowEntity) return null
		return this.game.components.get(this.rowEntity)
	}
}

export class HandSlotComponent extends SlotComponent {
	readonly order: number

	constructor(game: GameModel, entity: SlotEntity, playerEntity: PlayerEntity) {
		super(game, entity, {player: playerEntity, type: 'hand'})
		this.order = game.components.filter(HandSlotComponent).length
	}

	override inHand(): this is HandSlotComponent {
		return true
	}
}

type DeckPosition =
	| {position: 'random'}
	| {position: 'front'}
	| {position: 'back'}
	| {position: 'before'; spot: DeckSlotComponent}
	| {position: 'after'; spot: DeckSlotComponent}

function findDeckPosition(game: GameModel, player: PlayerEntity, position: DeckPosition): number {
	let deckPositionsWithCards = game.components
		.filter(CardComponent, card.slot(slot.deck, slot.player(player)))
		.map((card) => card.slot as DeckSlotComponent)
		.sort((a, b) => a.order - b.order)

	// If there is no cards in the deck, lets give the first card a position.
	if (deckPositionsWithCards.length === 0) {
		return 0
	}

	if (position.position === 'random') {
		let numberOfPossibleSpots = deckPositionsWithCards.length + 1
		let targetPosition = Math.floor(Math.random() * numberOfPossibleSpots)

		if (targetPosition === 0) {
			return findDeckPosition(game, player, {position: 'front'})
		} else {
			return findDeckPosition(game, player, {
				position: 'after',
				spot: deckPositionsWithCards[targetPosition - 1],
			})
		}
	}

	if (position.position === 'front') {
		return deckPositionsWithCards[0].order - 1
	}

	if (position.position === 'back') {
		return deckPositionsWithCards[deckPositionsWithCards.length - 1].order + 1
	}

	let positonOfTargetCard = deckPositionsWithCards.findIndex(
		(value) => value.entity === position.spot.entity
	)

	if (positonOfTargetCard === -1) {
		throw new Error('Given spot does not exist in deck')
	}

	if (position.position === 'before') {
		if (positonOfTargetCard === 0) {
			return findDeckPosition(game, player, {position: 'front'})
		}

		let targetOrder = deckPositionsWithCards[positonOfTargetCard - 1].order
		deckPositionsWithCards[positonOfTargetCard - 1].order =
			(targetOrder + deckPositionsWithCards[positonOfTargetCard].order) / 2
		return targetOrder
	}

	if (position.position === 'after') {
		if (positonOfTargetCard === deckPositionsWithCards.length - 1) {
			return findDeckPosition(game, player, {position: 'back'})
		}

		let targetOrder = deckPositionsWithCards[positonOfTargetCard + 1].order
		deckPositionsWithCards[positonOfTargetCard + 1].order =
			(targetOrder + deckPositionsWithCards[positonOfTargetCard].order) / 2
		return targetOrder
	}

	throw new Error('Uknown position: ' + position)
}

export class DeckSlotComponent extends SlotComponent {
	order: number = 1000

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerEntity: PlayerEntity,
		position: DeckPosition
	) {
		super(game, entity, {player: playerEntity, type: 'deck'})
		this.order = findDeckPosition(game, playerEntity, position)
	}

	override inDeck(): this is DeckSlotComponent {
		return true
	}
}

export class DiscardSlotComponent extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerEntity: PlayerEntity) {
		super(game, entity, {player: playerEntity, type: 'discardPile'})
	}

	override inDiscardPile(): this is DiscardSlotComponent {
		return true
	}
}
