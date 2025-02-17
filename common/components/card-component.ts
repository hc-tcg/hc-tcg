import {
	DiscardSlotComponent,
	HandSlotComponent,
	ObserverComponent,
	PlayerComponent,
	SlotComponent,
	StatusEffectComponent,
} from '.'
import {
	type Attach,
	type Card,
	type HasHealth,
	type Hermit,
	type Item,
	type SingleUse,
	isAttach,
	isHealth,
	isHermit,
	isItem,
	isSingleUse,
} from '../cards/types'
import type {
	CardEntity,
	ObserverEntity,
	PlayerEntity,
	SlotEntity,
} from '../entities'
import type {GameModel} from '../models/game-model'
import {StatusEffect} from '../status-effects/status-effect'
import {TypeT} from '../types/cards'
import {GameHook} from '../types/hooks'
import query from './query'

let CARDS: Record<any, Card>
import('../cards').then((mod) => (CARDS = mod.CARDS))

/** A component that represents a card in the game. Cards can be in the player's hand, deck, board or discard pile. */
export class CardComponent<CardType extends Card = Card> {
	readonly game: GameModel
	readonly props: CardType
	readonly entity: CardEntity

	slotEntity: SlotEntity
	observerEntity: ObserverEntity | null

	turnedOver: boolean
	prizeCard: boolean

	hooks: {
		onChangeSlot: GameHook<(slot: SlotComponent) => void>
		/** Get the cost of the primary attack from this card, if it is a hermit */
		getPrimaryCost: GameHook<() => Array<TypeT>>
		/** Get the cost of the secondary attack from this card, if it is a hermit */
		getSecondaryCost: GameHook<() => Array<TypeT>>
	}

	constructor(
		game: GameModel,
		entity: CardEntity,
		card: number | string | Card,
		slot: SlotEntity,
	) {
		this.game = game
		this.entity = entity
		this.observerEntity = null
		if (card instanceof Object) {
			this.props = card as CardType
		} else {
			this.props = CARDS[card] as CardType
		}

		this.slotEntity = slot

		if (this.slot.onBoard()) {
			let observer = this.game.components.new(ObserverComponent, this.entity)
			this.onAttach(observer)
		}

		this.turnedOver = false
		this.prizeCard = false

		this.hooks = {
			onChangeSlot: new GameHook(),
			getPrimaryCost: new GameHook(),
			getSecondaryCost: new GameHook(),
		}

		this.props.onCreate(this.game, this)
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

	private onAttach(observer: ObserverComponent) {
		this.observerEntity = observer.entity
		this.player?.hooks.onAttach.call(this)
		this.props.onAttach(this.game, this, observer)
		if (isHermit(this.props)) {
			observer.subscribe(this.hooks.getPrimaryCost, () => {
				if (!isHermit(this.props)) return []
				return this.props.primary.cost
			})
			observer.subscribe(this.hooks.getSecondaryCost, () => {
				if (!isHermit(this.props)) return []
				return this.props.secondary.cost
			})
		}
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
		return this.game.components.getOrError(
			this.game.otherPlayerEntity(this.slot?.player.entity),
		)
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
			this.slot.onBoard() !== component.onBoard() ||
			this.player.entity !== component.player.entity

		if (this.slot.onBoard() && !component.onBoard()) {
			this.game.components
				.filter(StatusEffectComponent, query.effect.targetEntity(this.entity))
				.forEach((effect) => effect.remove())
		}

		if (this.slot.onBoard() && changingBoards) {
			if (!this.observerEntity)
				throw new Error(
					'All cards attached to the board should have an observer',
				)
			let observer = this.game.components.get(this.observerEntity)
			if (!observer) throw new Error('Observer expected to be in ECS')
			observer.unsubscribeFromEverything()
			this.props.onDetach(this.game, this, observer)
			this.player.hooks.onDetach.call(this)
		}

		this.slotEntity = component.entity

		if (component.onBoard() && changingBoards) {
			let observer = this.game.components.new(ObserverComponent, this.entity)
			this.onAttach(observer)
		}

		this.hooks.onChangeSlot.call(component)
	}

	/** Move this card to the hand
	 * @arg player - The player who's hand to add this card to. Adds to the current card owner's hand if not specified.
	 */
	public draw(player?: PlayerEntity) {
		this.attach(
			this.game.components.new(
				HandSlotComponent,
				player || this.slot.player.entity,
			),
		)
	}

	/** Move this card to the discard pile.
	 * @arg player - The player who's hand to add this card to. Adds to the current card owner's discard pile if not specified.
	 */
	public discard(player?: PlayerEntity) {
		this.attach(
			this.game.components.new(
				DiscardSlotComponent,
				player || this.slot.player.entity,
			),
		)
	}

	public getStatusEffect(...statusEffect: Array<StatusEffect<CardComponent>>) {
		return this.game.components.find(
			StatusEffectComponent,
			query.effect.is(...statusEffect),
			query.effect.targetEntity(this.entity),
		)
	}

	public getAttackCost(attack: 'primary' | 'secondary'): Array<TypeT> {
		if (attack === 'primary') {
			return this.hooks.getPrimaryCost.call().flat()
		} else if (attack === 'secondary') {
			return this.hooks.getSecondaryCost.call().flat()
		}
		throw new Error("`attack` should be 'primary' or 'secondary'")
	}
}
