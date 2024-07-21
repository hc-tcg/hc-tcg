import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {TrapHoleEffect} from '../../../status-effects/trap-hole'

class HelsknightRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'helsknight_rare',
		numericId: 130,
		name: 'Helsknight',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'pvp',
		health: 270,
		primary: {
			name: 'Pitiful',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Trap Hole',
			cost: ['pvp', 'pvp', 'pvp'],
			damage: 100,
			power:
				'If your opponent uses a single use effect card on their next turn, flip a coin.\nIf heads, you take that card after its effect is applied and add it to your hand.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			game.components.new(StatusEffectComponent, TrapHoleEffect).apply(component.entity)
		})
	}
}

export default HelsknightRare
