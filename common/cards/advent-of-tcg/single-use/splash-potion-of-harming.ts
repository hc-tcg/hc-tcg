import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class SplashPotionOfHarmingSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'splash_potion_of_harming',
		numericId: 226,
		name: 'Splash potion of harming',
		expansion: 'advent_of_tcg',
		rarity: 'common',
		tokens: 3,
		description:
			"Deal 40hp damage to the opponent's active hermit and 20hp damage to all other opponent Hermits.",
		hasAttack: true,
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
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
				}).addDamage(this.props.id, 40)
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

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttack.remove(instance)
		player.hooks.onAttack.remove(instance)
	}
}

export default SplashPotionOfHarmingSingleUseCard
