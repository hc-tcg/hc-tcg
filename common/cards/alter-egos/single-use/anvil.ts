import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
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
		const targets = getTargetHermits(game, game.currentPlayer)
		if (targets.length === 0) return '$A0$'
		if (targets[0].index === game.currentPlayer.activeRow!.index) {
			return targets.length === 1
				? '$A30$'
				: `$A30$ + $A10$ x ${targets.length - 1}`
		}
		return `$A10$ x ${targets.length}`
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.getAttack, () => {
			const attack = getTargetHermits(game, player).reduce(
				(attacks: null | AttackModel, row) => {
					if (!row.getHermit()) return attacks

					const newAttack = game
						.newAttack({
							attacker: component.entity,
							player: player.entity,
							target: row.entity,
							type: 'effect',
							log:
								attacks === null
									? (values) =>
											`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`
									: (values) =>
											`, ${values.target} for ${values.damage} damage`,
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
			if (attack === null) {
				// No valid targets
				game.battleLog.addEntry(
					component.player.entity,
					`$p{You|${component.player.playerName}}$ used $eAnvil$ and missed`,
				)
				applySingleUse(game)
			}
			return attack
		})

		observer.subscribeWithPriority(
			player.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (attack.isAttacker(component.entity)) {
					applySingleUse(game, component.slot)
					observer.unsubscribe(player.hooks.beforeAttack)
				}
			},
		)
	},
}

export default Anvil
