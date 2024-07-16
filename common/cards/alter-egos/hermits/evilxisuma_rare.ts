import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {card, query} from '../../../components/query'

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

	opponentActiveHermitQuery = query.every(card.opponentPlayer, card.active, card.isHermit)

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		player.hooks.blockedActions.add(component, (blockedActions) => {
			if (!game.components.exists(CardComponent, this.opponentActiveHermitQuery)) {
				blockedActions.push('SECONDARY_ATTACK')
			}
			return blockedActions
		})

		player.hooks.afterAttack.add(component, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] !== 'heads') return

			let playerPick: any = null

			let opponentActiveHermit = game.components.find(CardComponent, this.opponentActiveHermitQuery)
			if (!opponentActiveHermit) return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'copyAttack',
					payload: {
						modalName: 'Evil X: Disable an attack for 1 turn',
						modalDescription: "Which of the opponent's attacks do you want to disable?",
						hermitCard: opponentActiveHermit?.toLocalCardInstance(),
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

				const actionToBlock = disable === 'primary' ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK'
				// This will add a blocked action for the duration of their turn
				game.addBlockedActions(this.props.id, actionToBlock)

				opponentPlayer.hooks.onTurnStart.remove(component)
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.afterAttack.remove(component)
	}
}

export default EvilXisumaRareHermitCard
