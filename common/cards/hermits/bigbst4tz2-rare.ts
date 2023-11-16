import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import HermitCard from '../base/hermit-card'
import {flipCoin} from '../../utils/coinFlips'
import {AttackModel} from '../../models/attack-model'

class BigBSt4tzRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'bigbst4tz2_rare',
			numericId: 163,
			name: 'BigB',
			rarity: 'rare',
			hermitType: 'speedrunner',
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
					"If this Hermit is knocked out next turn, flip a coin.\n\nIf heads, the opponent's active Hermit is knocked out.",
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			player.custom[reviveNextTurn] = true
		})

		opponentPlayer.hooks.beforeAttack.add(instance, () => {
			opponentPlayer.hooks.onAttack.add(instance, (attack) => {
				if (!player.custom[reviveNextTurn]) return
				if (!row || row.health === null || row.health > attack.calculateDamage()) return

				const opponentRowIndex = opponentPlayer.board.activeRow
				if (!opponentRowIndex) return

				const opponentActiveRow = opponentPlayer.board.rows[opponentRowIndex]
				if (!opponentActiveRow || opponentActiveRow.health === null) return

				const coinFlip = flipCoin(opponentPlayer, this.id)
				if (coinFlip[0] === 'tails') return

				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					attacker: attack.target,
					target: attack.attacker,
					type: 'secondary',
					isBacklash: true,
				}).addDamage(this.id, opponentActiveRow.health)

				attack.addNewAttack(backlashAttack)

				return attack
			})
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			opponentPlayer.hooks.onAttack.remove(instance)
			delete player.custom[reviveNextTurn]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		// Remove hooks
		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[reviveNextTurn]
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'advent_of_tcg'
	}

	override getBackground() {
		return 'advent_of_tcg'
	}
}

export default BigBSt4tzRareHermitCard
