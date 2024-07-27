import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, PlayerComponent, RowComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {AttackModel} from '../../../models/attack-model'
import {row} from '../../../components/query'

class Anvil extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'anvil',
		numericId: 138,
		name: 'Anvil',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		description:
			'Do 30hp damage to the Hermit card directly opposite your active Hermit on the game board and 10hp damage to each Hermit below it.',
		hasAttack: true,
		attackPreview: (game) => `30 + 10 x ${this.getTargetHermis(game, game.currentPlayer).length}`,
	}

	getTargetHermis(game: GameModel, player: PlayerComponent) {
		return game.components.filter(
			RowComponent,
			row.opponentPlayer,
			(_game, row) => player.activeRow !== null && row.index >= player.activeRow?.index
		)
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.getAttack, () => {
			return game.components
				.filter(
					RowComponent,
					row.opponentPlayer,
					(_game, row) => player.activeRow !== null && row.index >= player.activeRow?.index
				)
				.reduce((attacks: null | AttackModel, row) => {
					if (!row.getHermit()) return attacks

					const newAttack = game
						.newAttack({
							attacker: component.entity,
							target: row.entity,
							type: 'effect',
							log: (values) =>
								row.index === player.activeRow?.index
									? `${values.defaultLog} to attack ${values.target} for ${values.damage} damage`
									: `, ${values.target} for ${values.damage} damage`,
						})
						.addDamage(component.entity, row.index === player.activeRow?.index ? 30 : 10)
					if (attacks === null) {
						return newAttack
					} else {
						attacks.addNewAttack(newAttack)
						return attacks
					}
				}, null)
		})

		observer.subscribe(player.hooks.afterAttack, (_attack) => {
			applySingleUse(game, component.slot)
		})
	}
}

export default Anvil
