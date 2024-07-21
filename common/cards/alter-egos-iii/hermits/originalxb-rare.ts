import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import OriginalXBEffect from '../../../status-effects/original-xb'

class OriginalXBRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'originalxb_rare',
		numericId: 164,
		name: 'Original XB',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			game.components.new(StatusEffectComponent, OriginalXBEffect).apply(opponentPlayer.entity)
		})
	}
}

export default OriginalXBRare
