import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRowPos, getNonEmptyRows} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class SplashPotionOfHarmingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_harming',
			numericId: 226,
			name: 'Splash potion of harming',
			rarity: 'common',
			description:
				"Deal 40hp damage to the opponent's active hermit and 20hp damage to all other opponent Hermits.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentRows = getNonEmptyRows(opponentPlayer)

			const attacks: Array<AttackModel> = []

			for (let i = 0; i < opponentRows.length; i++) {
				const row = opponentRows[i]
				let damage = 20
				if (opponentPlayer.board.activeRow === row.rowIndex) {
					damage = 40
				}
				const attack = new AttackModel({
					id: this.getInstanceKey(instance, 'attack'),
					attacker: activePos,
					target: row,
					type: 'effect',
				}).addDamage(this.id, damage)

				attacks.push(attack)
			}

			return attacks
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.id !== attackId) return

			// We've executed our attack, apply effect
			applySingleUse(game)

			// Only apply once

			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}
}

export default SplashPotionOfHarmingSingleUseCard
