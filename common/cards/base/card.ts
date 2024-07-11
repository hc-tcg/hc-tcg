import {
	PlayCardLog,
	CardRarityT,
	TypeT,
	HermitAttackInfo,
	ExpansionT,
	CardCategoryT,
} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {Predicate, row} from '../../filters'
import {HermitAttackType} from '../../types/attack'
import {AttackModel} from '../../models/attack-model'
import {WithoutFunctions} from '../../types/server-requests'
import {CardComponent, RowComponent, SlotComponent} from '../../types/components'

export type CanAttachError =
	| 'INVALID_PLAYER'
	| 'INVALID_SLOT'
	| 'UNMET_CONDITION'
	| 'UNMET_CONDITION_SILENT'
	| 'UNKNOWN_ERROR'

export type CanAttachResult = Array<CanAttachError>

export type CardProps = {
	id: string
	category: CardCategoryT
	expansion: ExpansionT
	numericId: number
	name: string
	shortName?: string
	rarity: CardRarityT
	tokens: number
	attachCondition: Predicate<SlotComponent>
	sidebarDescriptions?: Array<{type: string; name: string}>
	/** The battle log attached to this card */
	/** Set to string when the card should generate a log when played or applied, and null otherwise */
	log?: (values: PlayCardLog) => string
}

export type Item = CardProps & {
	item: null
	type: TypeT
}

export function isItem(props: WithoutFunctions<CardProps>): props is WithoutFunctions<Item>
export function isItem(props: CardProps): props is Item
export function isItem(props: CardProps | WithoutFunctions<CardProps> | null): props is Item {
	return props !== null && 'item' in props
}

export type HasHealth = CardProps & {
	health: number
}

export function isHealth(props: WithoutFunctions<CardProps>): props is WithoutFunctions<HasHealth>
export function isHealth(props: CardProps): props is HasHealth
export function isHealth(
	props: CardProps | WithoutFunctions<CardProps> | null
): props is HasHealth {
	return props !== null && 'health' in props
}

export type Hermit = HasHealth & {
	hermit: null
	type: TypeT
	primary: HermitAttackInfo
	secondary: HermitAttackInfo
	palette?: 'alter_egos' | 'advent_of_tcg' | 'pharoah'
	background?: 'alter_egos' | 'advent_of_tcg'
}

export function isHermit(props: WithoutFunctions<CardProps>): props is WithoutFunctions<Hermit>
export function isHermit(props: CardProps): props is Hermit
export function isHermit(props: CardProps | WithoutFunctions<CardProps> | null): props is Hermit {
	return props !== null && 'hermit' in props
}

export type Attach = CardProps & {
	attachable: null
	description: string
}

export function isAttach(props: WithoutFunctions<CardProps>): props is WithoutFunctions<Attach>
export function isAttach(props: CardProps): props is Attach
export function isAttach(props: CardProps | WithoutFunctions<CardProps> | null): props is Attach {
	return props !== null && 'attachable' in props
}

export type SingleUse = CardProps & {
	singleUse: null
	showConfirmationModal: boolean
	hasAttack: boolean
	description: string
}

export function isSingleUse(
	props: WithoutFunctions<CardProps>
): props is WithoutFunctions<SingleUse>
export function isSingleUse(props: CardProps): props is SingleUse
export function isSingleUse(
	props: CardProps | WithoutFunctions<CardProps> | null
): props is SingleUse {
	return props !== null && 'singleUse' in props
}

/** Type that allows multiple functions in a card to share values. */
export class InstancedValue<T> {
	default: () => T
	values: Record<string, T> = {}

	public constructor(defaultFactory: () => T) {
		this.default = defaultFactory
	}

	public set(component: CardComponent, value: T) {
		this.values[component.entity] = value
	}

	public get(component: CardComponent): T {
		if (component.entity in this.values) {
			return this.values[component.entity]
		}
		return this.default()
	}

	public clear(component: CardComponent) {
		delete this.values[component.entity]
	}
}

abstract class Card<Props extends CardProps = CardProps> {
	public abstract props: Props

	/**
	 * Called when a component of this card is attached to the board
	 */
	public onAttach(game: GameModel, component: CardComponent) {
		// default is do nothing
	}

	/**
	 * Called when a compoent of this card is removed from the board
	 */
	public onDetach(game: GameModel, component: CardComponent) {
		// default is do nothing
	}

	public isItem(): this is Card<CardProps & Item> {
		return isItem(this.props)
	}

	public getEnergy(this: Card<Item>, game: GameModel, component: CardComponent): Array<TypeT> {
		return []
	}

	public isHealth(): this is Card<CardProps & HasHealth> {
		return isHealth(this.props)
	}

	public isHermit(): this is Card<CardProps & Hermit> {
		return isHermit(this.props)
	}

	public getAttack(
		this: Card<Hermit>,
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType
	): AttackModel | null {
		const attack = game.newAttack({
			attacker: component.entity,
			target: game.components.findEntity(RowComponent, row.opponentPlayer, row.active),
			type: hermitAttackType,
			createWeakness: 'ifWeak',
			log: (values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with ${values.attackName} for ${values.damage} damage`,
		})

		if (attack.type === 'primary') {
			attack.addDamage(component.entity, this.props.primary.damage)
		} else if (attack.type === 'secondary') {
			attack.addDamage(component.entity, this.props.secondary.damage)
		}

		return attack
	}

	public hasAttacks(this: Card<HasHealth>): this is Card<Props & Hermit> {
		return 'primary' in this.props && 'secondary' in this.props
	}

	public isAttach(): this is Card<CardProps & Attach> {
		return isAttach(this.props)
	}

	public isSingleUse(): this is Card<CardProps & SingleUse> {
		return isSingleUse(this.props)
	}

	public getFormattedDescription(this: Card<Attach | SingleUse>): FormattedTextNode {
		return formatText(this.props.description)
	}

	/** Gets the log entry for this attack*/
	public getLog(values: PlayCardLog) {
		if (!this.props.log) return ''
		return this.props.log(values)
	}
}

export default Card
