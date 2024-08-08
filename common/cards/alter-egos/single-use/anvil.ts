import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

function getTargetHermits(game: GameModel, player: PlayerComponent) {
	return game.components.filter(
		RowComponent,
		query.row.opponentPlayer,
		query.row.hermitSlotOccupied,
		(_game, row) =>
			player.activeRow !== null && row.index >= player.activeRow?.index,
	)
}
const Anvil: SingleUse = {
	...singleUse,
	id: 'anvil',
	numericId: 138,
	name: 'Anvil',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 0,
	description:
		'Do 30hp damage to the Hermit directly opposite your active Hermit on the game board, and 10hp damage to each Hermit below it.',
	hasAttack: true,
	attackPreview: (game) => {
		const targetAmount = getTargetHermits(game, game.currentPlayer).length - 1
		if (targetAmount === 0) return '$A30$'
		return `$A30$ + $A10$ x ${targetAmount}`
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.getAttack, () => {
			return getTargetHermits(game, player).reduce(
				(attacks: null | AttackModel, row) => {
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
						.addDamage(
							component.entity,
							row.index === player.activeRow?.index ? 30 : 10,
						)
					if (attacks === null) {
						return newAttack
					} else {
						attacks.addNewAttack(newAttack)
						return attacks
					}
				},
				null,
			)
		})

		observer.subscribe(player.hooks.afterAttack, (_attack) => {
			applySingleUse(game, component.slot)
		})
	},
}

export default Anvil
