import type {ComponentQuery} from '../../components/query'
import type {
	CardCategoryT,
	CardRarityT,
	ExpansionT,
	HermitAttackInfo,
	PlayCardLog,
	TypeT,
} from '../../types/cards'
import type {SlotComponent} from '../../components'
import type {WithoutFunctions} from '../../types/server-requests'
import {GameModel} from '../../models/game-model'

export type CardProps = {
	id: string
	category: CardCategoryT
	expansion: ExpansionT
	numericId: number
	name: string
	shortName?: string
	rarity: CardRarityT
	tokens: 0 | 1 | 2 | 3 | 4 | 5 | 'wild'
	attachCondition: ComponentQuery<SlotComponent>
	sidebarDescriptions?: Array<{type: string; name: string}>
	/** The battle log attached to this card */
	/** Set to string when the card should generate a log when played or applied, and null otherwise */
	log?: (values: PlayCardLog) => string
}

export type Item = CardProps & {
	item: null
	type: TypeT
	energy: Array<TypeT>
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

export type Description = CardProps & {
	description: string
}

export function hasDescription(
	props: WithoutFunctions<CardProps>
): props is WithoutFunctions<Description>
export function hasDescription(props: CardProps): props is Description
export function hasDescription(
	props: CardProps | WithoutFunctions<CardProps> | null
): props is Description {
	return props !== null && 'description' in props
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

export type Attach = CardProps &
	Description & {
		attachable: null
	}

export function isAttach(props: WithoutFunctions<CardProps>): props is WithoutFunctions<Attach>
export function isAttach(props: CardProps): props is Attach
export function isAttach(props: CardProps | WithoutFunctions<CardProps> | null): props is Attach {
	return props !== null && 'attachable' in props
}

export type SingleUse = CardProps &
	Description & {
		singleUse: null
		showConfirmationModal: boolean
		hasAttack: boolean
		attackPreview?: (game: GameModel) => string
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
