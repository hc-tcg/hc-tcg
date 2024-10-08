import {CardComponent} from '../../components'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {executeAttacks} from '../../../utils/attacks'
import CardOld from '../../base/card'
import {hermit} from '../defaults'
import {Hermit} from '../types'

class BigBSt4tzRare extends CardOld {
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
			power:
				"When BigB is knocked out, deal 140 damage to the opponent's active Hermit.",
		},
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player, opponentPlayer, rowId: row} = pos

		let dealDamageNextTurn = false

		player.hooks.onAttack.add(component, (attack) => {
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'secondary'
			)
				return
			dealDamageNextTurn = true
		})

		// Add before so health can be checked reliably
		opponentPlayer.hooks.afterAttack.addBefore(component, () => {
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
					id: this.getInstanceKey(component),
					attacker: sourceRow,
					target: targetRow,
					type: 'status-effect',
				})
				statusEffectAttack.addDamage(this.props.id, 140)

				opponentPlayer.hooks.afterAttack.remove(component)
				executeAttacks(game, [statusEffectAttack], true)
			}
		})

		player.hooks.onTurnStart.add(component, () => {
			dealDamageNextTurn = false
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.remove(component)
		opponentPlayer.hooks.onAttack.remove(component)
		opponentPlayer.hooks.onTurnEnd.remove(component)
	}
}

export default BigBSt4tzRare
