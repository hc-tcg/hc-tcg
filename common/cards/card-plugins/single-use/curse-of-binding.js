import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class CurseOfBindingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_binding',
			name: 'Curse Of Binding',
			rarity: 'common',
			description: "Your opponent's active Hermit can not go AFK on their next turn.",
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {opponentPlayer} = pos

		opponentPlayer.hooks.blockedActions[instance] = (blockedActions) => {
			if (blockedActions.includes('CHANGE_ACTIVE_HERMIT')) {
				return blockedActions
			}

			// Make sure the other player has an active row
			if (opponentPlayer.board.activeRow !== null) {
				blockedActions.push('CHANGE_ACTIVE_HERMIT')
			}

			return blockedActions
		}

		opponentPlayer.hooks.onTurnEnd[instance] = () => {
			// Remove effects of card and clean up
			delete opponentPlayer.hooks.blockedActions[instance]
			delete opponentPlayer.hooks.onTurnEnd[instance]
		}
	}
}

export default CurseOfBindingSingleUseCard
