import type {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../components'
import type {ComponentQuery} from '../components/query'
import {ExpansionT} from '../const/expansions'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {HermitAttackType} from '../types/attack'
import type {
	CardCategoryT,
	CardRarityT,
	HermitAttackInfo,
	PlayCardLog,
	TokenCostT,
	TypeT,
} from '../types/cards'
import type {WithoutFunctions} from '../types/server-requests'
import {FormattedTextNode} from '../utils/formatting'

export type Card = {
	id: string
	category: CardCategoryT
	expansion: ExpansionT
	numericId: number
	name: string
	shortName?: string
	rarity: CardRarityT
	tokens: TokenCostT
	attachCondition: ComponentQuery<SlotComponent>
	sidebarDescriptions?: Array<{type: string; name: string}>
	/** The battle log attached to this card */
	/** Set to string when the card should generate a log when played or applied, and null otherwise */
	log?: (values: PlayCardLog) => string
	onCreate(game: GameModel, component: CardComponent): void
	onAttach(
		game: GameModel,
		component: CardComponent<any>,
		observer: ObserverComponent,
	): void
	onDetach(
		game: GameModel,
		component: CardComponent<any>,
		observer: ObserverComponent,
	): void
	getLog(values: PlayCardLog): string
}

export type Item = Card & {
	item: null
	type: TypeT
	description?: string
	energy: Array<TypeT>
}

export function isItem(
	props: WithoutFunctions<Card>,
): props is WithoutFunctions<Item>
export function isItem(props: Card): props is Item
export function isItem(
	props: Card | WithoutFunctions<Card> | null,
): props is Item {
	return props !== null && 'item' in props
}

export type HasHealth = Card & {
	health: number
}

export function isHealth(
	props: WithoutFunctions<Card>,
): props is WithoutFunctions<HasHealth>
export function isHealth(props: Card): props is HasHealth
export function isHealth(
	props: Card | WithoutFunctions<Card> | null,
): props is HasHealth {
	return props !== null && 'health' in props
}

export type Description = Card & {
	description: string
}

export function hasDescription(
	props: WithoutFunctions<Card>,
): props is WithoutFunctions<Description>
export function hasDescription(props: Card): props is Description
export function hasDescription(
	props: Card | WithoutFunctions<Card> | null,
): props is Description {
	return props !== null && 'description' in props
}

export type Hermit = HasHealth & {
	hermit: null
	type: TypeT
	primary: HermitAttackInfo
	secondary: HermitAttackInfo
	getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType,
	): AttackModel | null
	palette?: 'alter_egos' | 'advent_of_tcg' | 'pharaoh' | 'advent_of_tcg_ii'
	background?: 'alter_egos' | 'advent_of_tcg' | 'advent_of_tcg_ii'
}

export function isHermit(
	props: WithoutFunctions<Card>,
): props is WithoutFunctions<Hermit>
export function isHermit(props: Card): props is Hermit
export function isHermit(
	props: Card | WithoutFunctions<Card> | null,
): props is Hermit {
	return props !== null && 'hermit' in props
}

export type Attach = Card &
	Description & {
		attachable: null
		getFormattedDescription(): FormattedTextNode
	}

export function isAttach(
	props: WithoutFunctions<Card>,
): props is WithoutFunctions<Attach>
export function isAttach(props: Card): props is Attach
export function isAttach(
	props: Card | WithoutFunctions<Card> | null,
): props is Attach {
	return props !== null && 'attachable' in props
}

export type SingleUse = Card &
	Description & {
		singleUse: null
		showConfirmationModal: boolean
		hasAttack: boolean
		attackPreview?: (game: GameModel) => string
		getFormattedDescription(): FormattedTextNode
	}

export function isSingleUse(
	props: WithoutFunctions<Card>,
): props is WithoutFunctions<SingleUse>
export function isSingleUse(props: Card): props is SingleUse
export function isSingleUse(
	props: Card | WithoutFunctions<Card> | null,
): props is SingleUse {
	return props !== null && 'singleUse' in props
}
