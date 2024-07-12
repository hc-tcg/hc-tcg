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
import {CardEntity, PlayerEntity, SlotEntity} from '../types/game-state'
import {LocalCardInstance, WithoutFunctions} from '../types/server-requests'

let CARDS: Record<any, Card>
import('../cards').then((mod) => (CARDS = mod.CARDS))

export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity
	readonly playerEntity: PlayerEntity

	slotEntity: SlotEntity | null

	constructor(game: GameModel, entity: CardEntity, card: new () => Card, playerId: PlayerEntity) {
		this.game = game
		this.entity = entity
		this.card = CARDS[card.name] as Card<Props>
		this.playerEntity = playerId
		this.slotEntity = null
		this.playerEntity = playerId
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

	public get props(): Props {
		return this.card.props
	}

	public get slot(): SlotComponent | null {
		return this.game.components.get(this.slotEntity)
	}

	public get player(): PlayerComponent {
		return this.game.components.getOrError(this.playerEntity)
	}

	public get opponentPlayer(): PlayerComponent {
		return this.game.components.getOrError(this.game.otherPlayerEntity(this.playerEntity))
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

	public attach(component: SlotComponent) {
		this.slotEntity = component.entity
		if (component.onBoard()) {
			this.card.onAttach(this.game, this)
			this.player.hooks.onAttach.call(this)
		}
	}

	/** Move this card to the discard pile */
	public discard() {
		if (this.slot?.onBoard()) {
			this.card.onDetach(this.game, this)
			this.player.hooks.onDetach.call(this)
		}
		this.slotEntity = this.game.components.new(DiscardSlotComponent, this.playerEntity).entity
	}
}
