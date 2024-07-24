import {
	DiscardSlotComponent,
	HandSlotComponent,
	ObserverComponent,
	PlayerComponent,
	SlotComponent,
	StatusEffectComponent,
} from '.'
import type Card from '../cards/base/card'
import {CardClass} from '../cards/base/card'
import {
	type Attach,
	type CardProps,
	type HasHealth,
	type Hermit,
	type Item,
	type SingleUse,
	isItem,
	isSingleUse,
	isAttach,
	isHealth,
	isHermit,
} from '../cards/base/types'
import type {GameModel} from '../models/game-model'
import type {CardEntity, PlayerEntity, SlotEntity, ObserverEntity} from '../entities'
import * as query from './query'
import {CardStatusEffect} from '../status-effects/status-effect'

let CARDS: Record<any, Card>
import('../cards').then((mod) => (CARDS = mod.CARDS))

/** A component that represents a card in the game. Cards can be in the player's hand, deck, board or discard pile. */
export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity

	slotEntity: SlotEntity
	observerEntity: ObserverEntity | null

	turnedOver: boolean

	constructor(
		game: GameModel,
		entity: CardEntity,
		card: number | string | CardClass,
		slot: SlotEntity
	) {
		this.game = game
		this.entity = entity
		this.observerEntity = null
		if (card instanceof Object) {
			this.card = CARDS[card.name] as Card<Props>
		} else {
			this.card = CARDS[card] as Card<Props>
		}

		this.slotEntity = slot

		if (this.slot.onBoard()) {
			let observer = this.game.components.new(ObserverComponent, this.entity)
			this.observerEntity = observer.entity
			this.card.onAttach(this.game, this, observer)
			this.player?.hooks.onAttach.call(this)
		}

		this.turnedOver = false

		this.card.onCreate(this.game, this)
	}

	/** A function that is used to order cards by thier slot's order.
	 * ```ts
	 * let orderedCards = game.components.filter(
	 *        CardComponent,
	 *        query.card.slot(query.slot.deck),
	 *        query.card.currentPlayer,
	 *    )
	 *    .order(CardComponent.compareOrder)
	 * ```
	 */
	static compareOrder(a: CardComponent, b: CardComponent) {
		if (!('order' in a.slot) || !('order' in b.slot)) return 0
		return (a.slot.order as number) - (b.slot.order as number)
	}

	public get props(): Props {
		return this.card.props
	}

	/** The slot that this card is in */
	public get slot(): SlotComponent {
		return this.game.components.getOrError(this.slotEntity)
	}

	/** Get the player who owns the slot this card is in. */
	public get player(): PlayerComponent {
		return this.game.components.getOrError(this.slot?.player.entity)
	}

	/** Get the player who does not own the slot this card is in. */
	public get opponentPlayer(): PlayerComponent {
		return this.game.components.getOrError(this.game.otherPlayerEntity(this.slot?.player.entity))
	}

	public isItem(): this is CardComponent<Item> {
		return isItem(this.props)
	}
	public isSingleUse(): this is CardComponent<SingleUse> {
		return isSingleUse(this.props)
	}
	public isAttach(): this is CardComponent<Attach> {
		return isAttach(this.props)
	}
	public isHealth(): this is CardComponent<HasHealth> {
		return isHealth(this.props)
	}
	public isHermit(): this is CardComponent<Hermit> {
		return isHermit(this.props)
	}

	/** Return true if this hermit is in a row and this hermits HP is greater than 0 */
	public isAlive(): boolean {
		return this.slot.inRow() && !!this.slot.row.health
	}

	/** Change this cards slot. Run the `onAttach` function and hooks if this card is being attached
	 * to a board slot and is not currently on the player's side of the board. */
	public attach(component: SlotComponent) {
		// Stores if the card is moving to the slot's player's board or leaving the slot's player's board.
		let changingBoards =
			this.slot.onBoard() !== component.onBoard() || this.player.entity !== component.player.entity

		if (this.slot.onBoard() && changingBoards) {
			if (!this.observerEntity)
				throw new Error('All cards attached to the board should have an observer')
			let observer = this.game.components.get(this.observerEntity)
			if (!observer) throw new Error('Observer expected to be in ECS')
			observer.unsubscribeFromEverything()
			this.card.onDetach(this.game, this, observer)
			this.player.hooks.onDetach.call(this)
		}

		this.slotEntity = component.entity

		if (component.onBoard() && changingBoards) {
			let observer = this.game.components.new(ObserverComponent, this.entity)
			this.observerEntity = observer.entity
			this.card.onAttach(this.game, this, observer)
			this.player.hooks.onAttach.call(this)
		}
	}

	/** Move this card to the hand
	 * @arg player - The player who's hand to add this card to. Adds to the current card owner's hand if not specified.
	 */
	public draw(player?: PlayerEntity) {
		this.attach(this.game.components.new(HandSlotComponent, player || this.slot.player.entity))
	}

	/** Move this card to the discard pile.
	 * @arg player - The player who's hand to add this card to. Adds to the current card owner's discard pile if not specified.
	 */
	public discard(player?: PlayerEntity) {
		this.attach(this.game.components.new(DiscardSlotComponent, player || this.slot.player.entity))
	}

	public hasStatusEffect(...statusEffect: Array<new () => CardStatusEffect>) {
		return this.game.components.find(
			StatusEffectComponent,
			query.effect.is(...statusEffect),
			query.effect.targetEntity(this.entity)
		)
	}
}
