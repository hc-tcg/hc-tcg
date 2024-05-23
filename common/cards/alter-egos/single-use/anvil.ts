import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import {hasActive} from '../../../utils/game'
import SingleUseCard from '../../base/single-use-card'

class AnvilSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'anvil',
			numericId: 138,
			name: 'Anvil',
			rarity: 'rare',
			description:
				'Do 30hp damage to the Hermit card directly opposite your active Hermit on the game board and 10hp damage to each Hermit below it.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const activeIndex = activePos.rowIndex

			const opponentRows = opponentPlayer.board.rows

			const attacks = []
			for (let i = activeIndex; i < opponentRows.length; i++) {
				const opponentRow = opponentRows[i]
				if (!opponentRow || !opponentRow.hermitCard) continue
				const attack = new AttackModel({
					id: this.getInstanceKey(instance, activeIndex === i ? 'active' : 'inactive'),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: i,
						row: opponentRow,
					},
					type: 'effect',
					log: (values) =>
						game.battleLog.createEffectEntry() +
						`to attack ${values.target} for $b${values.damage}hp$ damage`,
				}).addDamage(this.id, i === activeIndex ? 30 : 10)

				attacks.push(attack)
			}

			while (attacks.length > 1) {
				attacks[1].log = (values) => `, $o${values.target}$ for $b${values.damage}hp$ damage`
				attacks[0].addNewAttack(attacks[1])
				attacks.splice(1, 1)
			}

			return attacks
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance, 'active')
			const inactiveAttackId = this.getInstanceKey(instance, 'active')
			if (attack.id !== attackId && attackId !== inactiveAttackId) return

			applySingleUse(game)

			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)

		const targetsKey = this.getInstanceKey(instance, 'targets')
		delete player.custom[targetsKey]
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)

		const {player} = pos
		if (!hasActive(player)) result.push('UNMET_CONDITION')

		return result
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override canAttack() {
		return true
	}
}

export default AnvilSingleUseCard
