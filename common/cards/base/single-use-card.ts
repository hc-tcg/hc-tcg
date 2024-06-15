import {PlayCardLog, CardRarityT} from '../../types/cards'
import Card, {CanAttachResult} from './card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {SlotCondition, slot} from '../../slot'

export type SingleUseDefs = {
	id: string
	numericId: number
	name: string
	rarity: CardRarityT
	description: string
	log?: ((values: PlayCardLog) => string) | null
}

class SingleUseCard extends Card {
	public description: string
	public override attachCondition = slot.every(slot.singleUseSlot, slot.playerHasActiveHermit)

	constructor(defs: SingleUseDefs) {
		super({
			type: 'single_use',
			id: defs.id,
			numericId: defs.numericId,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.description = defs.description
		if (defs.log !== null)
			this.updateLog((values) => {
				if (defs.log === undefined) return values.defaultLog
				if (defs.log === null) return ''
				return defs.log(values)
			})
	}

	public override showSingleUseTooltip(): boolean {
		return true
	}

	/**
	 * Returns whether this card has apply functionality or not
	 */
	public canApply(): boolean {
		// default is no
		return false
	}

	/**
	 * Returns whether you can attack with this card alone or not
	 */
	public canAttack(): boolean {
		// default is no
		return false
	}

	public override getFormattedDescription(): FormattedTextNode {
		return formatText(`*${this.description}*`)
	}
}

export default SingleUseCard
