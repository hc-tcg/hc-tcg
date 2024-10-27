import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'

const Wolf: Attach = {
	...attach,
	id: 'wolf',
	numericId: 108,
	name: 'Wolf',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	description:
		"Attach to your active Hermit.\nIf any of your Hermits take damage on your opponent's turn, your opponent's active Hermit takes 20hp damage for each Wolf card you have on the game board.",
	attachCondition: query.every(attach.attachCondition, query.slot.active),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component
		let activated = false

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			// Allow another activation this turn
			activated = false
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			(attack) => {
				if (attack.isType('status-effect') || attack.isBacklash) return
				// Only on opponents turn
				if (game.currentPlayerEntity !== opponentPlayer.entity) return

				// Make sure they are targeting this player
				if (attack.player !== opponentPlayer) return
				if (attack.target?.player.entity !== player.entity) return

				// Make sure the attack is doing some damage
				if (attack.calculateDamage() <= 0) return

				if (activated) return
				activated = true

				const backlashAttack = game
					.newAttack({
						attacker: component.entity,
						target: opponentPlayer.activeRowEntity,
						type: 'effect',
						isBacklash: true,
						log: (values) =>
							`${values.target} took ${values.damage} damage from $eWolf$`,
					})
					.addDamage(component.entity, 20)

				attack.addNewAttack(backlashAttack)
			},
		)
	},
}

export default Wolf
