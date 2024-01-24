import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {TurnActions} from '../../../types/game-state'
import EffectCard from '../../base/effect-card'

class StringEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'string',
			numericId: 122,
			name: 'String',
			rarity: 'rare',
			description:
				"Place on one of your opponent's empty item or effect slots.\n\nOpponent can no longer place cards in that slot.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {opponentPlayer} = game

		// attach to effect or item slot
		if (pos.slot.type !== 'effect' && pos.slot.type !== 'item') return 'INVALID'

		// can only attach to opponent
		if (pos.player.id !== opponentPlayer.id) return 'INVALID'

		if (!pos.row?.hermitCard) return 'INVALID'

		const cardInfo = CARDS[pos.row.hermitCard.cardId]
		if (!cardInfo) return 'INVALID'
		if (!cardInfo.canAttachToCard(game, pos)) return 'NO'

		return 'YES'
	}

	// This card allows placing on either effect or item slot
	public override getActions(game: GameModel): TurnActions {
		const {opponentPlayer} = game

		// Is there is a hermit on the opponent's board with space for an item card
		const spaceForItem = opponentPlayer.board.rows.some((row) => {
			const hasHermit = !!row.hermitCard
			const hasEmptyItemSlot = row.itemCards.some((card) => card === null)
			return hasHermit && hasEmptyItemSlot
		})
		// Is there is a hermit on the opponent's board with space for an effect card
		const spaceForEffect = opponentPlayer.board.rows.some((row) => {
			return !!row.hermitCard && !row.effectCard
		})

		const actions: TurnActions = []
		if (spaceForItem) actions.push('PLAY_ITEM_CARD')
		if (spaceForEffect) actions.push('PLAY_EFFECT_CARD')
		return actions
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default StringEffectCard
