import Card from './card'
import {CARDS} from '..'
import {CardRarityT, EnergyT, HermitTypeT, SlotTypeT} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'

type ItemDefs = {
	id: string
	name: string
	rarity: CardRarityT
	hermitType: HermitTypeT
}

abstract class ItemCard extends Card {
	public hermitType: HermitTypeT

	constructor(defs: ItemDefs) {
		super({
			type: 'item',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.hermitType = defs.hermitType
	}

	/**
	 * Returns if card is attachable to slot type
	 */
	public isAttachableToSlotType(slot: SlotTypeT): boolean {
		if (slot === 'hermit') return true
		return false
	}

	public override canAttach(game: GameModel, pos: CardPosModel) {
		const {currentPlayer} = game

		if (pos.slot.type !== 'item') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		// Can't attach without hermit
		if (!pos.row?.hermitCard) return 'NO'

		const cardInfo = CARDS[pos.row.hermitCard?.cardId]
		if (!cardInfo) return 'INVALID'
		if (!cardInfo.canAttachToCard(game, pos)) return 'NO'

		return 'YES'
	}

	public abstract getEnergy(game: GameModel, instance: string, pos: CardPosModel): Array<EnergyT>
}

export default ItemCard
