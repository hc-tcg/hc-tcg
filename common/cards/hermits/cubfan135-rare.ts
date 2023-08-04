import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import HermitCard from '../base/hermit-card'

class Cubfan135RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'cubfan135_rare',
			name: 'Cub',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 260,
			primary: {
				name: 'Dash',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: "Let's Go",
				cost: ['speedrunner', 'speedrunner', 'speedrunner'],
				damage: 100,
				power: 'After attack, you can choose to go AFK.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			// We used our secondary attack, activate power
			player.custom[instanceKey] = true
		})

		player.hooks.availableActions.add(instance, (availableActions) => {
			if (player.custom[instanceKey]) {
				// Only activate if we have other hermit and we haven't already switched
				const hasOtherHermit = player.board.rows.some((row, index) => {
					return row.hermitCard && index !== player.board.activeRow
				})
				const {completedActions} = game.state.turn

				//@TODO do we also need tocheck for end_turn here?
				if (
					hasOtherHermit &&
					!completedActions.includes('CHANGE_ACTIVE_HERMIT') &&
					!availableActions.includes('CHANGE_ACTIVE_HERMIT')
				) {
					availableActions.push('CHANGE_ACTIVE_HERMIT')
				}
			}

			return availableActions
		})

		player.hooks.onTurnEnd.add(instance, () => {
			// Cleanup
			delete player.custom[instanceKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		// Remove all hooks and flags
		player.hooks.onAttack.remove(instance)
		player.hooks.availableActions.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		delete player.custom[instanceKey]
	}
}

export default Cubfan135RareHermitCard
