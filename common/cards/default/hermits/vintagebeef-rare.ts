import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent} from '../../../components'

class VintageBeefRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'vintagebeef_rare',
		numericId: 103,
		name: 'Beef',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'builder',
		health: 290,
		primary: {
			name: 'Pojk',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Beefy Tunes',
			cost: ['builder', 'builder'],
			damage: 80,
			power:
				'Flip a coin.\nIf heads, all status effects are removed from your active and AFK Hermits.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary' || !attacker)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] !== 'heads') return

			player.board.rows.forEach((row) => {
				if (!row.hermitCard) return

				const statusEffectsToRemove = game.state.statusEffects.filterEntities((ail) => {
					return ail.targetInstance.component === row.hermitCard.component
				})

				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail)
				})
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default VintageBeefRare
