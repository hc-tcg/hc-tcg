import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import HermitCard from '../../base/hermit-card'

class Cubfan135RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'cubfan135_rare',
			numericId: 10,
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

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			// We used our secondary attack, activate power
			// AKA remove change active hermit from blocked actions
			game.removeBlockedActions('game', 'CHANGE_ACTIVE_HERMIT')
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
	}
}

export default Cubfan135RareHermitCard
