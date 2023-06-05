import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class CurseOfBindingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_binding',
			name: 'Curse Of Binding',
			rarity: 'common',
			description:
				'Opposing active Hermit can not go AFK on the following turn.\n\nDiscard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/pick-process').PickedSlotsInfo} pickedSlots
	 */
	onApply(game, instance, pickedSlots) {
		const {opponentPlayer} = game.ds

		opponentPlayer.hooks.blockedActions[instance] = (blockedActions) => {
			if (!blockedActions.includes('CHANGE_ACTIVE_HERMIT')) {
				blockedActions.push('CHANGE_ACTIVE_HERMIT')
			}
			return blockedActions
		}
		opponentPlayer.hooks.turnEnd[instance] = () => {
			// Remove effects of card and clean up
			delete opponentPlayer.hooks.blockedActions[instance]
			delete opponentPlayer.hooks.turnEnd[instance]
		}
	}
}

export default CurseOfBindingSingleUseCard
