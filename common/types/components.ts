export class Component {

}


export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity
	readonly playerId: PlayerId

	slotEntity: SlotEntity | null

	constructor(game: GameModel, entity: CardEntity, id: string, playerId: PlayerId) {
		this.game = game
		this.entity = entity
		this.card = CARDS[id] as any
		this.playerId = playerId
		this.slotEntity = null
		this.playerId = playerId
	}

	static fromLocalCardInstance(
		game: GameModel,
		localCardInstance: LocalCardInstance
	): CardComponent {
		for (const card of game.state.cards.list()) {
			if (card.entity == localCardInstance.instance) {
				return card
			}
		}
		throw new Error('An ID for a nonexistent card should never be created')
	}

	public toLocalCardInstance(): LocalCardInstance<Props> {
		return {
			props: this.card.props as WithoutFunctions<Props>,
			instance: this.entity,
			slot: this.slotEntity,
		}
	}

	public get props(): Props {
		return this.card.props
	}

	public get slot(): SlotComponent | null {
		return this.game.state.slots.get(this.slotEntity)
	}

	public set slot(component: SlotComponent) {
		this.slotEntity = component.entity
	}

	public get player(): PlayerState {
		return this.game.state.players[this.playerId]
	}

	public get opponentPlayer(): PlayerState {
		return this.game.state.players[this.game.otherPlayer(this.playerId)]
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
}

export class StatusEffectComponent<Props extends StatusEffectProps = StatusEffectProps> {
	readonly game: GameModel
	readonly entity: StatusEffectEntity
	readonly statusEffect: StatusEffect<Props>
	public playerId: PlayerId
	public targetEntity: CardEntity
	public counter: number | null

	constructor(
		game: GameModel,
		entity: StatusEffectEntity,
		playerId: PlayerId,
		statusEffect: StatusEffect<Props>,
		targetEntity: CardEntity
	) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.statusEffect = statusEffect
		this.targetEntity = targetEntity
		this.counter = null
	}

	public toLocalStatusEffectInstance(): LocalStatusEffectInstance {
		return {
			props: WithoutFunctions(this.props),
			instance: this.entity,
			targetInstance: this.target.toLocalCardInstance(),
			counter: this.counter,
		}
	}

	public get props(): Props {
		return this.statusEffect.props
	}

	public get target(): CardComponent {
		return this.game.state.cards.getOrThrowError(this.targetEntity)
	}

	public get player(): PlayerState {
		return this.game.state.players[this.playerId]
	}

	public get opponentPlayer(): PlayerState {
		return this.game.state.players[this.game.otherPlayer(this.playerId)]
	}

	public isCounter(): this is StatusEffectComponent<Counter> {
		return isCounter(this.statusEffect.props)
	}
}
