import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import RoyalProtectionEffect from '../../../status-effects/royal-protection'

class PrincessGemRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'princessgem_rare',
		numericId: 168,
		name: 'Princess Gem',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		type: 'speedrunner',
		health: 270,
		primary: {
			name: 'Sunny Days',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Empire',
			cost: ['speedrunner', 'speedrunner', 'any'],
			damage: 90,
			power:
				"On opponent's next turn, any attack from King Joel or Grand Architect does no damage. Does not include status or effect cards.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			game.components.new(StatusEffectComponent, RoyalProtectionEffect).apply(component.entity)
		})
	}
}

export default PrincessGemRare
