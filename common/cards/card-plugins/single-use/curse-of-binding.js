import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

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
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos

		delete player.hooks.onApply[instance]
	}
}

export default CurseOfBindingSingleUseCard
