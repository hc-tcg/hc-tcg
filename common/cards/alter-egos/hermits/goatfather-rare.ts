import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, RowComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {CardProps, Hermit} from '../../base/types'
import * as query from '../../../components/query'

class GoatfatherRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'goatfather_rare',
		numericId: 129,
		name: 'Goatfather',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'prankster',
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
	}

	public override onAttach(
		game: GameModel,
		component: CardComponent<CardProps>,
		observer: ObserverComponent
	): void {
		const {player, opponentPlayer} = component
		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			let coinFlip = flipCoin(player, component)[0]

			if (coinFlip !== 'heads') return

			let opponentActiveHermit = opponentPlayer.getActiveHermit()
			if (!opponentActiveHermit?.slot.inRow()) return

			attack.addDamage(component.entity, 30)

			game.components
				.filter(
					RowComponent,
					query.row.opponentPlayer,
					(_game, row) =>
						opponentActiveHermit !== null &&
						opponentActiveHermit.slot.inRow() &&
						row.index > opponentActiveHermit?.slot.row.index
				)
				.forEach((row) => {
					const newAttack = game.newAttack({
						attacker: component.entity,
						target: row.entity,
						type: 'secondary',
						log: (values) => `, ${values.target} for ${values.damage} damage`,
					})
					newAttack.addDamage(component.entity, 10)
					newAttack.shouldIgnoreCards.push(query.card.entity(component.entity))
					attack.addNewAttack(newAttack)
				})
		})
	}
}

export default GoatfatherRare
