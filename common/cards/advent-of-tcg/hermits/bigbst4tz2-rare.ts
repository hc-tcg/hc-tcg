import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {AttackModel} from '../../../models/attack-model'
import {executeAttacks} from '../../../utils/attacks'
import {getActiveRow} from '../../../utils/board'
import {RowPos} from '../../../types/cards'
import Card, {Hermit, hermit} from '../../base/card'
import {CardComponent} from '../../../types/game-state'

class BigBSt4tzRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'bigbst4tz2_rare',
		numericId: 207,
		name: 'BigB',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		type: 'speedrunner',
		health: 270,
		primary: {
			name: 'Terry',
			cost: ['speedrunner'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Soulmate',
			cost: ['speedrunner', 'speedrunner'],
			damage: 80,
			power: "When BigB is knocked out, deal 140 damage to the opponent's active Hermit.",
		},
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer, rowId: row} = pos

		let dealDamageNextTurn = false

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return
			dealDamageNextTurn = true
		})

		// Add before so health can be checked reliably
		opponentPlayer.hooks.afterAttack.addBefore(instance, () => {
			if (dealDamageNextTurn) {
				if (!row || row.health === null || row.health > 0) return

				const activeRowIndex = player.board.activeRow
				const opponentActiveRowIndex = opponentPlayer.board.activeRow

				const activeRow = getActiveRow(player)
				const opponentActiveRow = getActiveRow(opponentPlayer)
				if (activeRowIndex === null || opponentActiveRowIndex === null) return
				if (!activeRow || !opponentActiveRow) return

				const sourceRow: RowPos = {
					player: player,
					rowIndex: activeRowIndex,
					row: activeRow,
				}

				const targetRow: RowPos = {
					player: opponentPlayer,
					rowIndex: opponentActiveRowIndex,
					row: opponentActiveRow,
				}

				const statusEffectAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: sourceRow,
					target: targetRow,
					type: 'status-effect',
				})
				statusEffectAttack.addDamage(this.props.id, 140)

				opponentPlayer.hooks.afterAttack.remove(instance)
				executeAttacks(game, [statusEffectAttack], true)
			}
		})

		player.hooks.onTurnStart.add(instance, () => {
			dealDamageNextTurn = false
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
	}
}

export default BigBSt4tzRareHermitCard
