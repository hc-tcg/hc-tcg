import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class OriginalXBRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'original_xb_rare',
		numericId: 164,
		name: 'Original XB',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		type: 'miner',
		health: 270,
		primary: {
			name: "Slabs 'n Stairs!",
			cost: ['miner'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Get good',
			cost: ['miner', 'miner', 'any'],
			damage: 90,
			power: 'Opponent must draw an additional card from their deck on their next turn.',
		},
	}

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			observer.oneShot(opponentPlayer.hooks.onTurnEnd, () => {
				opponentPlayer.draw(1)
			})
		})
	}
}

export default OriginalXBRare
