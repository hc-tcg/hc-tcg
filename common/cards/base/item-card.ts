import Card, {CanAttachResult} from './card'
import {PlayCardLog, CardRarityT, EnergyT, HermitTypeT} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {HERMIT_CARDS} from '..'

type ItemDefs = {
	id: string
	numericId: number
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
			numericId: defs.numericId,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.hermitType = defs.hermitType

		this.updateLog(
			(values) =>
				`$p{You|${values.player}}$ attached $m${values.pos.name}$ to $p${values.pos.hermitCard}$`
		)
	}

	public override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const {currentPlayer} = game

		const result: CanAttachResult = []

		if (pos.slot.type !== 'item') result.push('INVALID_SLOT')
		if (pos.player.id !== currentPlayer.id) result.push('INVALID_PLAYER')

		// Can't attach without hermit - this does not show the unmet condition modal
		if (!pos.row?.hermitCard) result.push('UNMET_CONDITION_SILENT')

		return result
	}

	public override getActions(game: GameModel): TurnActions {
		const {currentPlayer} = game

		// Is there is a hermit on the board with space for an item card
		const spaceForItem = currentPlayer.board.rows.some((row) => {
			const hasHermit = !!row.hermitCard
			const hasEmptyItemSlot = row.itemCards.some((card) => card === null)
			return hasHermit && hasEmptyItemSlot
		})

		return spaceForItem ? ['PLAY_ITEM_CARD'] : []
	}

	public override getFormattedDescription(): FormattedTextNode {
		return this.rarity === 'rare' ? formatText('*Counts as 2 Item cards.*') : formatText('')
	}

	public abstract getEnergy(game: GameModel, instance: string, pos: CardPosModel): Array<EnergyT>
}

export default ItemCard
