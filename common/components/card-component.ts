import {DiscardSlotComponent, PlayerComponent, SlotComponent} from '.'
import type Card from '../cards/base/card'
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
import {CardEntity, SlotEntity} from '../types/game-state'
import {LocalCardInstance, WithoutFunctions} from '../types/server-requests'

let CARDS: Record<any, Card>
import('../cards').then((mod) => (CARDS = mod.CARDS))

export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity

	slotEntity: SlotEntity

	constructor(
		game: GameModel,
		entity: CardEntity,
		card: string | (new () => Card),
		slot: SlotEntity
	) {
		this.game = game
		this.entity = entity
		if (card instanceof Object) {
			this.card = CARDS[card.name] as Card<Props>
		} else {
			this.card = CARDS[card] as Card<Props>
		}
		this.slotEntity = slot
	}

	static fromLocalCardInstance(
		game: GameModel,
		localCardInstance: LocalCardInstance
	): CardComponent {
		for (const card of game.components.filter(CardComponent)) {
			if (card.entity == localCardInstance.instance) {
				return card
			}
		}
		throw new Error('An ID for a nonexistent card should never be created')
	}

	static compareOrder(a: CardComponent, b: CardComponent) {
		if (!('order' in a.slot) || !('order' in b.slot)) return 0
		return (a.slot.order as number) - (b.slot.order as number)
	}

	public get props(): Props {
		return this.card.props
	}

	public get slot(): SlotComponent {
		return this.game.components.getOrError(this.slotEntity)
	}

	/** Get the player who owns the slot this card is in */
	public get player(): PlayerComponent {
		return this.game.components.getOrError(this.slot?.player.entity)
	}

	/** Get the player who does not own the slot this card is in */
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

	public toLocalCardInstance(): LocalCardInstance<Props> {
		return {
			props: this.card.props as WithoutFunctions<Props>,
			instance: this.entity,
			slot: this.slotEntity,
		}
	}

	/** Change this cards slot. Run the `onAttach` function and hooks if this card is being attached
	 * to a board slot and is not currently on the board. */
	public attach(component: SlotComponent) {
		let oldSlotWasOnBoard = this.slot.onBoard()
		this.slotEntity = component.entity
		if (!oldSlotWasOnBoard && component.onBoard()) {
			this.card.onAttach(this.game, this)
			this.player?.hooks.onAttach.call(this)
		}
	}

	/** Move this card to the discard pile */
	public discard() {
		if (this.slot?.onBoard()) {
			this.card.onDetach(this.game, this)
			this.player?.hooks.onDetach.call(this)
		}
		this.slotEntity = this.game.components.new(DiscardSlotComponent, this.slot.player.entity).entity
	}
}
