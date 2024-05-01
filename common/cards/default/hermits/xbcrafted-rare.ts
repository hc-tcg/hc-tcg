import {CardPosModel, getCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import HermitCard from '../../base/hermit-card'
import {isTargetingPos} from '../../../utils/attacks'
import {getActiveRowPos} from '../../../utils/board'
class XBCraftedRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xbcrafted_rare',
			numericId: 110,
			name: 'XB',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 270,
			primary: {
				name: 'Giggle',
				cost: ['explorer'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Noice!',
				cost: ['explorer', 'any'],
				damage: 70,
				power:
					"Any effect cards attached to your opponent's active Hermit are ignored during this turn.",
			},
		})
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType)

		if (attacks[0].type === 'secondary') {
			// Noice attack, set flag to ignore target effect card
			pos.player.custom[this.getInstanceKey(instance, 'ignore')] = true
		}

		const newAttacks = [attacks[0]]

		return newAttacks
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const ignoreKey = this.getInstanceKey(instance, 'ignore')

		player.hooks.beforeAttack.addBefore(instance, (attack) => {
			if (!player.custom[ignoreKey]) return
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return

			// All attacks from our side should ignore opponent attached effect card this turn
			attack.shouldIgnoreCards.push((instance) => {
				const pos = getCardPos(game, instance)
				if (!pos || !attack.getTarget()) return false

				const isTargeting = isTargetingPos(attack, opponentActivePos)
				if (isTargeting && pos.slot.type === 'effect') {
					// It's the targets effect card, ignore it
					return true
				}

				return false
			})
		})

		player.hooks.onTurnEnd.add(instance, () => {
			// Remove ignore flag
			if (player.custom[ignoreKey]) {
				delete player.custom[ignoreKey]
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// Remove hooks
		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default XBCraftedRareHermitCard
