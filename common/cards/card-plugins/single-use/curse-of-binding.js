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
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('common/types/pick-process').PickedSlotsInfo} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {otherPlayer} = pos

		otherPlayer.hooks.blockedActions[instance] = (blockedActions) => {
			if (!blockedActions.includes('CHANGE_ACTIVE_HERMIT')) {
				blockedActions.push('CHANGE_ACTIVE_HERMIT')
			}
			return blockedActions
		}

		otherPlayer.hooks.turnEnd[instance] = () => {
			// Remove effects of card and clean up
			delete otherPlayer.hooks.blockedActions[instance]
			delete otherPlayer.hooks.turnEnd[instance]
		}
	}
}

export default CurseOfBindingSingleUseCard
