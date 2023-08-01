import {AttackModel} from '../../models/attack-model'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, getActiveRowPos, getNonEmptyRows} from '../../utils/board'
import {flipCoin} from '../../utils/coinFlips'
import SingleUseCard from '../base/single-use-card'

class EggSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'egg',
			name: 'Egg',
			rarity: 'rare',
			description:
				'After your attack, choose one of your opponent AFK Hermits to make active.\n\nFlip a coin. If heads, also do 10hp damage to that Hermit.',

			pickOn: 'attack',
			pickReqs: [{target: 'opponent', slot: ['hermit'], amount: 1, active: false}],
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(instance, (attack, pickedSlots) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const pickedSlot = pickedSlots[this.id]
			if (!pickedSlot || pickedSlot.length !== 1) return
			const pickedHermit = pickedSlot[0]
			if (!pickedHermit.row || !pickedHermit.row.state.hermitCard) return
			const pickedPlayer = game.state.players[pickedHermit.playerId]

			applySingleUse(game)

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'heads') {
				const eggAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: activePos,
					target: {
						player: pickedPlayer,
						rowIndex: pickedHermit.row.index,
						row: pickedHermit.row.state,
					},
					type: 'effect',
				}).addDamage(this.id, 10)

				attack.addNewAttack(eggAttack)
			}

			player.custom[this.getInstanceKey(instance)] = pickedHermit.row.index

			// Only do this once if there are multiple attacks
			player.hooks.onAttack.remove(instance)
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			const eggIndex = player.custom[this.getInstanceKey(instance)]
			opponentPlayer.board.activeRow = eggIndex
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos

		const inactiveHermits = getNonEmptyRows(opponentPlayer, false)
		if (inactiveHermits.length === 0) return 'NO'

		return 'YES'
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default EggSingleUseCard
