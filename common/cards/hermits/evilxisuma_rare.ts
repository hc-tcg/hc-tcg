import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {getActiveRowPos} from '../../utils/board'
import {flipCoin} from '../../utils/coinFlips'
import HermitCard from '../base/hermit-card'

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
					"Flip a coin.\n\nIf heads, choose one of the opposing active Hermit's attacks to disable on their next turn.",
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const disableKey = this.getInstanceKey(instance, 'disable')

		player.hooks.onAttack.add(instance, (attack, pickedSlots) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] !== 'heads') return

			const opponentActiveRow = getActiveRowPos(opponentPlayer)
			if (!opponentActiveRow) return

			player.modalRequests.push({
				id: this.id,
				onResult(modalResult) {
					if (!modalResult || !modalResult.disable) return 'FAILURE_INVALID_DATA'

					player.custom[disableKey] = modalResult.disable

					return 'SUCCESS'
				},
				onTimeout() {
					// Disable the secondary attack if we didn't choose one
					player.custom[disableKey] = 'secondary'
				},
			})

			opponentPlayer.hooks.onTurnStart.add(instance, () => {
				const disable = player.custom[this.getInstanceKey(instance, 'disable')]
				if (!disable) return

				const activeRow = opponentPlayer.board.activeRow
				if (activeRow === null) return

				const actionToBlock = disable === 'primary' ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK'
				// This will add a blocked action for the duration of their turn
				game.addBlockedActions(actionToBlock)

				opponentPlayer.hooks.onTurnStart.remove(instance)
				delete player.custom[this.getInstanceKey(instance, 'disable')]
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
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
