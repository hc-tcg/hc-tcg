import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const LlamadadRare: Hermit = {
	...hermit,
	id: 'llamadad_rare',
	numericId: 134,
	name: 'Llamadad',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	type: 'balanced',
	health: 290,
	primary: {
		name: 'Spitz',
		cost: ['balanced'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Matilda',
		cost: ['balanced', 'balanced'],
		damage: 80,
		power: 'Flip a coin.\nIf heads, do an additional 40hp damage.',
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

				const coinFlip = flipCoin(game, player, component)
				if (coinFlip[0] === 'heads') {
					attack.addDamage(component.entity, 40)
				}
			},
		)
	},
}

export default LlamadadRare
