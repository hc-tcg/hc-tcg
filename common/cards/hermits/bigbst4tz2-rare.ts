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
				power: "When BigB is knocked out, deal 140 damage to the opponent's active Hermit.",
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row} = pos
		const dealDamageNextTurn = this.getInstanceKey(instance, 'dealDamageNextTurn')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			player.custom[dealDamageNextTurn] = true
		})

		opponentPlayer.hooks.beforeAttack.add(instance, () => {
			opponentPlayer.hooks.onAttack.add(instance, (attack) => {
				if (!player.custom[dealDamageNextTurn]) return
				if (!row || row.health === null || row.health > attack.calculateDamage()) return
				if (attack.isBacklash === true) return

				const opponentRowIndex = opponentPlayer.board.activeRow
				if (!opponentRowIndex) return

				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					attacker: attack.target,
					target: attack.attacker,
					type: 'secondary',
					isBacklash: true,
				}).addDamage(this.id, 140)

				attack.addNewAttack(backlashAttack)

				return attack
			})
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			opponentPlayer.hooks.onAttack.remove(instance)
			delete player.custom[dealDamageNextTurn]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		// Remove hooks
		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.beforeAttack.remove(instance)
		opponentPlayer.hooks.onAttack.remove(instance)
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
