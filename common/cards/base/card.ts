import {
	PlayCardLog,
	CardRarityT,
	TypeT,
	HermitAttackInfo,
	ExpansionT,
	CardCategoryT,
	SlotComponent,
} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {slot, SlotCondition} from '../../filters'
import {HermitAttackType} from '../../types/attack'
import {AttackModel} from '../../models/attack-model'
import {CardComponent} from '../../types/game-state'
import {WithoutFunctions} from '../../types/server-requests'

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
	attachCondition: SlotCondition
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

export const item = {
	item: null,
	category: 'item' as CardCategoryT,
	attachCondition: slot.every(
		slot.currentPlayer,
		slot.itemSlot,
		slot.empty,
		slot.rowHasHermit,
		slot.actionAvailable('PLAY_ITEM_CARD'),
		slot.not(slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
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

export const hermit = {
	hermit: null,
	category: 'hermit' as CardCategoryT,
	attachCondition: slot.every(
		slot.hermitSlot,
		slot.currentPlayer,
		slot.empty,
		slot.actionAvailable('PLAY_HERMIT_CARD'),
		slot.not(slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
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

export const attach = {
	attachable: null,
	category: 'attach' as CardCategoryT,
	attachCondition: slot.every(
		slot.currentPlayer,
		slot.attachSlot,
		slot.empty,
		slot.rowHasHermit,
		slot.actionAvailable('PLAY_EFFECT_CARD'),
		slot.not(slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
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

export const singleUse = {
	singleUse: null,
	showConfirmationModal: false,
	hasAttack: false,
	category: 'single_use' as CardCategoryT,
	attachCondition: slot.every(
		slot.singleUseSlot,
		slot.playerHasActiveHermit,
		slot.actionAvailable('PLAY_SINGLE_USE_CARD')
	),
}

/** Type that allows multiple functions in a card to share values. */
export class InstancedValue<T> {
	default: () => T
	values: Record<string, T> = {}

	public constructor(defaultFactory: () => T) {
		this.default = defaultFactory
	}

	public set(instance: CardComponent, value: T) {
		this.values[instance.entity] = value
	}

	public get(instance: CardComponent): T {
		if (instance.entity in this.values) {
			return this.values[instance.entity]
		}
		return this.default()
	}

	public clear(instance: CardComponent) {
		delete this.values[instance.entity]
	}
}

abstract class Card<Props extends CardProps = CardProps> {
	public abstract props: Props

	public getKey(keyName: string) {
		return this.props.id + ':' + keyName
	}

	public getInstanceKey(instance: CardComponent, keyName: string = '') {
		return this.props.id + ':' + instance.entity + ':' + keyName
	}

	/**
	 * Called when an instance of this card is attached to the board
	 */
	public onAttach(game: GameModel, instance: CardComponent, placedIn: SlotComponent) {
		// default is do nothing
	}

	/**
	 * Called when an instance of this card is removed from the board
	 */
	public onDetach(game: GameModel, instance: CardComponent, from: SlotComponent) {
		// default is do nothing
	}

	public isItem(): this is Card<CardProps & Item> {
		return isItem(this.props)
	}

	public getEnergy(this: Card<Item>, game: GameModel, instance: CardComponent): Array<TypeT> {
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
		instance: CardComponent,
		pos: SlotComponent,
		hermitAttackType: HermitAttackType
	): AttackModel | null {
		if (pos.row === null || !pos.rowId || !pos.row.index) return null

		const {opponentPlayer: opponentPlayer} = game
		const targetIndex = opponentPlayer.board.activeRow
		if (targetIndex === null) return null

		const targetRow = opponentPlayer.board.rows[targetIndex]
		if (!targetRow.hermitCard) return null

		// Create an attack with default damage
		const attack = new AttackModel({
			id: this.getInstanceKey(instance),
			attacker: {
				player: pos.player,
				rowIndex: pos.row.index,
				rowId: pos.rowId,
			},
			target: {
				player: opponentPlayer,
				rowIndex: targetIndex,
				row: targetRow,
			},
			type: hermitAttackType,
			createWeakness: 'ifWeak',
			log: (values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with ${values.attackName} for ${values.damage} damage`,
		})

		if (attack.type === 'primary') {
			attack.addDamage(this.props.id, this.props.primary.damage)
		} else if (attack.type === 'secondary') {
			attack.addDamage(this.props.id, this.props.secondary.damage)
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
