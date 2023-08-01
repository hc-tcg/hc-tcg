import {CardRarityT} from '../../types/cards'
import Card from './card'
import {PickRequirmentT} from '../../types/pick-process'
import {SlotTypeT} from 'common/types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'

export type SingleUseDefs = {
	id: string
	name: string
	rarity: CardRarityT
	description: string
	pickOn?: 'attack' | 'apply' | 'followup'
	pickReqs?: Array<PickRequirmentT>
}

class SingleUseCard extends Card {
	public description: string

	constructor(defs: SingleUseDefs) {
		super({
			type: 'single_use',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		this.description = defs.description
	}

	public override canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID' {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		return 'YES'
	}

	public override showSingleUseTooltip(): boolean {
		return true
	}

	/**
	 * Returns if card is attachable to slot type
	 */
	public override isAttachableToSlotType(slot: SlotTypeT): boolean {
		if (slot === 'single_use') return true
		return false
	}

	/**
	 * Returns whether this card has apply functionality or not
	 */
	public canApply(): boolean {
		// default is no
		return false
	}
}

export default SingleUseCard
