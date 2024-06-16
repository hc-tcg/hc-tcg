import Card, {CanAttachResult} from './card'
import {CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {PlayCardLog, CardRarityT} from '../../types/cards'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {SlotCondition, slot} from '../../slot'

type EffectDefs = {
	id: string
	numericId: number
	name: string
	rarity: CardRarityT
	description: string
	log?: ((values: PlayCardLog) => string) | null
}

abstract class EffectCard extends Card {
	public description: string

	constructor(defs: EffectDefs) {
		super({
			type: 'effect',
			id: defs.id,
			numericId: defs.numericId,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.description = defs.description

		this.updateLog((values) => {
			if (defs.log) return defs.log(values)
			return `$p{You|${values.player}}$ attached $e${values.pos.name}$ to $p${values.pos.hermitCard}$`
		})
	}

	override _attachCondition = slot.every(slot.effectSlot, slot.rowHasHermit, slot.player)

	public override showAttachTooltip() {
		return true
	}

	// @TODO replace with canDetach hook, need a standardized way to attach and detach things
	// All cards that check for canAttach now eventually need to check canDetach too.
	/**
	 * Returns whether this card is removable from its position
	 */
	public getIsRemovable(): boolean {
		// default
		return true
	}

	public override getFormattedDescription(): FormattedTextNode {
		return formatText(`*${this.description}*`)
	}
}

export default EffectCard
