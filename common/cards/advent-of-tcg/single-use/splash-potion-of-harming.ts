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

		player.hooks.getAttack.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null
			const activeIndex = activePos.rowIndex
			const opponentRows = opponentPlayer.board.rows

			const attack = opponentRows.reduce((r: null | AttackModel, row, i) => {
				if (!row || !row.hermitCard) return r
				const newAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: i,
						row: row,
					},
					type: 'effect',
					log: (values) =>
						i === activeIndex
							? `${values.defaultLog} to attack ${values.target} for ${values.damage} damage`
							: `, ${values.target} for ${values.damage} damage`,
				}).addDamage(this.id, 40)
				if (r) return r.addNewAttack(newAttack)
				return newAttack
			}, null)

			return attack
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
		player.hooks.getAttack.remove(instance)
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
