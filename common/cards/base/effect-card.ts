import Card from './card'
import {PlayCardLog, CardRarityT} from '../../types/cards'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {slot} from '../../slot'

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

	override _attachCondition = slot.every(
		slot.player,
		slot.effectSlot,
		slot.empty,
		slot.interactable,
		slot.rowHasHermit,
		(game, pos) => game.state.turn.availableActions.includes('PLAY_EFFECT_CARD')
	)

	public override showAttachTooltip() {
		return true
	}

	public override getFormattedDescription(): FormattedTextNode {
		return formatText(`*${this.description}*`)
	}
}

export default EffectCard
