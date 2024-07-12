import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {applyStatusEffect} from '../../../utils/board'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class BdoubleO100RareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'bdoubleo100_rare',
		numericId: 1,
		name: 'Bdubs',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'balanced',
		health: 260,
		primary: {
			name: 'Retexture',
			cost: ['any'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Shreep',
			cost: ['balanced', 'balanced', 'any'],
			damage: 0,
			power:
				'This Hermit restores all HP, then sleeps for the rest of this turn, and the following two turns, before waking up.',
		},
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'sleeping',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (!attacker) return
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const row = getActiveRow(player)

			if (!row) return

			// Add new sleeping statusEffect
			applyStatusEffect(game, 'sleeping', row.hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default BdoubleO100RareHermitCard
