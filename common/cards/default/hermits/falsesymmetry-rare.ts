import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const FalseSymmetryRare: Hermit = {
	...hermit,
	id: 'falsesymmetry_rare',
	numericId: 23,
	name: 'False',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	type: 'builder',
	health: 250,
	primary: {
		name: 'High Noon',
		cost: ['builder'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Supremacy',
		cost: ['builder', 'any'],
		damage: 70,
		power: 'Flip a coin.\nIf heads, heal this Hermit 40hp.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const coinFlip = flipCoin(player, component)[0]

			if (coinFlip === 'tails') return

			// Heal 40hp
			component.slot.inRow() && component.slot.row.heal(40)
			game.battleLog.addEntry(
				player.entity,
				`$p${component.props.name}$ healed $g40hp$`,
			)
		})
	},
}

export default FalseSymmetryRare
