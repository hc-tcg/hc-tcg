import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import PoisonEffect from '../../../status-effects/poison'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class XisumavoidRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'xisumavoid_rare',
		numericId: 112,
		name: 'Xisuma',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'redstone',
		health: 280,
		primary: {
			name: 'Goodness Me',
			cost: ['redstone'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Cup of Tea',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power: "Flip a coin.\nIf heads, poison your opponent's active Hermit.",
		},
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'poison',
			},
		],
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] !== 'heads') return

			game.components
				.new(StatusEffectComponent, PoisonEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	}
}

export default XisumavoidRare
