import {CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import EffectCard from '../base/effect-card'

class StringEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'string',
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

		const cardInfo = CARDS[pos.row.hermitCard?.cardId]
		if (!cardInfo) return 'INVALID'
		if (!cardInfo.canAttachToCard(game, pos)) return 'NO'

		return 'YES'
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default StringEffectCard
