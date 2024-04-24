import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class TNTSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'tnt',
			numericId: 100,
			name: 'TNT',
			rarity: 'common',
			description: 'Do an additional 60hp damage. Your active Hermit also takes 20hp damage.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return []

			const tntAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
			}).addDamage(this.id, 60)

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: activePos,
				target: activePos,
				type: 'effect',
				isBacklash: true,
			}).addDamage(this.id, 20)

			tntAttack.addNewAttack(backlashAttack)

			return [tntAttack]
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const backlashId = this.getInstanceKey(instance, 'backlash')
			if (attack.id !== backlashId) return

			// We've executed our final attack, apply effect
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

export default TNTSingleUseCard
