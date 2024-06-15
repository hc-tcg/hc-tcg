import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {SlotCondition, slot} from '../../../slot'
import {TurnActions} from '../../../types/game-state'
import {CanAttachResult} from '../../base/card'
import EffectCard from '../../base/effect-card'

class StringEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'string',
			numericId: 122,
			name: 'String',
			rarity: 'rare',
			description:
				"Attach to one of your opponent's empty item or effect slots.\nYour opponent can no longer attach cards to that slot.",
			log: (values) =>
				`$o{${values.opponent}|You}$ attached $eString$ to $p${values.pos.hermitCard}$`,
		})
	}

	public override canBeAttachedTo = slot.every(
		slot.opponent,
		slot.rowHasHermit,
		slot.empty,
		slot.some(slot.effectSlot, slot.itemSlot)
	)

	override getExpansion() {
		return 'alter_egos'
	}
}

export default StringEffectCard
