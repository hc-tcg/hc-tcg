import {CardComponent, ObserverComponent, RowComponent} from '../../components'
import query from '../../components/query'
import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {PlayCardLog} from '../../types/cards'
import {DefaultDictionary} from '../../types/game-state'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {
	Attach,
	HasHealth,
	Hermit,
	Item,
	SingleUse,
	isAttach,
	isHealth,
	isHermit,
	isItem,
	isSingleUse,
} from './types'

export type CanAttachError =
	| 'INVALID_PLAYER'
	| 'INVALID_SLOT'
	| 'UNMET_CONDITION'
	| 'UNMET_CONDITION_SILENT'
	| 'UNKNOWN_ERROR'

export type CanAttachResult = Array<CanAttachError>

/** Type that allows multiple functions in a card to share values. */
export class InstancedValue<T> extends DefaultDictionary<CardComponent, T> {
	public set(component: CardComponent, value: T) {
		this.setValue(component.entity, value)
	}

	public get(component: CardComponent): T {
		return this.getValue(component.entity)
	}

	public clear(component: CardComponent) {
		this.clearValue(component.entity)
	}
}

export type CardClass = new (cardClass: CardClass) => CardOld

abstract class CardOld {
	public abstract props: Props
	public cardClass: CardClass

	constructor(cardClass: CardClass) {
		this.cardClass = cardClass
	}

	/**
	 * Called when a component of this card is created
	 */
	public onCreate(_game: GameModel, _component: CardComponent) {
		// default is do nothing
	}

	/**
	 * Called when a component of this card is attached to the board
	 */
	public onAttach(
		_game: GameModel,
		_component: CardComponent,
		_observer: ObserverComponent,
	) {
		// default is do nothing
	}

	/**
	 * Called when a compoent of this card is removed from the board
	 */
	public onDetach(
		_game: GameModel,
		_component: CardComponent,
		_observer: ObserverComponent,
	) {
		// default is do nothing
	}

	public isItem(): this is CardOld<CardOld & Item> {
		return isItem(this.props)
	}

	public isHealth(): this is CardOld<CardOld & HasHealth> {
		return isHealth(this.props)
	}

	public isHermit(): this is CardOld<CardOld & Hermit> {
		return isHermit(this.props)
	}

	public getAttack(
		this: CardOld<Hermit>,
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType,
	): AttackModel | null {
		const attack = game.newAttack({
			attacker: component.entity,
			target: game.components.findEntity(
				RowComponent,
				query.row.opponentPlayer,
				query.row.active,
			),
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

	public hasAttacks(this: CardOld<HasHealth>): this is CardOld<Props & Hermit> {
		return 'primary' in this.props && 'secondary' in this.props
	}

	public isAttach(): this is CardOld<CardOld & Attach> {
		return isAttach(this.props)
	}

	public isSingleUse(): this is CardOld<CardOld & SingleUse> {
		return isSingleUse(this.props)
	}

	public getFormattedDescription(
		this: CardOld<Attach | SingleUse>,
	): FormattedTextNode {
		return formatText(this.props.description)
	}

	/** Gets the log entry for this attack*/
	public getLog(values: PlayCardLog) {
		if (!this.props.log) return ''
		return this.props.log(values)
	}
}

export default CardOld
