import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const FrenchralisRare: Hermit = {
	...hermit,
	id: 'frenchkeralis_rare',
	numericId: 155,
	name: 'Frenchralis',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 3,
	type: 'prankster',
	health: 250,
	primary: {
		name: 'French.',
		cost: ['prankster'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Oh là là!',
		cost: ['prankster', 'prankster'],
		damage: 80,
		power: 'If you have one life remaining, this attack does double damage.',
	},
	onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			if (player.lives === 1) attack.multiplyDamage(component.entity, 2)
		})
	},
}

export default FrenchralisRare
