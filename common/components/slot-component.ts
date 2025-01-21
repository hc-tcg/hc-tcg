import type {PlayerEntity, RowEntity, SlotEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import type {SlotTypeT} from '../types/cards'
import {CardComponent} from './card-component'
import query from './query'
import {RowComponent} from './row-component'

type BoardSlotDefs =
	| {
			type: 'single_use'
	  }
	| {
			type: SlotTypeT
			player: PlayerEntity
	  }

/** A component for slots on the game board, discard pile, deck or hand.
 * Note that slots are NOT ordered in the ECS.
 */
export class SlotComponent {
	readonly game: GameModel
	readonly entity: SlotEntity
	private readonly defs: BoardSlotDefs

	constructor(game: GameModel, entity: SlotEntity, defs: BoardSlotDefs) {
		this.entity = entity
		this.game = game
		this.defs = defs
	}

	// The implementation of these type guards are in the subclasses. The regular slot component
	// does not have any of these properties so false is returned for all the type guards.

	/** Return true if the slot is on the game board */
	public onBoard(): this is BoardSlotComponent {
		return false
	}

	/** Return true if the slot is in a row. */
	public inRow(): this is BoardSlotComponent & {row: RowComponent} {
		return false
	}

	/** Return true if the slot is in a player's hand */
	public inHand(): this is HandSlotComponent {
		return false
	}

	/** Return true if the slot is in a player's deck */
	public inDeck(): this is DeckSlotComponent {
		return false
	}

	/** Return true if the slot is in a player's discard pile */
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
		return this.game.components.get(
			this.game.otherPlayerEntity(this.defs.player),
		)
	}

	public getCard() {
		return this.game.components.find(
			CardComponent,
			query.card.slotEntity(this.entity),
		)
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
		row: RowEntity | null,
	) {
		super(game, entity, defs)
		this.index = index
		this.rowEntity = row
	}

	override onBoard(): this is BoardSlotComponent {
		return true
	}

	override inRow(): this is BoardSlotComponent & {row: RowComponent} {
		return this.type !== 'single_use'
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

function findDeckPosition(
	game: GameModel,
	player: PlayerEntity,
	position: DeckPosition,
): number {
	let deckPositionsWithCards = game.components
		.filter(
			CardComponent,
			query.card.slot(query.slot.deck, query.slot.player(player)),
		)
		.map((card) => card.slot as DeckSlotComponent)
		.sort((a, b) => a.order - b.order)

	// If there is no cards in the deck, lets give the first card a position.
	if (deckPositionsWithCards.length === 0) {
		return 0
	}

	if (position.position === 'random') {
		let numberOfPossibleSpots = deckPositionsWithCards.length + 1
		let targetPosition = Math.floor(game.rng() * numberOfPossibleSpots)

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
		deckPositionsWithCards.map((spot) => (spot.order += 1))
		return 0
	}

	if (position.position === 'back') {
		return deckPositionsWithCards[deckPositionsWithCards.length - 1].order + 1
	}

	let positonOfTargetCard = deckPositionsWithCards.findIndex(
		(value) => value.entity === position.spot.entity,
	)

	if (positonOfTargetCard === -1) {
		throw new Error('Given spot does not exist in deck')
	}

	if (position.position === 'before') {
		if (positonOfTargetCard === 0) {
			return findDeckPosition(game, player, {position: 'front'})
		}

		let targetOrder = deckPositionsWithCards[positonOfTargetCard - 1].order
		deckPositionsWithCards
			.slice(0, positonOfTargetCard)
			.map((spot) => (spot.order -= 1))
		return targetOrder
	}

	if (position.position === 'after') {
		if (positonOfTargetCard === deckPositionsWithCards.length - 1) {
			return findDeckPosition(game, player, {position: 'back'})
		}

		let targetOrder = deckPositionsWithCards[positonOfTargetCard + 1].order
		deckPositionsWithCards
			.slice(positonOfTargetCard + 1)
			.map((spot) => (spot.order += 1))
		return targetOrder
	}

	throw new Error('Uknown position: ' + position)
}

export class DeckSlotComponent extends SlotComponent {
	order: number

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerEntity: PlayerEntity,
		position: DeckPosition,
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
