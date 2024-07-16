import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class Cubfan135Rare extends Card {
	props: Hermit = {
		...hermit,
		id: 'cubfan135_rare',
		numericId: 10,
		name: 'Cub',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'speedrunner',
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
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.afterAttack.add(component, (attack) => {
			if (!attack.isTargetting(component) || attack.type !== 'secondary') return

			// We used our secondary attack, activate power
			// AKA remove change active hermit from blocked actions
			game.removeCompletedActions('CHANGE_ACTIVE_HERMIT')
			game.removeBlockedActions('game', 'CHANGE_ACTIVE_HERMIT')
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.afterAttack.remove(component)
	}
}

export default Cubfan135Rare
