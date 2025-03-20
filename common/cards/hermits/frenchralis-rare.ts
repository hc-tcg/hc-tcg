import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

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
		name: "Je M'appelle",
		cost: ['prankster'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Oh là là!',
		cost: ['prankster', 'prankster'],
		damage: 80,
		power:
			'Flip a coin for each life you have lost. Do an additional 40hp damage for every heads.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const coinFlip = flipCoin(game, player, component, 3 - player.lives)
				const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
				attack.addDamage(component.entity, headsAmount * 40)
			},
		)
	},
}

export default FrenchralisRare
