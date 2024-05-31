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
			description:
				"Do 60hp damage to your opponent's active Hermit. Your active Hermit also takes 20hp damage.",
			log: null,
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttack.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return null

			const tntAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage `,
			}).addDamage(this.id, 60)

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: activePos,
				target: activePos,
				type: 'effect',
				isBacklash: true,
				log: (values) => `and took ${values.damage} backlash damage`,
			}).addDamage(this.id, 20)

			tntAttack.addNewAttack(backlashAttack)

			return tntAttack
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const backlashId = this.getInstanceKey(instance, 'backlash')
			if (attack.id !== backlashId) return

			// We've executed our attack, apply effect
			applySingleUse(game)
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
}

export default TNTSingleUseCard
