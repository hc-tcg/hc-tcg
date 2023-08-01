import Card from './card'
import {CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardRarityT} from '../../types/cards'
import {PickRequirmentT} from '../../types/pick-process'
import {CardPosModel} from '../../models/card-pos-model'

type EffectDefs = {
	id: string
	name: string
	rarity: CardRarityT
	description: string
	pickOn?: 'attack' | 'apply' | 'followup'
	pickReqs?: Array<PickRequirmentT>
}

abstract class EffectCard extends Card {
	public description: string

	constructor(defs: EffectDefs) {
		super({
			type: 'effect',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		this.description = defs.description
	}

	public override canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID' {
		const {currentPlayer} = game

		// Wrong slot
		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		// Can't attach without hermit card - this is considered like the wrong slot
		if (!pos.row?.hermitCard) return 'INVALID'

		const cardInfo = CARDS[pos.row.hermitCard?.cardId]
		if (!cardInfo) return 'INVALID'
		if (!cardInfo.canAttachToCard(game, pos)) return 'NO'

		return 'YES'
	}

	public override showAttachTooltip() {
		return true
	}

	/**
	 * Returns if card is attachable to slot type
	 */
	public isAttachableToSlotType(slot): boolean {
		if (slot === 'effect') return true
		return false
	}

	/**
	 * Returns whether this card is removable from its position
	 */
	public getIsRemovable(): boolean {
		// default
		return true
	}
}

export default EffectCard
