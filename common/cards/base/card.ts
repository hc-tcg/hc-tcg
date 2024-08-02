import {CardComponent, ObserverComponent, RowComponent} from "../../components"
import query from "../../components/query"
import {AttackModel} from "../../models/attack-model"
import {GameModel} from "../../models/game-model"
import {HermitAttackType} from "../../types/attack"
import {PlayCardLog} from "../../types/cards"
import {DefaultDictionary} from "../../types/game-state"
import {FormattedTextNode, formatText} from "../../utils/formatting"
import {
	Attach,
	CardProps,
	HasHealth,
	Hermit,
	Item,
	SingleUse,
	isAttach,
	isHealth,
	isHermit,
	isItem,
	isSingleUse,
} from "./types"

export type CanAttachError =
	| "INVALID_PLAYER"
	| "INVALID_SLOT"
	| "UNMET_CONDITION"
	| "UNMET_CONDITION_SILENT"
	| "UNKNOWN_ERROR"

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

export type CardClass = new (cardClass: CardClass) => Card

abstract class Card<Props extends CardProps = CardProps> {
	public abstract props: Props
	public cardClass: CardClass

	constructor(cardClass: CardClass) {
		this.cardClass = cardClass
	}

	/**
	 * Called when a component of this card is created
	 */
	public onCreate(game: GameModel, component: CardComponent) {
		// default is do nothing
	}

	/**
	 * Called when a component of this card is attached to the board
	 */
	public onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		// default is do nothing
	}

	/**
	 * Called when a compoent of this card is removed from the board
	 */
	public onDetach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		// default is do nothing
	}

	public isItem(): this is Card<CardProps & Item> {
		return isItem(this.props)
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
			createWeakness: "ifWeak",
			log: (values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ", then " : ""} attacked ${
					values.target
				} with ${values.attackName} for ${values.damage} damage`,
		})

		if (attack.type === "primary") {
			attack.addDamage(component.entity, this.props.primary.damage)
		} else if (attack.type === "secondary") {
			attack.addDamage(component.entity, this.props.secondary.damage)
		}

		return attack
	}

	public hasAttacks(this: Card<HasHealth>): this is Card<Props & Hermit> {
		return "primary" in this.props && "secondary" in this.props
	}

	public isAttach(): this is Card<CardProps & Attach> {
		return isAttach(this.props)
	}

	public isSingleUse(): this is Card<CardProps & SingleUse> {
		return isSingleUse(this.props)
	}

	public getFormattedDescription(
		this: Card<Attach | SingleUse>,
	): FormattedTextNode {
		return formatText(this.props.description)
	}

	/** Gets the log entry for this attack*/
	public getLog(values: PlayCardLog) {
		if (!this.props.log) return ""
		return this.props.log(values)
	}
}

export default Card
