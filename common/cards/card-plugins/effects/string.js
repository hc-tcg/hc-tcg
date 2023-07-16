import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {CARDS} from '..'

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

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
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

	getExpansion() {
		return 'alter_egos'
	}
}

export default StringEffectCard
