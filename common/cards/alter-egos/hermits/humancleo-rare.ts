import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {flipCoin} from '../../../utils/coinFlips'
import {getActiveRow} from '../../../utils/board'
import {hasEnoughEnergy} from '../../../utils/attacks'
import {slot} from '../../../slot'
import Card, {Hermit, hermit} from '../../base/card'
import {CardInstance, RowStateWithHermit} from '../../../types/game-state'
import {SlotInfo} from '../../../types/cards'

class HumanCleoRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'humancleo_rare',
		numericId: 132,
		name: 'Human Cleo',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'pvp',
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
				'Flip a coin twice.\nIf both are heads, your opponent must attack one of their own AFK Hermits on their next turn. Your opponent must have the necessary item cards attached to execute an attack.',
		},
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		let pickedAfkHermit: SlotInfo | null = null

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== instanceKey || attack.type !== 'secondary' || !attacker) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard, 2)

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			const pickCondition = slot.every(
				slot.player,
				slot.not(slot.activeRow),
				slot.not(slot.empty),
				slot.hermitSlot
			)

			const blockActions = () => {
				// Start by removing blocked actions in case requirements are no longer met
				game.removeBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')

				// Return if the opponent has no AFK Hermits to attack
				if (!game.someSlotFulfills(pickCondition)) return

				const opponentActiveRow = getActiveRow(opponentPlayer)
				if (!opponentActiveRow) return

				const energy = opponentActiveRow.itemCards.flatMap((item) => {
					if (item) return item.props.type
					return []
				})

				// Return if no energy
				if (
					!opponentActiveRow.hermitCard.isHermit() ||
					(!hasEnoughEnergy(energy, opponentActiveRow.hermitCard.props.primary.cost) &&
						!hasEnoughEnergy(energy, opponentActiveRow.hermitCard.props.secondary.cost))
				) {
					return
				}

				// Don't prevent change hermit if opponent is blocked from attacking for other reason
				if (game.isActionBlocked('PRIMARY_ATTACK') && game.isActionBlocked('SECONDARY_ATTACK')) {
					return
				}

				// The opponent needs to attack in this case, so prevent them switching or ending turn
				game.addBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')
			}

			opponentPlayer.hooks.onTurnStart.add(instance, blockActions)
			opponentPlayer.hooks.onAttach.add(instance, blockActions)
			opponentPlayer.hooks.onDetach.add(instance, blockActions)

			// Add a pick request for opponent to pick an afk hermit to attack
			opponentPlayer.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
				// Only pick if there is afk to pick
				if (!game.someSlotFulfills(pickCondition)) return

				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: this.props.id,
					message: 'Pick one of your AFK Hermits',
					canPick: pickCondition,
					onResult(pickedSlot) {
						const rowIndex = pickedSlot.rowIndex
						if (!pickedSlot.card || !rowIndex === null) return

						// Remove the hook straight away
						opponentPlayer.hooks.getAttackRequests.remove(instance)
						// Save the target index for opponent to attack
						pickedAfkHermit = pickedSlot
					},
					onTimeout() {
						// Remove the hook straight away
						opponentPlayer.hooks.getAttackRequests.remove(instance)
						const firstAfk = game.filterSlots(pickCondition)[0]
						if (!firstAfk) return
						pickedAfkHermit = firstAfk
					},
				})
			})

			opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
				if (!attack.isType('primary', 'secondary')) return

				// Immediately remove the hook
				opponentPlayer.hooks.beforeAttack.remove(instance)

				if (
					pickedAfkHermit !== null &&
					pickedAfkHermit.card &&
					pickedAfkHermit.row &&
					pickedAfkHermit.rowIndex !== null
				) {
					attack.setTarget(this.props.id, {
						player: opponentPlayer,
						rowIndex: pickedAfkHermit.rowIndex,
						// This cast is safe because we verified in the if statement that the hermit card in the row exists.
						row: pickedAfkHermit.row as RowStateWithHermit,
					})
				}

				// They attacked now, they can end turn or change hermits with Chorus Fruit
				game.removeBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				opponentPlayer.hooks.onTurnStart.remove(instance)
				opponentPlayer.hooks.onAttach.remove(instance)
				opponentPlayer.hooks.onDetach.remove(instance)
				opponentPlayer.hooks.getAttackRequests.remove(instance)
				opponentPlayer.hooks.beforeAttack.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		// Remove hooks
		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.onAttach.remove(instance)
		opponentPlayer.hooks.onDetach.remove(instance)
		opponentPlayer.hooks.getAttackRequests.remove(instance)
		opponentPlayer.hooks.beforeAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
	}
}

export default HumanCleoRareHermitCard
