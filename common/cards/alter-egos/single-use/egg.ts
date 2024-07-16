import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Egg extends Card {
	pickCondition = query.every(
		slot.opponent,
		slot.hermitSlot,
		query.not(slot.activeRow),
		query.not(slot.empty)
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
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
		log: (values) => `${values.defaultLog} on $o${values.pick.name}$`,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player, opponentPlayer} = pos

		let afkHermitSlot: SlotComponent | null = null

		player.hooks.getAttackRequests.add(component, () => {
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

		player.hooks.onAttack.add(component, (attack) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			if (!afkHermitSlot || afkHermitSlot.rowIndex === null || afkHermitSlot.rowIndex == undefined)
				return
			const opponentRow = opponentPlayer.board.rows[afkHermitSlot.rowIndex]
			if (!opponentRow.hermitCard) return

			applySingleUse(game, afkHermitSlot)

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'heads') {
				const eggAttack = new AttackModel({
					id: this.getInstanceKey(component),
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

			player.hooks.afterAttack.add(component, () => {
				if (!afkHermitSlot || afkHermitSlot.rowIndex === null || afkHermitSlot.rowIndex === null)
					return
				game.changeActiveRow(opponentPlayer, afkHermitSlot.rowIndex)
				player.hooks.afterAttack.remove(component)
			})

			// Only do this once if there are multiple attacks
			player.hooks.onAttack.remove(component)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.getAttackRequests.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default Egg
