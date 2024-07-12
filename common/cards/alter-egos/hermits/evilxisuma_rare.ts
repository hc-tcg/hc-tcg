import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class EvilXisumaRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'evilxisuma_rare',
		numericId: 128,
		name: 'Evil X',
		rarity: 'rare',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		tokens: 4,
		type: 'balanced',
		health: 280,
		primary: {
			name: 'Evil Inside',
			cost: [],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Derpcoin',
			cost: ['balanced', 'balanced'],
			damage: 80,
			power:
				"Flip a coin.\nIf heads, choose one attack of your opponent's current active Hermit to disable on their next turn.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component)) return
			const attacker = attack.getAttacker()
			if (attack.type !== 'secondary' || !attacker) return

			const opponentActiveRow = getActiveRowPos(opponentPlayer)
			if (!opponentActiveRow) return
			if (opponentActiveRow.row.health <= 0) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] !== 'heads') return

			let playerPick: any = null

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'copyAttack',
					payload: {
						modalName: 'Evil X: Disable an attack for 1 turn',
						modalDescription: "Which of the opponent's attacks do you want to disable?",
						hermitCard: opponentActiveRow.row.hermitCard.toLocalCardInstance(),
					},
				},
				onResult(modalResult) {
					if (!modalResult || !modalResult.pick) return 'FAILURE_INVALID_DATA'

					playerPick = modalResult.pick

					return 'SUCCESS'
				},
				onTimeout() {
					// Disable the secondary attack if we didn't choose one
					playerPick = 'secondary'
				},
			})

			opponentPlayer.hooks.onTurnStart.add(component, () => {
				const disable = playerPick

				const activeRow = opponentPlayer.board.activeRow
				if (activeRow === null) return

				const actionToBlock = disable === 'primary' ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK'
				// This will add a blocked action for the duration of their turn
				game.addBlockedActions(this.props.id, actionToBlock)

				opponentPlayer.hooks.onTurnStart.remove(component)
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.afterAttack.remove(component)
	}
}

export default EvilXisumaRareHermitCard
