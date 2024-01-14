import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {RowStateWithHermit} from '../../../types/game-state'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
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

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)

			const attacks: Array<AttackModel> = []
			for (let i = 0; i < opponentPlayer.board.rows.length; i++) {
				if (!opponentPlayer.board.rows[i].hermitCard) continue
				let damage = 20
				if (i === opponentPlayer.board.activeRow) damage = 40
				attacks.push(
					new AttackModel({
						id: this.getInstanceKey(instance),
						attacker: activePos,
						target: {
							player: opponentPlayer,
							rowIndex: i,
							row: opponentPlayer.board.rows[i] as RowStateWithHermit,
						},
						type: 'effect',
					}).addDamage(this.id, damage)
				)
			}

			return attacks
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)

			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)
	}

	override canAttack() {
		return true
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}
}

export default SplashPotionOfHarmingSingleUseCard
