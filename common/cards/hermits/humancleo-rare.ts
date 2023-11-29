import HermitCard from '../base/hermit-card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {flipCoin} from '../../utils/coinFlips'
import {getNonEmptyRows} from '../../utils/board'
import {createWeaknessAttack} from '../../utils/attacks'

class HumanCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'humancleo_rare',
			numericId: 132,
			name: 'Human Cleo',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Humanity',
				cost: ['pvp'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Betrayed',
				cost: ['pvp', 'pvp'],
				damage: 70,
				power:
					'Flip a coin, twice. If both are heads, your opponent must attack one of their own AFK Hermits on their next turn. Opponent must have necessary item cards attached to execute an attack.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)
		const opponentTargetKey = this.getInstanceKey(instance, 'opponentTarget')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id, 2)

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			opponentPlayer.hooks.onTurnStart.add(instance, () => {
				// The opponent needs to attack, so prevent them switching or ending turn
				game.addBlockedActions('CHANGE_ACTIVE_HERMIT', 'END_TURN')

				opponentPlayer.hooks.onTurnStart.remove(instance)
			})

			// Add a pick request for opponent to pick an afk hermit to attack
			opponentPlayer.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
				// Only pick if there is afk to pick
				const afk = getNonEmptyRows(opponentPlayer, false).length
				if (afk < 1) return

				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: this.id,
					message: 'Pick one of your AFK Hermits',
					onResult(pickResult) {
						if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'

						const rowIndex = pickResult.rowIndex
						if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
						if (rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

						if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
						if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

						// Save the target index for opponent to attack
						player.custom[opponentTargetKey] = rowIndex

						return 'SUCCESS'
					},
					onTimeout() {
						// Pick the first afk hermit to attack
						const firstAfk = getNonEmptyRows(opponentPlayer, false)[0]
						if (!firstAfk) return

						// Save the target index for opponent to attack
						player.custom[opponentTargetKey] = firstAfk.rowIndex
					},
				})

				// Remove the hook straight away
				opponentPlayer.hooks.getAttackRequests.remove(instance)
			})

			opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
				if (!attack.isType('primary', 'secondary')) return

				// Immediately remove the hook
				opponentPlayer.hooks.beforeAttack.remove(instance)

				const opponentTarget: number = player.custom[opponentTargetKey]
				if (opponentTarget !== undefined) {
					delete player.custom[opponentTargetKey]

					const targetRow = opponentPlayer.board.rows[opponentTarget]
					if (targetRow && targetRow.hermitCard) {
						attack.target = {
							player: opponentPlayer,
							rowIndex: opponentTarget,
							row: targetRow,
						}

						const weaknessAttack = createWeaknessAttack(attack)
						if (weaknessAttack) attack.addNewAttack(weaknessAttack)
					}
				}

				// They attacked now, they can end turn
				game.removeBlockedActions('END_TURN')
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				// Make sure the target is always deleted
				delete player.custom[opponentTargetKey]
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		// Remove hooks
		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.getAttackRequests.remove(instance)
		opponentPlayer.hooks.beforeAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[this.getInstanceKey(instance, 'opponentTarget')]
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

export default HumanCleoRareHermitCard
