import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {AussiePing} from '../../../status-effects/aussie-ping'

class PearlescentMoonRare extends Card {
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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			game.components.new(StatusEffectComponent, AussiePing).apply(player.entity)
		})
	}
}

export default PearlescentMoonRare
