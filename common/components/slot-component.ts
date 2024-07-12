import type {GameModel} from '../models/game-model'
import type {SlotTypeT} from '../types/cards'
import type {PlayerEntity, RowEntity, SlotEntity} from '../types/game-state'
import {CardComponent} from './card-component'
import {card, slot} from './query'

export class SlotComponent {
	readonly game: GameModel
	readonly entity: SlotEntity
	readonly playerEntity: PlayerEntity | null
	readonly type: SlotTypeT

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerEntity: PlayerEntity | null,
		type: SlotTypeT
	) {
		this.entity = entity
		this.game = game
		this.playerEntity = playerEntity
		this.type = type
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

	get player() {
		if (!this.playerEntity) return null
		return this.game.components.getOrError(this.playerEntity)
	}

	get opponentPlayer() {
		if (!this.playerEntity) return null
		return this.game.components.get(this.game.otherPlayerEntity(this.playerEntity))
	}
}

export class BoardSlotComponent extends SlotComponent {
	readonly index: number | null
	readonly rowEntity: RowEntity | null

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerId: PlayerEntity | null,
		type: SlotTypeT,
		index: number | null,
		row: RowEntity | null
	) {
		super(game, entity, playerId, type)
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
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerEntity | null) {
		super(game, entity, playerId, 'hand')
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

function findDeckPosition(game: GameModel, position: DeckPosition): number {
	let deckPositionsWithCards = game.components
		.filter(CardComponent, card.slot(slot.deck))
		.map((card) => card.slot as DeckSlotComponent)
		.sort((a, b) => a.order - b.order)

	// If there is no cards in the deck, lets give the first card a position.
	if (deckPositionsWithCards.length === 0) {
		return 0.5
	}

	if (position.position === 'random') {
		let numberOfPossibleSpots = deckPositionsWithCards.length + 1
		let targetPosition = Math.floor(Math.random() * numberOfPossibleSpots)

		if (targetPosition === 0) {
			return findDeckPosition(game, {position: 'front'})
		} else {
			return findDeckPosition(game, {
				position: 'after',
				spot: deckPositionsWithCards[targetPosition],
			})
		}
	}

	if (position.position === 'front') {
		return deckPositionsWithCards[0].order - 1
	}

	if (position.position === 'back') {
		return deckPositionsWithCards[-1].order + 1
	}

	let positonOfTargetCard = deckPositionsWithCards.findIndex(
		(value) => value.entity === position.spot.entity
	)

	if (positonOfTargetCard === -1) {
		throw new Error('Given spot does not exist in deck')
	}

	if (position.position === 'before') {
		if (positonOfTargetCard === 1) {
			return findDeckPosition(game, {position: 'front'})
		}

		let targetOrder = deckPositionsWithCards[positonOfTargetCard - 1].order
		deckPositionsWithCards[positonOfTargetCard - 1].order =
			(targetOrder + deckPositionsWithCards[positonOfTargetCard - 2].order) / 2
		return targetOrder
	}

	if (position.position === 'after') {
		if (positonOfTargetCard === deckPositionsWithCards.length - 1) {
			return findDeckPosition(game, {position: 'back'})
		}

		let targetOrder = deckPositionsWithCards[positonOfTargetCard + 1].order
		deckPositionsWithCards[positonOfTargetCard + 1].order =
			(targetOrder + deckPositionsWithCards[positonOfTargetCard + 2].order) / 2
		return targetOrder
	}

	throw new Error('Uknown position: ' + position)
}

export class DeckSlotComponent extends SlotComponent {
	order: number = 1000

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerId: PlayerEntity | null,
		position: DeckPosition
	) {
		super(game, entity, playerId, 'deck')
		this.order = findDeckPosition(game, position)
	}

	override inDeck(): this is DeckSlotComponent {
		return true
	}
}

export class DiscardSlotComponent extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerEntity | null) {
		super(game, entity, playerId, 'discardPile')
	}

	override inDiscardPile(): this is DiscardSlotComponent {
		return true
	}
}
