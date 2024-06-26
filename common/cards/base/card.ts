import {
	PlayCardLog,
	CardRarityT,
	HermitTypeT,
	HermitAttackInfo,
	ExpansionT,
	CardTypeT,
} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {slot, SlotCondition} from '../../slot'
import {HermitAttackType} from '../../types/attack'
import {AttackModel} from '../../models/attack-model'

export type CanAttachError =
	| 'INVALID_PLAYER'
	| 'INVALID_SLOT'
	| 'UNMET_CONDITION'
	| 'UNMET_CONDITION_SILENT'
	| 'UNKNOWN_ERROR'

export type CanAttachResult = Array<CanAttachError>

export type CardProps = {
	id: string
	type: CardTypeT
	expansion: ExpansionT
	numericId: number
	name: string
	rarity: CardRarityT
	tokens: number
	sidebarDescriptions?: Array<{type: string; name: string}>
	/** The battle log attached to this card */
	/** Set to string when the card should generate a log when played or applied, and null otherwise */
	log?: (values: PlayCardLog) => string
	attachCondition?: SlotCondition
}

export type Item = CardProps & {
	item: null
	hermitType: HermitTypeT
}

export const item = {
	item: null,
	type: 'item' as CardTypeT,
	attachCondition: slot.every(
		slot.player,
		slot.itemSlot,
		slot.empty,
		slot.rowHasHermit,
		slot.actionAvailable('PLAY_ITEM_CARD'),
		slot.not(slot.frozen)
	),
}

export type HasHealth = CardProps & {
	health: number
}

export type Hermit = HasHealth & {
	hermit: null
	hermitType: HermitTypeT
	primary: HermitAttackInfo
	secondary: HermitAttackInfo
}

export const hermit = {
	hermit: null,
	type: 'hermit' as CardTypeT,
	attachCondition: slot.every(
		slot.hermitSlot,
		slot.player,
		slot.empty,
		slot.actionAvailable('PLAY_HERMIT_CARD'),
		slot.not(slot.frozen)
	),
}

export type Attachable = CardProps & {
	attachable: null
	description: string
}

export const attachable = {
	attachable: null,
	type: 'effect' as CardTypeT,
	attachCondition: slot.every(
		slot.player,
		slot.effectSlot,
		slot.empty,
		slot.rowHasHermit,
		slot.actionAvailable('PLAY_EFFECT_CARD'),
		slot.not(slot.frozen)
	),
}

export type SingleUse = CardProps & {
	singleUse: null
	showConfirmationModal: boolean
	description: string
}

export const singleUse = {
	singleUse: null,
	type: 'single_use' as CardTypeT,
	showConfirmationModal: false,
	attachCondition: slot.every(
		slot.singleUseSlot,
		slot.playerHasActiveHermit,
		slot.actionAvailable('PLAY_SINGLE_USE_CARD')
	),
}

abstract class Card<Props extends CardProps = CardProps> {
	public abstract props: Props
	private log: Array<(values: PlayCardLog) => string>

	constructor() {
		this.log = []
	}

	/**
	 * A combinator expression that returns if the card can be attached to a specified slot.
	 */
	public get attachCondition(): SlotCondition {
		return this.props.attachCondition || slot.nothing
	}

	public getKey(keyName: string) {
		return this.props.id + ':' + keyName
	}

	public getInstanceKey(instance: string, keyName: string = '') {
		return this.props.id + ':' + instance + ':' + keyName
	}

	/**
	 * Called when an instance of this card is attached to the board
	 */
	public onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		// default is do nothing
	}

	/**
	 * Called when an instance of this card is removed from the board
	 */
	public onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		// default is do nothing
	}

	public isItemCard(): this is Card<CardProps & Item> {
		return 'item' in this.props
	}

	public getEnergy(this: Card<Item>, game: GameModel, pos: CardPosModel): Array<HermitTypeT> {
		return []
	}

	public isHermitCard(): this is Card<CardProps & Hermit> {
		return 'hermit' in this.props
	}

	public getAttack(
		this: Card<Hermit>,
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	): AttackModel | null {
		if (pos.rowIndex === null || !pos.row || !pos.row.hermitCard) return null

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
				rowIndex: pos.rowIndex,
				row: pos.row,
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

	public isAttachableCard(): this is Card<CardProps & Attachable> {
		return 'attachable' in this.props
	}

	public isSingleUseCard(): this is Card<CardProps & SingleUse> {
		return 'singleUse' in this.props
	}

	/**
	 * Returns the palette to use for this card
	 */
	public getPalette(): string {
		return 'default'
	}

	public getBackground(): string {
		return this.props.id.split('_')[0]
	}

	/**
	 * Returns the shortened name to use for this card
	 */
	public getShortName(): string {
		return this.props.name
	}

	/**
	 * Returns whether to show *Attach* on the card tooltip
	 */
	public showAttachTooltip(): boolean {
		return false
	}

	/**
	 * Returns whether to show *Single Use* on the card tooltip
	 */
	public showSingleUseTooltip(): boolean {
		return false
	}

	/**
	 * Returns the sidebar descriptions for this card
	 */
	public sidebarDescriptions(): Array<Record<string, string>> {
		return []
	}

	public getFormattedDescription(this: Card<Attachable | SingleUse>): FormattedTextNode {
		return formatText(this.props.description)
	}

	/** Updates the log entry*/
	public updateLog(logEntry: (values: PlayCardLog) => string) {
		if (logEntry === null) return
		this.log.push(logEntry)
	}

	private consolidateLogs(values: PlayCardLog, logIndex: number) {
		if (logIndex > 0) {
			values.previousLog = this.consolidateLogs(values, logIndex - 1)
		}
		return this.log[logIndex](values)
	}

	/** Gets the log entry for this attack*/
	public getLog(values: PlayCardLog) {
		if (this.log.length === 0) {
			return ''
		}
		return this.consolidateLogs(values, this.log.length - 1)
	}
}

export default Card
