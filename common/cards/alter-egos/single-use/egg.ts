import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {PickInfo} from '../../../types/server-requests'
import {applySingleUse, getActiveRowPos, getNonEmptyRows} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import SingleUseCard from '../../base/single-use-card'

class EggSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'egg',
			numericId: 140,
			name: 'Egg',
			rarity: 'rare',
			description:
				"After your attack, choose one of your opponent's AFK Hermits to set as their active Hermit, and then flip a coin.\nIf heads, also do 10hp damage to that Hermit.",
			log: (values) => `${values.defaultLog} on $o${values.pick.name}$`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)

		const {opponentPlayer} = pos

		const inactiveHermits = getNonEmptyRows(opponentPlayer, true)
		if (inactiveHermits.length === 0) result.push('UNMET_CONDITION')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const targetKey = this.getInstanceKey(instance, 'target')

		player.hooks.getAttackRequests.add(instance, () => {
			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: "Pick one of your opponent's AFK Hermits",
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// Store the row index to use later
					player.custom[targetKey] = pickResult

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't pick a target so do nothing
				},
			})
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const pickInfo: PickInfo = player.custom[targetKey]
			if (!pickInfo || pickInfo.rowIndex === null || pickInfo.rowIndex == undefined) return
			const opponentRow = opponentPlayer.board.rows[pickInfo.rowIndex]
			if (!opponentRow.hermitCard) return

			applySingleUse(game, pickInfo)

			const coinFlip = flipCoin(player, {cardId: this.id, cardInstance: instance})
			if (coinFlip[0] === 'heads') {
				const eggAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: pickInfo.rowIndex,
						row: opponentRow,
					},
					log: (values) =>
						`$p{You|${values.player}}$ flipped $gheads$ on $eEgg$ and did an additional ${values.damage} to ${values.target}`,
					type: 'effect',
				}).addDamage(this.id, 10)

				attack.addNewAttack(eggAttack)
			}

			player.hooks.afterAttack.add(instance, () => {
				const pickInfo: PickInfo = player.custom[targetKey]
				if (!pickInfo.rowIndex) return
				game.changeActiveRow(opponentPlayer, pickInfo.rowIndex)

				delete player.custom[targetKey]

				player.hooks.afterAttack.remove(instance)
			})

			// Only do this once if there are multiple attacks
			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default EggSingleUseCard
