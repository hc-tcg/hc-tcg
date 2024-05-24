import {HERMIT_CARDS} from '../..'
import {CardPosModel, getBasicCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRowPos} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class EvilXisumaRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'evilxisuma_rare',
			numericId: 128,
			name: 'Evil X',
			rarity: 'rare',
			hermitType: 'balanced',
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
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const disableKey = this.getInstanceKey(instance, 'disable')

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			const attacker = attack.getAttacker()
			if (attack.type !== 'secondary' || !attacker) return

			const opponentActiveRow = getActiveRowPos(opponentPlayer)
			if (!opponentActiveRow) return
			if (opponentActiveRow.row.health <= 0) return

			if (!HERMIT_CARDS[opponentActiveRow.row.hermitCard.cardId]) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] !== 'heads') return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'copyAttack',
					payload: {
						modalName: 'Evil X: Disable an attack for 1 turn',
						modalDescription: "Which of the opponent's attacks do you want to disable?",
						cardPos: getBasicCardPos(game, opponentActiveRow.row.hermitCard.cardInstance),
					},
				},
				onResult(modalResult) {
					if (!modalResult || !modalResult.pick) return 'FAILURE_INVALID_DATA'

					player.custom[disableKey] = modalResult.pick

					return 'SUCCESS'
				},
				onTimeout() {
					// Disable the secondary attack if we didn't choose one
					player.custom[disableKey] = 'secondary'
				},
			})

			opponentPlayer.hooks.onTurnStart.add(instance, () => {
				const disable = player.custom[disableKey]
				if (!disable) return

				const activeRow = opponentPlayer.board.activeRow
				if (activeRow === null) return

				const actionToBlock = disable === 'primary' ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK'
				// This will add a blocked action for the duration of their turn
				game.addBlockedActions(this.id, actionToBlock)

				opponentPlayer.hooks.onTurnStart.remove(instance)
				delete player.custom[disableKey]
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default EvilXisumaRareHermitCard
