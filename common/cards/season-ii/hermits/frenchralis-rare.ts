import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class FrenchralisRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'frenchralis_rare',
		numericId: 155,
		name: 'Frenchralis',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		type: 'prankster',
		health: 250,
		primary: {
			name: "Je M'appelle Keralis",
			cost: ['prankster'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Oh là là!',
			cost: ['prankster', 'prankster'],
			damage: 80,
			power: 'If you have 1 life remaining, this attack does double damage.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			if (player.lives === 1) attack.multiplyDamage(component.entity, 2)
		})
	}
}

export default FrenchralisRare
