import {CardComponent, ObserverComponent, RowComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const GoatfatherRare: Hermit = {
	...hermit,
	id: 'goatfather_rare',
	numericId: 101,
	name: 'Goatfather',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	type: ['prankster'],
	health: 270,
	primary: {
		name: 'Omerta',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Anvil Drop',
		cost: ['prankster', 'prankster'],
		damage: 80,
		power:
			"Flip a coin.\nIf heads, do an additional 30hp damage to your opponent's active Hermit and 10hp damage to each Hermit below it on the game board.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player, opponentPlayer} = component
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.ADD_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				let coinFlip = flipCoin(game, player, component)[0]

				if (coinFlip !== 'heads') return

				let opponentActiveHermit = opponentPlayer.getActiveHermit()
				if (!opponentActiveHermit?.slot.inRow()) return

				attack.addDamage(component.entity, 30)

				game.components
					.filter(
						RowComponent,
						query.row.opponentPlayer,
						query.row.hasHermit,
						(_game, row) =>
							opponentActiveHermit !== null &&
							opponentActiveHermit.slot.inRow() &&
							row.index > opponentActiveHermit.slot.row.index,
					)
					.sort((a, b) => a.index - b.index)
					.forEach((row) => {
						const newAttack = game.newAttack({
							attacker: component.entity,
							target: row.entity,
							type: 'secondary',
							log: (values) => `, ${values.target} for ${values.damage} damage`,
						})
						newAttack.addDamage(component.entity, 10)
						newAttack.shouldIgnoreCards.push(
							query.card.entity(component.entity),
						)
						attack.addNewAttack(newAttack)
					})
			},
		)
	},
}

export default GoatfatherRare
