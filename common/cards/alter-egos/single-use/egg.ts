import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {SlotComponent} from '../../../types/cards'
import {CardComponent} from '../../../types/game-state'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import Card, {SingleUse, singleUse} from '../../base/card'

class EggSingleUseCard extends Card {
	pickCondition = slot.every(
		slot.opponent,
		slot.hermitSlot,
		slot.not(slot.activeRow),
		slot.not(slot.empty)
	)

	props: SingleUse = {
		...singleUse,
		id: 'egg',
		numericId: 140,
		name: 'Egg',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		description:
			"After your attack, choose one of your opponent's AFK Hermits to set as their active Hermit, and then flip a coin.\nIf heads, also do 10hp damage to that Hermit.",
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.pickCondition)
		),
		log: (values) => `${values.defaultLog} on $o${values.pick.name}$`,
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		let afkHermitSlot: SlotComponent | null = null

		player.hooks.getAttackRequests.add(instance, () => {
			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: "Pick one of your opponent's AFK Hermits",
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					afkHermitSlot = pickedSlot
				},
				onTimeout() {
					// We didn't pick a target so do nothing
				},
			})
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			if (!afkHermitSlot || afkHermitSlot.rowIndex === null || afkHermitSlot.rowIndex == undefined)
				return
			const opponentRow = opponentPlayer.board.rows[afkHermitSlot.rowIndex]
			if (!opponentRow.hermitCard) return

			applySingleUse(game, afkHermitSlot)

			const coinFlip = flipCoin(player, instance)
			if (coinFlip[0] === 'heads') {
				const eggAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: afkHermitSlot.rowIndex,
						row: opponentRow,
					},
					log: (values) =>
						`$p{You|${values.player}}$ flipped $gheads$ on $eEgg$ and did an additional ${values.damage} to ${values.target}`,
					type: 'effect',
				}).addDamage(this.props.id, 10)

				attack.addNewAttack(eggAttack)
			}

			player.hooks.afterAttack.add(instance, () => {
				if (!afkHermitSlot || afkHermitSlot.rowIndex === null || afkHermitSlot.rowIndex === null)
					return
				game.changeActiveRow(opponentPlayer, afkHermitSlot.rowIndex)
				player.hooks.afterAttack.remove(instance)
			})

			// Only do this once if there are multiple attacks
			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos

		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onAttack.remove(instance)
	}
}

export default EggSingleUseCard
