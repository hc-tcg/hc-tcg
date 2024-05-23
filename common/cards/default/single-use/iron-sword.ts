import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class IronSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'iron_sword',
			numericId: 46,
			name: 'Iron Sword',
			rarity: 'common',
			description: "Do 20hp damage to your opponent's active Hermit.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return []

			const swordAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
			}).addDamage(this.id, 20)

			return [swordAttack]
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.id !== attackId) return

			// We've executed our attack, apply effect
			const opponentActiveHermitId = getActiveRowPos(opponentPlayer)?.row.hermitCard.cardId
			applySingleUse(game, [
				[`to attack `, 'plain'],
				[`${opponentActiveHermitId ? CARDS[opponentActiveHermitId].name : ''} `, 'opponent'],
			])
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
}

export default IronSwordSingleUseCard
