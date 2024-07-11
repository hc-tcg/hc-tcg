import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {applyStatusEffect} from '../../../utils/board'
import Card, {Hermit, hermit} from '../../base/card'

class PearlescentMoonRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'pearlescentmoon_rare',
		numericId: 85,
		name: 'Pearl',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'terraform',
		health: 300,
		primary: {
			name: 'Cleaning Lady',
			cost: ['terraform'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Aussie Ping',
			cost: ['terraform', 'any'],
			damage: 70,
			power:
				'If your opponent attacks on their next turn, flip a coin.\nIf heads, their attack misses. Your opponent can not miss due to this ability on consecutive turns.',
		},
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'missed',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary' || !attacker)
				return
			applyStatusEffect(game, 'aussie-ping', attack.getTarget()?.row.hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onAttack.remove(component)
	}
}

export default PearlescentMoonRareHermitCard
